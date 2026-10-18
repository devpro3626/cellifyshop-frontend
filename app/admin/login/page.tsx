import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
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
          <p className="mt-5 text-[0.8rem] text-mute">The password is set by ADMIN_PASSWORD in the API&rsquo;s environment.</p>
        </div>
      </div>
    </main>
  );
}
