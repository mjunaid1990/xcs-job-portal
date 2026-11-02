"use server";

import { auth } from "@/server/lib/auth";
import { MessagingService } from "@/server/services/messaging.service";
import { NotificationService } from "@/server/services/notification.service";
import { revalidatePath } from "next/cache";

export interface MessageActionResult {
  success: boolean;
  conversationId?: string;
  message?: {
    id: string;
    conversationId?: string;
    senderId: string;
    body: string;
    clientMsgId?: string;
    readAt: string | Date | null;
    createdAt: string | Date;
    sender: { id: string; name: string };
  };
  error?: string;
}

export async function sendMessageAction(
  prevState: MessageActionResult | null,
  formData: FormData,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const conversationId = formData.get("conversationId")?.toString();
  const body = formData.get("body")?.toString();
  const clientMsgId = formData.get("clientMsgId")?.toString();

  if (!conversationId || !body) {
    return { success: false, error: "Message body is required." };
  }

  try {
    const createdMsg = await MessagingService.sendMessage(
      session.user.id,
      conversationId,
      body,
      clientMsgId,
    );
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return {
      success: true,
      conversationId,
      message: {
        id: createdMsg.id,
        conversationId: createdMsg.conversationId,
        senderId: createdMsg.senderId,
        body: createdMsg.body,
        clientMsgId: createdMsg.clientMsgId ?? undefined,
        readAt: createdMsg.readAt,
        createdAt: createdMsg.createdAt,
        sender: createdMsg.sender,
      },
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to send message." };
  }
}

export async function startConversationAction(
  clientId: string,
  freelancerId: string,
  jobId?: string,
  contractId?: string,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const effectiveClientId = clientId || session.user.id;

  try {
    const conv = await MessagingService.getOrCreateConversation(
      effectiveClientId,
      freelancerId,
      jobId,
      contractId,
    );
    revalidatePath("/messages");
    return { success: true, conversationId: conv.id };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to open conversation." };
  }
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || !conversationId) return;

  await MessagingService.markConversationAsRead(conversationId, session.user.id);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}

export async function getUnreadMessagesCountAction(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return MessagingService.getUnreadCount(session.user.id);
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await NotificationService.markRead(session.user.id, notificationId);
  revalidatePath("/notifications");
}
