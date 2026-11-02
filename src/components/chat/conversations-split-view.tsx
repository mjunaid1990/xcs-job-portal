"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatBox, MessageItem } from "@/components/chat/chat-box";
import { Search, MessageSquare, Briefcase, ArrowLeft, Sparkles } from "lucide-react";

export interface ConversationItem {
  id: string;
  clientId: string;
  freelancerId: string;
  lastMessageAt: Date | string | null;
  unreadCount: number;
  client: { id: string; name: string; email?: string };
  freelancer: { id: string; name: string; email?: string };
  job?: { id: string; title: string } | null;
  contract?: { id: string; status: string } | null;
  messages: Array<{
    id: string;
    body: string;
    createdAt: Date | string;
    senderId: string;
    readAt: Date | string | null;
  }>;
}

interface ConversationsSplitViewProps {
  conversations: ConversationItem[];
  currentUserId: string;
  activeConversationId?: string;
  activeMessages?: MessageItem[];
}

export function ConversationsSplitView({
  conversations,
  currentUserId,
  activeConversationId,
  activeMessages = [],
}: ConversationsSplitViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const partner = c.clientId === currentUserId ? c.freelancer : c.client;
      const partnerName = partner?.name?.toLowerCase() ?? "";
      const jobTitle = c.job?.title?.toLowerCase() ?? "";
      const lastMsg = c.messages[0]?.body?.toLowerCase() ?? "";
      return partnerName.includes(q) || jobTitle.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, currentUserId, searchQuery]);

  const activePartner = activeConv
    ? activeConv.clientId === currentUserId
      ? activeConv.freelancer
      : activeConv.client
    : null;

  const isClient = activeConv?.clientId === currentUserId;
  const partnerRole = isClient ? "Freelancer Specialist" : "Client";

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Column: Conversations List */}
        <div
          className={`md:col-span-5 lg:col-span-4 border-r border-zinc-100 dark:border-zinc-800 flex flex-col ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Conversations</span>
              </h2>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {conversations.length}
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or projects..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Conversations Scroll Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[580px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                {searchQuery
                  ? "No conversations match your search query."
                  : "No conversations yet. When clients or freelancers message you regarding a job or proposal, they will appear here."}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.clientId === currentUserId ? conv.freelancer : conv.client;
                const lastMsg = conv.messages[0];
                const isActive = conv.id === activeConversationId;
                const unread = conv.unreadCount ?? 0;

                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className={`flex items-start gap-3 p-4 transition text-left group ${
                      isActive
                        ? "bg-purple-50/70 dark:bg-purple-950/30 border-l-4 border-purple-600"
                        : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-xs shadow-xs">
                        {partner?.name?.slice(0, 2).toUpperCase() ?? "WW"}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-zinc-900">
                          {unread}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3
                          className={`text-xs font-bold truncate ${
                            isActive
                              ? "text-purple-950 dark:text-purple-200"
                              : "text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                          }`}
                        >
                          {partner?.name}
                        </h3>
                        {lastMsg && (
                          <span className="text-[10px] text-zinc-400 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {conv.job && (
                        <p className="mt-0.5 truncate text-[10px] font-medium text-purple-600 dark:text-purple-400">
                          {conv.job.title}
                        </p>
                      )}

                      <p
                        className={`mt-1 line-clamp-1 text-xs ${
                          unread > 0
                            ? "font-semibold text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500"
                        }`}
                      >
                        {lastMsg?.body || "Start the conversation..."}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Box or Empty State */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col ${
            !activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConv && activePartner ? (
            <div className="flex flex-col h-full">
              {/* Active Conversation Top Bar */}
              <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800 sm:px-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/messages")}
                    className="md:hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-xs shadow-xs">
                    {activePartner.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {activePartner.name}
                      </h2>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {partnerRole}
                      </span>
                    </div>

                    {activeConv.job && (
                      <Link
                        href={`/jobs/${activeConv.job.id}`}
                        className="text-[11px] font-medium text-purple-600 hover:underline dark:text-purple-400 line-clamp-1"
                      >
                        Regarding: {activeConv.job.title}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Counterpart Quick Actions */}
                <div className="flex items-center gap-2">
                  {activeConv.contract && (
                    <Link
                      href={`/contracts/${activeConv.contract.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                      <span>View Contract</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Real-time Chat Box Stream */}
              <ChatBox
                conversationId={activeConv.id}
                currentUserId={currentUserId}
                initialMessages={activeMessages}
                partnerName={activePartner.name}
                partnerRole={partnerRole}
                jobTitle={activeConv.job?.title}
                contractId={activeConv.contract?.id}
              />
            </div>
          ) : (
            /* Empty State on Desktop when no conversation is selected */
            <div className="flex h-full flex-col items-center justify-center p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 mb-4 shadow-xs">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Select a Conversation
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm leading-relaxed">
                Choose an ongoing discussion from the inbox on the left, or initiate new
                conversations directly from job proposals and contract workrooms.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-xs transition"
                >
                  <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                  <span>Browse Jobs</span>
                </Link>
                <Link
                  href="/freelancers"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-xs transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Discover Talent</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
