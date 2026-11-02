"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { sendMessageAction, markConversationReadAction } from "@/server/actions/messaging.actions";
import { Send, Loader2, Check, CheckCheck, Wifi, WifiOff, Sparkles, ArrowDown } from "lucide-react";

export interface MessageItem {
  id: string;
  conversationId?: string;
  senderId: string;
  body: string;
  clientMsgId?: string;
  readAt?: Date | string | null;
  createdAt: Date | string;
  sender: { id: string; name: string };
}

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageItem[];
  partnerName?: string;
  partnerRole?: string;
  jobTitle?: string;
  contractId?: string | null;
}

const CANNED_RESPONSES = [
  "Could you please review the latest milestone scope?",
  "Deliverables submitted for review, please check the files.",
  "Let's hop on a live contract workroom huddle to align.",
  "Thanks for the update, working on the adjustments now!",
];

export function ChatBox({
  conversationId,
  currentUserId,
  initialMessages,
  partnerName,
  partnerRole,
  jobTitle,
  contractId,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showQuickChips, setShowQuickChips] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchedTimeRef = useRef<string>(
    initialMessages.length > 0
      ? new Date(initialMessages[initialMessages.length - 1].createdAt).toISOString()
      : new Date(0).toISOString(),
  );

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setShowScrollBottom(false);
  }, []);

  // Check scroll position to display "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isAtBottom);
  };

  // Scroll to bottom on initial render
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // Real-time Server-Sent Events (SSE) Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackPollInterval: NodeJS.Timeout | null = null;

    const setupSSE = () => {
      try {
        eventSource = new EventSource(`/api/messages/stream?conversationId=${conversationId}`);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "new_message" && data.message) {
              const incomingMsg = data.message as MessageItem;
              setMessages((prev) => {
                // Deduplicate by id or clientMsgId
                if (
                  prev.some(
                    (m) =>
                      m.id === incomingMsg.id ||
                      (incomingMsg.clientMsgId && m.clientMsgId === incomingMsg.clientMsgId),
                  )
                ) {
                  return prev.map((m) =>
                    m.clientMsgId === incomingMsg.clientMsgId ? incomingMsg : m,
                  );
                }
                return [...prev, incomingMsg];
              });

              lastFetchedTimeRef.current = new Date(incomingMsg.createdAt).toISOString();

              // If message is from partner and user has window active, mark read
              if (incomingMsg.senderId !== currentUserId) {
                markConversationReadAction(conversationId);
              }

              // Auto scroll if user was near bottom
              if (!showScrollBottom) {
                setTimeout(() => scrollToBottom(true), 50);
              }
            } else if (data.type === "read_receipt") {
              // Mark all messages by current user as read
              setMessages((prev) =>
                prev.map((m) =>
                  m.senderId === currentUserId && !m.readAt
                    ? { ...m, readAt: data.readAt || new Date().toISOString() }
                    : m,
                ),
              );
            }
          } catch {
            // Ignore parse errors (e.g. ping/heartbeat comments)
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
        };
      } catch {
        setIsConnected(false);
      }
    };

    setupSSE();

    // Secondary fallback polling (every 4 seconds) to guarantee sync across firewalls/proxies
    fallbackPollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages?conversationId=${conversationId}&since=${encodeURIComponent(
            lastFetchedTimeRef.current,
          )}`,
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.messages) && json.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newItems = json.messages.filter((m: MessageItem) => !existingIds.has(m.id));
              if (newItems.length === 0) return prev;
              return [...prev, ...newItems];
            });

            const latest = json.messages[json.messages.length - 1];
            lastFetchedTimeRef.current = new Date(latest.createdAt).toISOString();
            setIsConnected(true);
          }
        }
      } catch {
        // Silently continue polling
      }
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
    };
  }, [conversationId, currentUserId, showScrollBottom, scrollToBottom]);

  // Send message handler with instant optimistic UI update
  const handleSend = (overrideText?: string) => {
    const content = (overrideText ?? text).trim();
    if (!content) return;

    if (!overrideText) {
      setText("");
    }

    const tempClientMsgId = `cli-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Optimistic UI item
    const optimisticMsg: MessageItem = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      body: content,
      clientMsgId: tempClientMsgId,
      readAt: null,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: "You" },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("body", content);

    startTransition(async () => {
      await sendMessageAction(null, formData);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Real-time Status & Context Sub-Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-6 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <Wifi className="h-3 w-3" />
              <span>Real-Time Live</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-zinc-400">
              <WifiOff className="h-3 w-3" />
              <span>Polling Sync</span>
            </span>
          )}
          {partnerRole && (
            <>
              <span>•</span>
              <span className="text-zinc-500 font-medium">{partnerRole}</span>
            </>
          )}
          {jobTitle && (
            <>
              <span>•</span>
              <span className="truncate max-w-[240px] text-zinc-600 dark:text-zinc-400 font-medium">
                {jobTitle}
              </span>
            </>
          )}
          {contractId && (
            <>
              <span>•</span>
              <a
                href={`/contracts/${contractId}`}
                className="text-purple-600 hover:underline dark:text-purple-400 font-medium"
              >
                Workroom
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowQuickChips(!showQuickChips)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/40 transition"
        >
          <Sparkles className="h-3 w-3" />
          <span>{showQuickChips ? "Hide Quick Prompts" : "Quick Prompts"}</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      {showQuickChips && (
        <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 bg-purple-50/40 p-3 dark:border-zinc-800 dark:bg-purple-950/20 animate-in fade-in duration-150">
          {CANNED_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="rounded-full border border-purple-200 bg-white px-3 py-1 text-[11px] font-medium text-purple-800 shadow-xs hover:border-purple-300 hover:bg-purple-50 dark:border-purple-900/50 dark:bg-zinc-900 dark:text-purple-300 dark:hover:bg-purple-950/60 transition"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Messages Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 text-zinc-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-3 text-zinc-400">
              <Send className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Direct Conversation Ready
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              Send a message to {partnerName ?? "the recipient"} to coordinate milestones, clarify
              scope deliverables, or discuss contract terms.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            const isOptimistic = m.id.startsWith("temp-");
            const isRead = Boolean(m.readAt);

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in duration-150`}
              >
                {!isMe && (
                  <span className="mb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {partnerName ?? m.sender.name}
                  </span>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/50 dark:border-zinc-700/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span>{formatMessageTime(m.createdAt)}</span>
                  {isMe && (
                    <span className="inline-flex items-center">
                      {isOptimistic ? (
                        <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                      ) : isRead ? (
                        <span
                          className="inline-flex items-center text-indigo-500 dark:text-indigo-400"
                          title="Read by recipient"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          <span className="sr-only">Read</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-zinc-400" title="Sent">
                          <Check className="h-3 w-3" />
                          <span className="sr-only">Sent</span>
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Latest Messages</span>
          </button>
        )}
      </div>

      {/* Message Composer */}
      <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-3"
        >
          <div className="relative flex-1">
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white p-3 text-xs leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="absolute bottom-2 right-2.5 text-[10px] text-zinc-400">
              {text.length}/2000
            </div>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isPending}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
            title="Send Message"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
