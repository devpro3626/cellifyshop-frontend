"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/lib/config/site";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/format";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

const CHAT = [
  { from: "customer", text: "Hi! My iPhone 15 screen is cracked. Can you fix it today?", time: "10:24" },
  { from: "store", text: "Hi! Yes, screens take about an hour. Bring it in any time before 8 pm.", time: "10:25" },
  { from: "customer", text: "Great, I'll come at 4. Will my photos be safe?", time: "10:26" },
  { from: "store", text: "Absolutely. Your data stays on the phone, and the repair has a 12-month warranty.", time: "10:26" },
] as const;

const THREADS = [
  { name: `${site.name} Repairs`, preview: "Absolutely. Your data stays on the phone…", time: "10:26", active: true, unread: 0 },
  { name: `${site.name} Sales`, preview: "iPhone 18 Pro in Glacier, 512GB is in stock.", time: "09:12", active: false, unread: 2 },
  { name: "Order #2041", preview: "Your AirPods Pro 3 are ready to collect.", time: "Yesterday", active: false, unread: 0 },
  { name: "Trade-in quote", preview: "We can offer AED 1,450 for your iPhone 15.", time: "Mon", active: false, unread: 0 },
];

/** Store avatar: the brand mark on a dark disc, matching the site header. */
function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-[#1f2c34] text-white ring-1 ring-white/10", size === "md" ? "h-10 w-10" : "h-9 w-9")}>
      <LogoMark className={size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]"} />
    </span>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-semibold text-white/85 md:px-7 md:pt-3">
      <span>9:41&nbsp;&nbsp;Sun 18 Oct</span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <svg viewBox="0 0 16 12" className="h-2.5 w-3.5 fill-current">
          <path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10 10 0 0 0 8 1 10 10 0 0 0 .9 3.7L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3c1.5 0 2.8.5 3.9 1.4L13 5.7A7 7 0 0 0 8 4a7 7 0 0 0-5 1.7l1.1 1.2A5.5 5.5 0 0 1 8 5.5Zm0 3c.7 0 1.3.2 1.8.6L8 11 6.2 9.1c.5-.4 1.1-.6 1.8-.6Z" />
        </svg>
        <span>82%</span>
        <span className="relative h-[11px] w-[22px] rounded-[3px] border border-white/60 p-[1.5px]">
          <span className="block h-full w-[80%] rounded-[1px] bg-white/90" />
        </span>
      </span>
    </div>
  );
}

