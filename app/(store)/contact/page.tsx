import type { Metadata } from "next";
import { ContactForm } from "@/components/shop/ContactForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { site } from "@/lib/config/site";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit the store, message a technician on WhatsApp or send us an email.",
};

const CHANNELS: { icon: IconName; label: string; value: string; href?: string }[] = [
  { icon: "whatsapp", label: "WhatsApp", value: site.contact.phoneDisplay, href: whatsappLink("Hi CellifyShop, I'd like some help.") },
  { icon: "phone", label: "Call or message", value: site.contact.phoneDisplay, href: whatsappLink("Hi CellifyShop, could you call me back?") },
  { icon: "mail", label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
  { icon: "pin", label: "Visit", value: site.contact.address },
];

export default function ContactPage() {
  return (
    <section className="shell pt-[calc(var(--header-h)+3rem)] pb-24 md:pb-32">
      <p className="eyebrow text-accent-ink">Contact</p>
      <h1 className="mt-5 max-w-4xl text-[clamp(2.24rem,4.8vw,4.08rem)] leading-[0.95] tracking-[-0.05em]">
        <RevealWords text="Talk to a real technician." />
      </h1>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((c, i) => {
              const content = (
                <>
                  <Icon name={c.icon} size={22} className="text-accent" />
                  <span className="mt-8 block text-sm text-mute">{c.label}</span>
                  <span className="mt-1 block font-medium break-words">{c.value}</span>
                </>
              );
              return (
                <Reveal as="li" key={c.label} delay={i * 0.06}>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="block h-full rounded-[24px] border border-line bg-surface p-6 transition-colors hover:border-ink"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="h-full rounded-[24px] border border-line bg-surface p-6">{content}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>

          <Reveal delay={0.2} className="rounded-[24px] bg-night p-7 text-white">
            <p className="eyebrow text-night-mute">Opening hours</p>
            <dl className="mt-5 space-y-3">
              {site.contact.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-night-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-white/70">{h.days}</dt>
                  <dd className="font-medium tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
