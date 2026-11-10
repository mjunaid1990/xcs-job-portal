"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversationAction } from "@/server/actions/messaging.actions";
import { MessageSquare, Loader2 } from "lucide-react";

interface MessageFreelancerButtonProps {
  clientId?: string;
  freelancerId: string;
  freelancerName: string;
  className?: string;
}

export function MessageFreelancerButton({
  clientId,
  freelancerId,
  freelancerName,
  className,
}: MessageFreelancerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStartChat = () => {
    if (!clientId) {
      router.push(`/login?redirect=/freelancers/${freelancerId}`);
      return;
    }

    startTransition(async () => {
      const res = await startConversationAction(clientId, freelancerId);
      if (res.success && res.conversationId) {
        router.push(`/messages/${res.conversationId}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleStartChat}
      disabled={isPending}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition disabled:opacity-50"
      }
      title={`Send a direct message to ${freelancerName}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-700 dark:text-zinc-300" />
      ) : (
        <MessageSquare className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
      )}
      <span>Message Specialist</span>
    </button>
  );
}
