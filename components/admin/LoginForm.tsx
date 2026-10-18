"use client";

import { useActionState } from "react";
import { login } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, Notice } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <Field label="Password">
        <input name="password" type="password" required autoFocus autoComplete="current-password" className={inputClass} />
      </Field>
      {state && !state.ok && <Notice>{state.error}</Notice>}
      <Button type="submit" variant="dark" loading={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
