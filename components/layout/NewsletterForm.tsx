"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Front-end only for now; connect `onSubmit` to the mailing provider later. */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-2 rounded-full border border-night-line bg-night-2 p-1.5 pl-5 transition-colors focus-within:border-white/40">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          disabled={done}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button type="submit" disabled={done} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform hover:scale-105 disabled:bg-accent disabled:text-white" aria-label="Subscribe">
          <Icon name={done ? "check" : "arrowRight"} size={18} />
        </button>
      </div>
      <p className="mt-3 text-xs text-night-mute" role="status">
        {done ? "You're on the list. We'll be in touch." : "One email a month. Unsubscribe any time."}
      </p>
    </form>
  );
}
