import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-night text-white">
      <div className="shell flex h-16 items-center">
        <Link href="/" aria-label="CellifyShop home">
          <Logo />
        </Link>
      </div>
      <div className="shell relative z-10 flex flex-1 flex-col justify-center py-20">
        <p className="font-medium tabular-nums text-sm text-accent-light">Error 404</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,6.1vw,4.76rem)] leading-[0.92] tracking-[-0.05em]">
          This page is <span className="text-white/40">beyond repair.</span>
        </h1>
        <p className="mt-6 max-w-md text-white/60">The link may be old or mistyped. Everything else is working perfectly.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass({ variant: "light", size: "lg" })}>
            Back to home
          </Link>
          <Link href="/products" className={buttonClass({ variant: "outline-light", size: "lg" })}>
            Browse the store
          </Link>
        </div>
      </div>
    </main>
  );
}
