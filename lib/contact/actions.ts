"use server";

import { headers } from "next/headers";
import { messagesApi } from "@/lib/api/messages.api";
import { ApiError } from "@/lib/api/errors";

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; fields: Partial<Record<"name" | "phone" | "email" | "message", string>> };

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** Contact form: stores the message via the API so it appears in the admin portal. */
export async function sendContactMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const input = {
    name: field(form, "name"),
    phone: field(form, "phone"),
    email: field(form, "email") || undefined,
    topic: field(form, "topic") || "General",
    device: field(form, "device") || undefined,
    message: field(form, "message"),
  };

  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || undefined;

  try {
    await messagesApi.send(input, clientIp);
    return { status: "sent" };
  } catch (error) {
    if (error instanceof ApiError) {
      const fields = Object.fromEntries((error.details ?? []).map((d) => [d.path, d.message]));
      const message = error.status === 429 ? "You've sent a few messages already. Please try again in a little while." : error.message;
      return { status: "error", message, fields };
    }
    return { status: "error", message: "We couldn't send your message. Please try again or reach us on WhatsApp.", fields: {} };
  }
}
