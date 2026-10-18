"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { sendContactMessage, type ContactState } from "@/lib/contact/actions";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/format";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const TOPICS = ["A repair", "Buying an iPhone", "Accessories", "Something else"];

const inputClass = "h-12 rounded-xl border bg-paper px-4 font-normal outline-none transition-colors placeholder:text-mute focus:border-ink";

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-[0.8rem] font-normal text-[#a1261b]">{message}</span> : null;
}

/** Contact form. Messages are stored by the API and appear in the admin portal. */
export function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });
  const errors = state.status === "error" ? state.fields : {};

  if (state.status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start rounded-[32px] bg-surface p-7 shadow-[0_30px_80px_-50px_rgba(11,11,13,.4)] md:p-10"
        role="status"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <Icon name="check" size={22} />
        </span>
        <p className="mt-6 font-display text-2xl font-semibold tracking-[-0.03em]">Thanks, we&rsquo;ve got your message.</p>
        <p className="mt-2 max-w-md text-mute">A technician will call or message you back shortly, usually within the hour during opening times.</p>
        <a href={whatsappLink("Hi CellifyShop, I just sent a message through your website.")} target="_blank" rel="noreferrer" className={buttonClass({ variant: "outline", className: "mt-8" })}>
          <Icon name="whatsapp" size={18} /> Need it faster? Chat on WhatsApp
        </a>
      </motion.div>
    );
  }

  return (
    <form action={action} className="rounded-[32px] bg-surface p-7 shadow-[0_30px_80px_-50px_rgba(11,11,13,.4)] md:p-10">
      <p className="font-display text-2xl font-semibold tracking-[-0.03em]">Send us a message</p>
      <p className="mt-1 text-sm text-mute">We usually reply within the hour during opening times.</p>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-medium">What can we help with?</legend>
        <input type="hidden" name="topic" value={topic} />
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
          <input name="name" required maxLength={80} autoComplete="name" aria-invalid={Boolean(errors.name)} className={cn(inputClass, errors.name ? "border-[#e5a59e]" : "border-line")} />
          <FieldError message={errors.name} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone
          <input
            name="phone"
            type="tel"
            required
            maxLength={25}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+971 50 123 4567"
            aria-invalid={Boolean(errors.phone)}
            className={cn(inputClass, errors.phone ? "border-[#e5a59e]" : "border-line")}
          />
          <FieldError message={errors.phone} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>
            Email <span className="font-normal text-mute">(optional)</span>
          </span>
          <input name="email" type="email" maxLength={120} autoComplete="email" aria-invalid={Boolean(errors.email)} className={cn(inputClass, errors.email ? "border-[#e5a59e]" : "border-line")} />
          <FieldError message={errors.email} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>
            Device <span className="font-normal text-mute">(optional)</span>
          </span>
          <input name="device" maxLength={80} placeholder="e.g. iPhone 15 Pro" className={cn(inputClass, "border-line")} />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-medium">
        Message
        <textarea
          name="message"
          required
          maxLength={2000}
          rows={5}
          placeholder="My screen is cracked in the top corner and Face ID stopped working…"
          aria-invalid={Boolean(errors.message)}
          className={cn("rounded-xl border bg-paper p-4 font-normal outline-none placeholder:text-mute focus:border-ink", errors.message ? "border-[#e5a59e]" : "border-line")}
        />
        <FieldError message={errors.message} />
      </label>

      <AnimatePresence>
        {state.status === "error" && !Object.keys(state.fields).length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="mt-4 rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#a1261b]">
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" size="lg" className="mt-6 w-full" loading={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
      <p className="mt-3 text-center text-xs text-mute">We only use your details to reply to this message.</p>
    </form>
  );
}
