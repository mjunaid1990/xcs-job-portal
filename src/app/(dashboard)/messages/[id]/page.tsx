import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { MessagingService } from "@/server/services/messaging.service";
import { ConversationsSplitView } from "@/components/chat/conversations-split-view";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ConversationPageProps) {
  const { id } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { name: true } },
      freelancer: { select: { name: true } },
      job: { select: { title: true } },
    },
  });

  return {
    title: conv
      ? `Chat with ${conv.freelancer.name || conv.client.name} · WorkWasl`
      : "Conversation · WorkWasl",
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [conversations, conv, messages] = await Promise.all([
    MessagingService.getUserConversations(session.user.id),
    prisma.conversation.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        contract: { select: { id: true, status: true } },
      },
    }),
    MessagingService.getMessages(id, session.user.id),
  ]);

  if (!conv || (conv.clientId !== session.user.id && conv.freelancerId !== session.user.id)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ConversationsSplitView
        conversations={conversations}
        currentUserId={session.user.id}
        activeConversationId={id}
        activeMessages={messages}
      />
    </div>
  );
}
