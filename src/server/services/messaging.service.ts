import crypto from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { sanitizeHtml } from "@/server/lib/sanitize";
import { chatBus } from "@/server/lib/chat-bus";

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  clientMsgId: string;
  readAt: Date | null;
  createdAt: Date;
  sender: { id: string; name: string };
}

export interface UserConversation {
  id: string;
  clientId: string;
  freelancerId: string;
  jobId: string | null;
  contractId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
  client: { id: string; name: string; email: string };
  freelancer: { id: string; name: string; email: string };
  job?: { id: string; title: string } | null;
  contract?: { id: string; status: string } | null;
  messages: Array<{
    id: string;
    body: string;
    createdAt: Date;
    senderId: string;
    readAt: Date | null;
  }>;
}

export class MessagingService {
  /**
   * Retrieves or creates a 1:1 conversation between a client and a freelancer.
   */
  static async getOrCreateConversation(
    clientId: string,
    freelancerId: string,
    jobId?: string,
    contractId?: string,
  ) {
    if (clientId === freelancerId) {
      throw new AppError(
        "INVALID_CONVERSATION",
        "Cannot chat with yourself.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId,
        freelancerId,
        ...(jobId ? { jobId } : {}),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        contract: { select: { id: true, status: true } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          freelancerId,
          jobId,
          contractId,
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          freelancer: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true } },
          contract: { select: { id: true, status: true } },
        },
      });
    } else if (contractId && !conversation.contractId) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contractId },
        include: {
          client: { select: { id: true, name: true, email: true } },
          freelancer: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true } },
          contract: { select: { id: true, status: true } },
        },
      });
    }

    return conversation;
  }

  /**
   * Sends a message within a conversation and broadcasts via real-time stream.
   */
  static async sendMessage(
    senderId: string,
    conversationId: string,
    bodyInput: string,
    clientMsgId?: string,
  ): Promise<MessageWithSender> {
    const body = sanitizeHtml(bodyInput);
    if (!body || body.length === 0) {
      throw new AppError(
        "EMPTY_MESSAGE",
        "Message body cannot be empty.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!conv || (conv.clientId !== senderId && conv.freelancerId !== senderId)) {
      throw new AppError(
        "UNAUTHORIZED",
        "Conversation not found or unauthorized.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const recipientId = conv.clientId === senderId ? conv.freelancerId : conv.clientId;
    const senderName = conv.clientId === senderId ? conv.client.name : conv.freelancer.name;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const msgId = clientMsgId && UUID_REGEX.test(clientMsgId) ? clientMsgId : crypto.randomUUID();

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId,
          body,
          clientMsgId: msgId,
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      await tx.notification.create({
        data: {
          userId: recipientId,
          type: "NEW_MESSAGE",
          payload: {
            conversationId,
            senderName,
            preview: body.slice(0, 100),
          },
        },
      });

      return created;
    });

    // Real-time broadcast to connected SSE streams
    chatBus.notifyMessage(conversationId, {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      clientMsgId: message.clientMsgId,
      readAt: message.readAt,
      createdAt: message.createdAt,
      sender: message.sender,
    });

    return message;
  }

  /**
   * Retrieves messages for a conversation, auto-marking incoming messages as read.
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
  ): Promise<MessageWithSender[]> {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.clientId !== userId && conv.freelancerId !== userId)) {
      throw new AppError("UNAUTHORIZED", "Conversation not found.", HTTP_STATUS.FORBIDDEN);
    }

    // Mark unread messages sent by the other party as read
    const updateResult = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    if (updateResult.count > 0) {
      chatBus.notifyRead(conversationId, userId);
    }

    return prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Retrieves messages sent after a specific timestamp or ID for live polling & stream catchup.
   */
  static async getMessagesSince(
    conversationId: string,
    userId: string,
    sinceTimestamp?: string | Date,
  ): Promise<MessageWithSender[]> {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.clientId !== userId && conv.freelancerId !== userId)) {
      throw new AppError("UNAUTHORIZED", "Conversation not found.", HTTP_STATUS.FORBIDDEN);
    }

    const whereClause: {
      conversationId: string;
      deletedAt: null;
      createdAt?: { gt: Date };
    } = {
      conversationId,
      deletedAt: null,
    };

    if (sinceTimestamp) {
      const parsedDate = new Date(sinceTimestamp);
      if (!isNaN(parsedDate.getTime())) {
        whereClause.createdAt = { gt: parsedDate };
      }
    }

    // Auto-mark incoming as read
    const updateResult = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    if (updateResult.count > 0) {
      chatBus.notifyRead(conversationId, userId);
    }

    return prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Retrieves all conversations for a user with unread message counts.
   */
  static async getUserConversations(userId: string): Promise<UserConversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        contract: { select: { id: true, status: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, body: true, createdAt: true, senderId: true, readAt: true },
        },
      },
    });

    // Compute unread message counts for each conversation
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: userId },
        readAt: null,
        deletedAt: null,
      },
      _count: { id: true },
    });

    const unreadMap = new Map<string, number>();
    for (const item of unreadCounts) {
      unreadMap.set(item.conversationId, item._count.id);
    }

    return conversations.map((conv) => ({
      ...conv,
      unreadCount: unreadMap.get(conv.id) ?? 0,
    }));
  }

  /**
   * Counts the total number of unread messages across all conversations for a user.
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        conversation: {
          OR: [{ clientId: userId }, { freelancerId: userId }],
        },
        senderId: { not: userId },
        readAt: null,
        deletedAt: null,
      },
    });
  }

  /**
   * Explicitly marks all messages in a conversation as read by the user.
   */
  static async markConversationAsRead(conversationId: string, userId: string): Promise<number> {
    const updated = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    if (updated.count > 0) {
      chatBus.notifyRead(conversationId, userId);
    }

    return updated.count;
  }
}
