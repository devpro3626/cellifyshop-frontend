"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, inputClass, Notice } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <Field label="Password">
        <span className="relative block">
          <input name="password" type={visible ? "text" : "password"} required autoFocus autoComplete="current-password" className={cn(inputClass, "pr-11")} />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-mute transition-colors hover:text-ink"
          >
            <Icon name={visible ? "eyeOff" : "eye"} size={18} />
          </button>
        </span>
      </Field>
      {state && !state.ok && <Notice>{state.error}</Notice>}
      <Button type="submit" variant="dark" loading={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
