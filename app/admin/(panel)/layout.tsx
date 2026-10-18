import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { messagesApi } from "@/lib/api/messages.api";
import { isAuthenticated } from "@/lib/admin/auth";

/** Admin screens check the session on every request, so they may block briefly. */
export const instant = false;

/** Every admin screen sits behind the session check. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f6f6f4]" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Unread count for the navigation badge; the inbox still works if this fails.
  const unread = await messagesApi
    .list({ limit: 1, status: "unread" })
    .then((r) => r.unread)
    .catch(() => 0);
  return <AdminShell unread={unread}>{children}</AdminShell>;
}
