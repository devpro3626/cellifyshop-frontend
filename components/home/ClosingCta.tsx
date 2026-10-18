import { site } from "@/lib/config/site";
import { whatsappLink } from "@/lib/format";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta() {
  return (
    <section className="bg-paper pb-24 md:pb-32">
      <div className="shell">
        <Reveal className="grid gap-10 rounded-[32px] bg-night px-7 py-14 text-white md:px-14 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-accent-light">Talk to a technician</p>
            <h2 className="mt-4 text-[clamp(1.76rem,3.4vw,2.99rem)] leading-[1]">
              Not sure what you need? <span className="text-night-mute">Ask us, it&rsquo;s free.</span>
            </h2>
          </div>
          <div className="space-y-6">
            <p className="max-w-md leading-relaxed text-white/70">
              Send a photo of the damage or the model you&rsquo;re after. A technician replies within minutes during opening hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink("Hi CellifyShop, I have a question about my iPhone.")} target="_blank" rel="noreferrer" className={buttonClass({ variant: "whatsapp", size: "lg" })}>
                <Icon name="whatsapp" size={18} />
                Chat on WhatsApp
              </a>
              <ButtonLink href="/contact" variant="outline-light" size="lg">
                Visit the store
              </ButtonLink>
            </div>
            <p className="flex items-center gap-2 text-sm text-white/55">
              <Icon name="phone" size={16} /> {site.contact.phoneDisplay}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
