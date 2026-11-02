import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/lib/auth";
import { MessagingService } from "@/server/services/messaging.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const since = searchParams.get("since") ?? undefined;

  if (!conversationId) {
    return NextResponse.json(
      { success: false, error: "conversationId is required" },
      { status: 400 },
    );
  }

  try {
    const messages = await MessagingService.getMessagesSince(
      conversationId,
      session.user.id,
      since,
    );
    return NextResponse.json({ success: true, messages });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bodyJson = await req.json();
    const { conversationId, body, clientMsgId } = bodyJson;

    if (!conversationId || !body?.trim()) {
      return NextResponse.json(
        { success: false, error: "conversationId and non-empty body are required" },
        { status: 400 },
      );
    }

    const message = await MessagingService.sendMessage(
      session.user.id,
      conversationId,
      body,
      clientMsgId,
    );

    return NextResponse.json({ success: true, message });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
