import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessagingService } from "@/server/services/messaging.service";
import { prisma } from "@/server/db/prisma";
import { chatBus } from "@/server/lib/chat-bus";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    conversation: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("Real-Time Messaging Service & Chat Bus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateConversation", () => {
    it("throws error when trying to start a conversation with oneself", async () => {
      await expect(MessagingService.getOrCreateConversation("user-1", "user-1")).rejects.toThrow(
        "Cannot chat with yourself.",
      );
    });

    it("returns existing conversation when found", async () => {
      const mockConv = {
        id: "conv-123",
        clientId: "client-1",
        freelancerId: "freelancer-1",
        contractId: null,
      };

      (
        vi.mocked(prisma.conversation.findFirst) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockConv);

      const conv = await MessagingService.getOrCreateConversation("client-1", "freelancer-1");
      expect(conv).toEqual(mockConv);
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it("creates a new conversation if none exists", async () => {
      (
        vi.mocked(prisma.conversation.findFirst) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(null);

      const newConv = {
        id: "conv-456",
        clientId: "client-1",
        freelancerId: "freelancer-2",
        jobId: "job-1",
        contractId: "contract-1",
      };

      (
        vi.mocked(prisma.conversation.create) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(newConv);

      const conv = await MessagingService.getOrCreateConversation(
        "client-1",
        "freelancer-2",
        "job-1",
        "contract-1",
      );
      expect(conv).toEqual(newConv);
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          clientId: "client-1",
          freelancerId: "freelancer-2",
          jobId: "job-1",
          contractId: "contract-1",
        },
        include: expect.any(Object),
      });
    });
  });

  describe("sendMessage & real-time dispatch", () => {
    it("rejects empty message body", async () => {
      await expect(MessagingService.sendMessage("sender-1", "conv-1", "   ")).rejects.toThrow(
        "Message body cannot be empty.",
      );
    });

    it("rejects message if sender is not part of the conversation", async () => {
      (
        vi.mocked(prisma.conversation.findUnique) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: "conv-1",
        clientId: "client-1",
        freelancerId: "freelancer-1",
        client: { id: "client-1", name: "Client A" },
        freelancer: { id: "freelancer-1", name: "Freelancer B" },
      });

      await expect(
        MessagingService.sendMessage("unauthorized-user", "conv-1", "Hello"),
      ).rejects.toThrow("Conversation not found or unauthorized.");
    });

    it("persists message and emits event over real-time chat bus", async () => {
      const conv = {
        id: "conv-1",
        clientId: "client-1",
        freelancerId: "freelancer-1",
        client: { id: "client-1", name: "Client Alice" },
        freelancer: { id: "freelancer-1", name: "Freelancer Bob" },
      };

      (
        vi.mocked(prisma.conversation.findUnique) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(conv);

      const createdMsg = {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "client-1",
        body: "Hello Bob, please review the milestone.",
        clientMsgId: "cli-123",
        readAt: null,
        createdAt: new Date(),
        sender: { id: "client-1", name: "Client Alice" },
      };

      (
        vi.mocked(prisma.message.create) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(createdMsg);

      let emittedPayload: unknown = null;
      const listener = (payload: unknown) => {
        emittedPayload = payload;
      };
      chatBus.on("message:conv-1", listener);

      const result = await MessagingService.sendMessage(
        "client-1",
        "conv-1",
        "Hello Bob, please review the milestone.",
        "cli-123",
      );

      chatBus.off("message:conv-1", listener);

      expect(result.id).toBe("msg-1");
      expect(result.body).toBe("Hello Bob, please review the milestone.");
      expect(emittedPayload).toMatchObject({
        id: "msg-1",
        body: "Hello Bob, please review the milestone.",
      });
    });
  });

  describe("getMessages & unread tracking", () => {
    it("marks incoming unread messages as read and returns message history", async () => {
      (
        vi.mocked(prisma.conversation.findUnique) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        id: "conv-1",
        clientId: "client-1",
        freelancerId: "freelancer-1",
      });

      (
        vi.mocked(prisma.message.updateMany) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({ count: 2 });

      const mockMessages = [
        {
          id: "m1",
          conversationId: "conv-1",
          senderId: "freelancer-1",
          body: "Deliverables are submitted",
          clientMsgId: "c1",
          readAt: new Date(),
          createdAt: new Date(),
          sender: { id: "freelancer-1", name: "Bob" },
        },
      ];

      (
        vi.mocked(prisma.message.findMany) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockMessages);

      const messages = await MessagingService.getMessages("conv-1", "client-1");
      expect(messages).toHaveLength(1);
      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId: "conv-1",
          senderId: { not: "client-1" },
          readAt: null,
        },
        data: { readAt: expect.any(Date) },
      });
    });

    it("calculates total unread messages count for a user across conversations", async () => {
      (
        vi.mocked(prisma.message.count) as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(5);

      const unreadCount = await MessagingService.getUnreadCount("user-1");
      expect(unreadCount).toBe(5);
      expect(prisma.message.count).toHaveBeenCalledWith({
        where: {
          conversation: {
            OR: [{ clientId: "user-1" }, { freelancerId: "user-1" }],
          },
          senderId: { not: "user-1" },
          readAt: null,
          deletedAt: null,
        },
      });
    });
  });
});
