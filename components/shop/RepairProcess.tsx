import { Icon, type IconName } from "@/components/ui/Icon";

const POINTS: { icon: IconName; title: string; body: string }[] = [
  { icon: "clock", title: "Most repairs same day", body: "Screens in about an hour, batteries in thirty minutes." },
  { icon: "search", title: "Free diagnosis", body: "A fixed quote before any work starts. No fix, no fee." },
  { icon: "shield", title: "Up to 12 months' warranty", body: "On parts and labour, in writing." },
  { icon: "check", title: "Your data stays put", body: "No resets. Your phone comes back exactly as you left it." },
];

/** Reassurance strip shown above the repair list. */
export function RepairProcess() {
  return (
    <section className="shell mt-10">
      <ul className="grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((point) => (
          <li key={point.title} className="bg-surface p-6">
            <Icon name={point.icon} className="text-accent" size={22} />
            <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">{point.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-mute">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
