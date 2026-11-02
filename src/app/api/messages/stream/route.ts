import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/lib/auth";
import { prisma } from "@/server/db/prisma";
import { chatBus, ChatMessagePayload } from "@/server/lib/chat-bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { success: false, error: "conversationId is required" },
      { status: 400 },
    );
  }

  // Verify conversation membership
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { clientId: true, freelancerId: true },
  });

  if (!conv || (conv.clientId !== session.user.id && conv.freelancerId !== session.user.id)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection ACK
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", conversationId })}\n\n`),
      );

      const messageListener = (msg: ChatMessagePayload) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "new_message", message: msg })}\n\n`),
          );
        } catch {
          // Stream already closed
        }
      };

      const readListener = (readData: { userId: string; readAt: string }) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "read_receipt", ...readData })}\n\n`),
          );
        } catch {
          // Stream already closed
        }
      };

      chatBus.on(`message:${conversationId}`, messageListener);
      chatBus.on(`read:${conversationId}`, readListener);

      // Keepalive heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15_000);

      // Cleanup when request is aborted by client
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        chatBus.off(`message:${conversationId}`, messageListener);
        chatBus.off(`read:${conversationId}`, readListener);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
