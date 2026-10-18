import "server-only";
import type { ContactMessage, Paginated } from "@/lib/catalog/types";
import { adminApi, publicApi } from "./client";

export interface MessageInput {
  name: string;
  phone: string;
  email?: string;
  topic?: string;
  device?: string;
  message: string;
}

export interface MessageListQuery {
  page?: number;
  limit?: number;
  status?: "all" | "unread" | "read";
  search?: string;
}

export const messagesApi = {
  /**
   * Public: send a contact-form message. The visitor's IP is forwarded so the
   * API's rate limit applies per visitor rather than to this server.
   */
  send: (input: MessageInput, clientIp?: string) =>
    publicApi.post("/messages", input, { headers: clientIp ? { "X-Forwarded-For": clientIp } : undefined }).then(() => undefined),

  /** Admin: newest first, with the total number of unread messages. */
  list: (query: MessageListQuery = {}) => adminApi.get<Paginated<ContactMessage> & { unread: number }>("/messages", { params: query }).then((r) => r.data),
  setRead: (id: string, read: boolean) => adminApi.patch<ContactMessage>(`/messages/${id}`, { read }).then((r) => r.data),
  remove: (id: string) => adminApi.delete(`/messages/${id}`).then(() => undefined),
};
