import type { Metadata } from "next";
import Image from "next/image";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About us",
  description: "CellifyShop is an iPhone store and repair workshop built on honest quotes, genuine parts and written warranties.",
};

const VALUES = [
  { title: "Honest quotes", body: "You get a fixed price before we pick up a screwdriver. If the fix costs less than expected, so does your bill." },
  { title: "Parts we'd use ourselves", body: "Genuine parts where available, high-grade compatible parts when you choose them, always labelled clearly." },
  { title: "Inspected, not just cleaned", body: "Every pre-owned iPhone passes 48 checks and ships with the report, so you know exactly what you're buying." },
];

const MILESTONES = [
  { year: "2019", text: "A single repair bench and a promise: quote first, fix second." },
  { year: "2021", text: "Certified pre-owned iPhones join the store, each with a 48-point inspection." },
  { year: "2024", text: "A second bench, board-level micro-soldering and same-day turnaround on most jobs." },
  { year: "2026", text: "More than 12,000 devices repaired and a 4.9 average rating from our customers." },
];

export default function AboutPage() {
  return (
    <>
      <section className="shell pt-[calc(var(--header-h)+3rem)] pb-16">
        <p className="eyebrow text-accent-ink">About CellifyShop</p>
        <h1 className="mt-5 max-w-5xl text-[clamp(2.24rem,4.8vw,4.22rem)] leading-[0.95] tracking-[-0.05em]">
          <RevealWords text="A store run by people who repair phones." />
        </h1>
        <p className="mt-8 max-w-[56ch] text-[1.05rem] leading-relaxed text-mute">
          We started as a repair bench. Opening thousands of iPhones teaches you which ones last, which parts fail and what a fair price looks like. Everything we sell is shaped by that.
        </p>
      </section>

      <section className="shell grid gap-4 pb-24 md:grid-cols-[1.4fr_1fr] md:pb-32">
        <Reveal className="relative min-h-[360px] overflow-hidden rounded-[32px] md:min-h-[560px]">
          <Image src="/images/editorial/workbench.webp" alt="An iPhone disassembled on a repair mat with tools" fill preload sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
        </Reveal>
        <div className="grid gap-4">
          <Reveal delay={0.1} className="relative min-h-[260px] overflow-hidden rounded-[32px]">
            <Image src="/images/editorial/technician.webp" alt="A technician repairing an iPhone" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.2} className="flex flex-col justify-between rounded-[32px] bg-accent p-8 text-white">
            <p className="font-display text-[2.6rem] leading-none font-semibold tracking-[-0.05em]">12,400+</p>
            <p className="mt-4 text-white/85">devices repaired and returned to their owners, most of them the same day.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper-2 py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <SectionHeading eyebrow="What we believe" title="Three promises." subtitle="They shape every quote and every part we fit." />
          </Reveal>
          <ul className="mt-14 grid gap-4 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal as="li" key={value.title} delay={i * 0.08} className="rounded-[28px] bg-surface p-8">
                <span className="font-medium tabular-nums text-xs text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-10 font-display text-2xl font-semibold tracking-[-0.03em]">{value.title}</p>
                <p className="mt-3 leading-relaxed text-mute">{value.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="warranty" className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-2">
        <Reveal>
          <SectionHeading eyebrow="Our story" title="Seven years at the bench." />
          <div className="mt-10 space-y-5 leading-relaxed text-mute">
            <p>
              <strong className="text-ink">Warranty, in writing.</strong> New iPhones carry the full manufacturer warranty. Certified pre-owned iPhones and genuine-part repairs carry 12 months from us; premium-part repairs carry 90 days.
            </p>
            <p>If something isn&rsquo;t right, bring it back. We fix it, replace it or refund it.</p>
          </div>
        </Reveal>
        <ol className="relative border-l border-line-strong pl-8">
          {MILESTONES.map((m, i) => (
            <Reveal as="li" key={m.year} delay={i * 0.08} className="relative pb-10 last:pb-0">
              <span className="absolute top-1.5 -left-[37px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
              <p className="font-display text-2xl font-semibold tracking-[-0.04em]">{m.year}</p>
              <p className="mt-2 max-w-md text-mute">{m.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <ClosingCta />
    </>
  );
}
