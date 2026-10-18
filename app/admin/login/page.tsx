import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/ui/Logo";
import { devPasswordHint } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const hint = devPasswordHint();
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f6f4] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">
            CellifyShop <span className="text-mute">Admin</span>
          </span>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-7 shadow-[0_20px_60px_-40px_rgba(0,0,0,.35)]">
          <h1 className="text-2xl tracking-[-0.03em]">Sign in</h1>
          <p className="mt-1 text-[0.9rem] text-mute">Manage products, categories and taxonomy.</p>
          <LoginForm />
          {hint && (
            <p className="mt-5 rounded-lg bg-paper-2 px-3 py-2 text-[0.8rem] text-mute">
              Development password: <code className="font-semibold text-ink">{hint}</code>. Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code> before going live.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
