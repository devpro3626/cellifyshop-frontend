"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const TOPICS = ["A repair", "Buying an iPhone", "Accessories", "Something else"];

/** Composes the message and opens WhatsApp. Swap for an API route when a backend exists. */
export function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);

  return (
    <form
      className="rounded-[32px] bg-surface p-7 shadow-[0_30px_80px_-50px_rgba(11,11,13,.4)] md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const device = data.get("model") ? ` Device: ${data.get("model")}.` : "";
        const message = `Hi CellifyShop, I'm ${data.get("name")}. Topic: ${topic}.${device}\n\n${data.get("message")}`;
        window.open(whatsappLink(message), "_blank", "noopener");
      }}
    >
      <p className="font-display text-2xl font-semibold tracking-[-0.03em]">Send us a message</p>
      <p className="mt-1 text-sm text-mute">We usually reply within minutes during opening hours.</p>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-medium">What can we help with?</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === topic}
              onClick={() => setTopic(t)}
              className={cn("rounded-full border px-4 py-2 text-sm transition-colors", t === topic ? "border-ink bg-ink text-white" : "border-line hover:border-ink/40")}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input name="name" required autoComplete="name" className="h-12 rounded-xl border border-line bg-paper px-4 font-normal outline-none focus:border-ink" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Device (optional)
          <input name="model" placeholder="e.g. iPhone 15 Pro" className="h-12 rounded-xl border border-line bg-paper px-4 font-normal outline-none placeholder:text-mute focus:border-ink" />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-medium">
        Message
        <textarea
          name="message"
          required
          rows={5}
          placeholder="My screen is cracked in the top corner and Face ID stopped working…"
          className="rounded-xl border border-line bg-paper p-4 font-normal outline-none placeholder:text-mute focus:border-ink"
        />
      </label>

      <Button type="submit" size="lg" className="mt-6 w-full">
        <Icon name="whatsapp" size={18} /> Send on WhatsApp
      </Button>
    </form>
  );
}