/** Sidebar of the split-view messaging app (iPad landscape only). */
function ChatList() {
  return (
    <aside className="hidden w-[36%] shrink-0 flex-col border-r border-white/[0.07] bg-[#111b21] md:flex">
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <p className="text-[22px] font-bold tracking-[-0.02em]">Chats</p>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-white/70">
          <Icon name="plus" size={16} />
        </span>
      </div>
      <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-[#202c33] px-3 py-2 text-[13px] text-white/40">
        <Icon name="search" size={14} /> Search
      </div>
      <ul className="flex-1 overflow-hidden">
        {THREADS.map((thread) => (
          <li key={thread.name} className={cn("flex items-center gap-3 px-4 py-2.5", thread.active && "bg-[#2a3942]")}>
            <Avatar size="sm" />
            <div className="min-w-0 flex-1 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[14px] font-medium">{thread.name}</p>
                <span className={cn("shrink-0 text-[11px]", thread.unread ? "text-whatsapp" : "text-white/40")}>{thread.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12.5px] text-white/50">{thread.preview}</p>
                {thread.unread > 0 && (
                  <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-whatsapp px-1 text-[10.5px] font-semibold text-[#0b141a]">{thread.unread}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Conversation pane; bubbles arrive one after another when scrolled into view. */
function ChatThread() {
  const reduce = useReducedMotion();
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#0b141a]">
      <header className="flex items-center gap-3 border-b border-white/[0.07] bg-[#202c33] px-4 py-2.5">
        <Avatar />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold">{site.name} Repairs</p>
          <p className="flex items-center gap-1.5 text-[12px] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" /> online
          </p>
        </div>
        <span className="ml-auto flex items-center gap-4 text-white/60" aria-hidden="true">
          <Icon name="phone" size={18} />
          <Icon name="search" size={18} />
        </span>
      </header>

      <ol className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-4 py-4 md:px-6">
        <li className="mb-1 self-center rounded-md bg-[#182229] px-2.5 py-1 text-[11px] text-white/55">Today</li>
        {CHAT.map((message, i) => {
          const mine = message.from === "customer";
          return (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.45, delay: 0.4 + i * 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "max-w-[78%] rounded-lg px-3 py-1.5 text-[13.5px] leading-snug shadow-sm",
                mine ? "self-end rounded-tr-sm bg-[#005c4b] text-white" : "self-start rounded-tl-sm bg-[#202c33] text-white/90",
              )}
              style={{ transformOrigin: mine ? "top right" : "top left" }}
            >
              {message.text}
              <span className="ml-3 inline-flex translate-y-[3px] items-center gap-1 float-right text-[10.5px] text-white/45">
                {message.time}
                {mine && (
                  <svg viewBox="0 0 16 11" className="h-2.5 w-3.5 fill-[#53bdeb]" aria-hidden="true">
                    <path d="M11.07.65 4.7 7.02 2.16 4.48 1.1 5.54l3.6 3.6 7.43-7.43L11.07.65Zm3.83 0L8.53 7.02l-.62-.62-1.06 1.06 1.68 1.68 7.43-7.43L14.9.65Z" />
                  </svg>
                )}
              </span>
            </motion.li>
          );
        })}
        <motion.li
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ delay: 0.4 + CHAT.length * 0.55 }}
          className="flex gap-1 self-start rounded-lg rounded-tl-sm bg-[#202c33] px-3.5 py-3"
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-white/60"
              animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
            />
          ))}
        </motion.li>
      </ol>

      <div className="flex items-center gap-2 bg-[#202c33] px-3 pt-2.5 pb-5 md:pb-6">
        <span className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-[13px] text-white/40">Type a message</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-whatsapp text-[#0b141a]">
          <Icon name="arrowRight" size={16} className="-rotate-45" />
        </span>
      </div>
    </section>
  );
}

/**
 * A realistic iPad: aluminium edge, black bezel, front camera and buttons.
 * Landscape split view from md up, portrait with just the chat on phones.
 */
function IPad() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] md:max-w-[1040px]">
      {/* Hardware buttons on the aluminium edge */}
      <span aria-hidden="true" className="absolute -top-[3px] right-[12%] h-[4px] w-[9%] rounded-t-full bg-gradient-to-b from-[#6b6d72] to-[#3a3b3f] md:right-[8%] md:w-[6%]" />
      <span aria-hidden="true" className="absolute top-[9%] -right-[3px] h-[8%] w-[4px] rounded-r-full bg-gradient-to-r from-[#3a3b3f] to-[#6b6d72] md:top-[12%] md:h-[9%]" />
      <span aria-hidden="true" className="absolute top-[19%] -right-[3px] h-[8%] w-[4px] rounded-r-full bg-gradient-to-r from-[#3a3b3f] to-[#6b6d72] md:top-[23%] md:h-[9%]" />

      {/* Aluminium edge */}
      <div className="relative rounded-[30px] bg-gradient-to-br from-[#77797e] via-[#3d3e42] to-[#55575b] p-[2.5px] shadow-[0_60px_120px_-50px_rgba(0,0,0,0.65),0_30px_60px_-40px_rgba(0,0,0,0.5)] md:rounded-[42px] md:p-[3px]">
        {/* Black bezel */}
        <div className="relative rounded-[28px] bg-[#050506] p-[10px] md:rounded-[39px] md:p-[16px]">
          {/* Front camera: top edge in portrait, centred on the long edge in landscape */}
          <span aria-hidden="true" className="absolute top-[3.5px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#15161a] ring-1 ring-[#2a2c33] md:top-[5.5px] md:h-[6px] md:w-[6px]">
            <span className="absolute top-[1px] left-[1px] h-[1.5px] w-[1.5px] rounded-full bg-[#5a6b8a]/70" />
          </span>

          {/* Screen */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[19px] bg-[#0b141a] text-white md:aspect-[1.43/1] md:rounded-[24px]">
            <div className="flex h-full flex-col">
              <div className="bg-[#111b21]">
                <StatusBar />
              </div>
              <div className="flex min-h-0 flex-1">
                <ChatList />
                <ChatThread />
              </div>
            </div>
            {/* Home indicator and glass reflection */}
            <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 h-[4px] w-[32%] -translate-x-1/2 rounded-full bg-white/50 md:w-[14%]" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 28%, transparent 42%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Closing call to action: Apple-style headline above a live iPad. */
export function ClosingCta() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The iPad starts tilted back and settles flat as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, 0]);

  return (
    <section className="overflow-hidden bg-paper pb-24 md:pb-32">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow text-accent-ink">Talk to a technician</p>
          </Reveal>
          <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02]">
            <RevealWords text="Not sure what you need?" className="block" />
            <RevealWords text="Ask us, it's free." className="block text-mute" delay={0.15} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-mute">
              Send a photo of the damage or the model you&rsquo;re after. A technician replies within minutes during opening hours.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="mt-12 [perspective:2000px] md:mt-16">
          <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 100%" }}>
            <IPad />
          </motion.div>
          {/* Soft floor shadow */}
          <div aria-hidden="true" className="mx-auto -mt-4 h-10 w-[70%] max-w-[760px] rounded-[50%] bg-black/20 blur-2xl" />
        </div>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink("Hi CellifyShop, I have a question about my iPhone.")}
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: "whatsapp", size: "lg" })}
            >
              <Icon name="whatsapp" size={18} />
              Chat on WhatsApp
            </a>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Visit the store
            </ButtonLink>
          </div>
          {site.contact.phoneDisplay && (
            <p className="flex items-center gap-2 text-sm text-mute">
              <Icon name="phone" size={15} /> {site.contact.phoneDisplay}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
