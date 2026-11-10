"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Send, Check, CheckCheck, Loader2, ArrowDown, Sparkles, WifiOff } from "lucide-react";
import { sendMessageAction, markConversationReadAction } from "@/server/actions/messaging.actions";

export interface MessageItem {
  id: string;
  conversationId?: string;
  senderId: string;
  body: string;
  clientMsgId?: string;
  readAt: string | Date | null;
  createdAt: string | Date;
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
  "Let's hop on a quick workroom huddle to align.",
  "Thanks for the update, working on the adjustments now!",
];

/**
 * Merges incoming messages into the existing list.
 * Deduplicates by real database id, clientMsgId, or matching optimistic temp items.
 */
function mergeMessages(current: MessageItem[], incomingList: MessageItem[]): MessageItem[] {
  const result = [...current];

  for (const inc of incomingList) {
    const existingIndex = result.findIndex((m) => {
      // 1. Direct ID match
      if (m.id === inc.id) return true;

      // 2. Client message ID match (optimistic temp replacement)
      if (inc.clientMsgId && m.clientMsgId && m.clientMsgId === inc.clientMsgId) return true;

      // 3. Fallback heuristic: temp message with same sender & body sent within 15 seconds
      if (
        m.id.startsWith("temp-") &&
        m.senderId === inc.senderId &&
        m.body.trim() === inc.body.trim() &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(inc.createdAt).getTime()) < 15000
      ) {
        return true;
      }

      return false;
    });

    if (existingIndex !== -1) {
      result[existingIndex] = inc;
    } else {
      result.push(inc);
    }
  }

  return result;
}

export function ChatBox({
  conversationId,
  currentUserId,
  initialMessages,
  partnerName,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showQuickChips, setShowQuickChips] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef<boolean>(false);
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isAtBottom);
  };

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

              setMessages((prev) => mergeMessages(prev, [incomingMsg]));
              lastFetchedTimeRef.current = new Date(incomingMsg.createdAt).toISOString();

              if (incomingMsg.senderId !== currentUserId) {
                markConversationReadAction(conversationId);
              }

              if (!showScrollBottom) {
                setTimeout(() => scrollToBottom(true), 50);
              }
            } else if (data.type === "read_receipt") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.senderId === currentUserId && !m.readAt
                    ? { ...m, readAt: data.readAt || new Date().toISOString() }
                    : m,
                ),
              );
            }
          } catch {
            // Ignore parse errors (e.g. heartbeat)
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

    // Fallback polling (every 4s) with safe deduplication
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
            setMessages((prev) => mergeMessages(prev, json.messages));
            const latest = json.messages[json.messages.length - 1];
            lastFetchedTimeRef.current = new Date(latest.createdAt).toISOString();
            setIsConnected(true);
          }
        }
      } catch {
        // Silently continue
      }
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
    };
  }, [conversationId, currentUserId, showScrollBottom, scrollToBottom]);

  // Send message handler with optimistic UI update, double-submit guard and immediate reconciliation
  const handleSend = (overrideText?: string) => {
    const content = (overrideText ?? text).trim();
    if (!content || isPending || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    if (!overrideText) {
      setText("");
    }

    const tempClientMsgId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `40000000-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`;

    const tempId = `temp-${Date.now()}`;

    // Optimistic item
    const optimisticMsg: MessageItem = {
      id: tempId,
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
    formData.append("clientMsgId", tempClientMsgId);

    startTransition(async () => {
      try {
        const res = await sendMessageAction(null, formData);
        if (res.success && res.message) {
          const confirmed = res.message as MessageItem;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId || (m.clientMsgId && m.clientMsgId === tempClientMsgId)
                ? confirmed
                : m,
            ),
          );
        }
      } catch {
        // Remove failed temp message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isPending && !isSubmittingRef.current && text.trim()) {
        handleSend();
      }
    }
  };

  const formatMessageTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Quick Prompts Drawer (toggled from composer, not taking up persistent top bar space) */}
      {showQuickChips && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/60 animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-zinc-500 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Quick Prompts:
          </span>
          {CANNED_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSend(chip);
                setShowQuickChips(false);
              }}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-emerald-400 transition"
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
        className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-4"
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
              Send a message to coordinate milestones, clarify deliverables, or discuss project
              terms.
            </p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderId === currentUserId;
            const isOptimistic = m.id.startsWith("temp-");
            const isRead = Boolean(m.readAt);

            const prev = messages[idx - 1];
            const next = messages[idx + 1];

            const isSameSenderAsPrev =
              prev &&
              prev.senderId === m.senderId &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime()) <
                120000;

            const isSameSenderAsNext =
              next &&
              next.senderId === m.senderId &&
              Math.abs(new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime()) <
                120000;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
                  isSameSenderAsPrev ? "mt-1" : "mt-3.5"
                } transition-all`}
              >
                {!isMe && !isSameSenderAsPrev && (
                  <span className="mb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {partnerName ?? m.sender.name}
                  </span>
                )}

                <div
                  className={`max-w-[78%] px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? `bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl ${
                          isSameSenderAsPrev ? "rounded-tr-md" : ""
                        } ${isSameSenderAsNext ? "rounded-br-md" : "rounded-br-xs"}`
                      : `bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl ${
                          isSameSenderAsPrev ? "rounded-tl-md" : ""
                        } ${isSameSenderAsNext ? "rounded-bl-md" : "rounded-bl-xs"}`
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>

                {!isSameSenderAsNext && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
                    <span>{formatMessageTime(m.createdAt)}</span>
                    {isMe && (
                      <span className="inline-flex items-center">
                        {isOptimistic ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-zinc-400" />
                        ) : isRead ? (
                          <span
                            className="inline-flex items-center text-emerald-500 dark:text-emerald-400"
                            title="Read"
                          >
                            <CheckCheck className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-zinc-400" title="Sent">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                )}
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
            className="absolute bottom-4 right-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <ArrowDown className="h-3 w-3" />
            <span>Latest Messages</span>
          </button>
        )}
      </div>

      {/* Message Composer */}
      <div className="border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 transition"
            />
            <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400">
              {text.length}/2000
            </div>
          </div>

          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              onClick={() => setShowQuickChips(!showQuickChips)}
              title="Quick Prompts"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <button
              type="submit"
              disabled={!text.trim() || isPending}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              title="Send Message"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <WifiOff className="h-2.5 w-2.5" />
                Polling Sync
              </span>
            )}
          </div>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
