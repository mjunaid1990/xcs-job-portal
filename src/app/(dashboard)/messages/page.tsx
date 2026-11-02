import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { MessagingService } from "@/server/services/messaging.service";
import { ConversationsSplitView } from "@/components/chat/conversations-split-view";

export const metadata = {
  title: "Direct Messages & Real-Time Chat · WorkWasl",
  description:
    "Secure, real-time communications for milestone deliverables and freelance contracts.",
};

export default async function MessagesHubPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations = await MessagingService.getUserConversations(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Direct Messages
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Live, encrypted real-time communications between clients and verified specialists.
        </p>
      </div>

      <ConversationsSplitView conversations={conversations} currentUserId={session.user.id} />
    </div>
  );
}
