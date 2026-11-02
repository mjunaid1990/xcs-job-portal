import { EventEmitter } from "node:events";

export interface ChatMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  clientMsgId: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  sender: { id: string; name: string };
}

class ChatEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow multiple concurrent browser tabs/clients per conversation
    this.setMaxListeners(500);
  }

  notifyMessage(conversationId: string, message: ChatMessagePayload): void {
    this.emit(`message:${conversationId}`, message);
  }

  notifyRead(conversationId: string, userId: string): void {
    this.emit(`read:${conversationId}`, { userId, readAt: new Date().toISOString() });
  }
}

// Global singleton to prevent listener drops during development hot reloads
const globalForChat = globalThis as unknown as { chatBus?: ChatEventEmitter };

export const chatBus = globalForChat.chatBus ?? new ChatEventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForChat.chatBus = chatBus;
}
