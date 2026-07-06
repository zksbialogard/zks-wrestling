import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function DashboardCard({
  href,
  icon: Icon,
  title,
  description,
}: Props) {
  return (
    <Link
      href={href}
      className="zks-card zks-card-pad group block min-h-[44px] transition hover:-translate-y-0.5 hover:border-zks-gold-mid/50 hover:shadow-gold-glow-sm"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10 transition group-hover:shadow-gold-glow-sm">
        <Icon className="h-6 w-6 text-zks-gold-bright" />
      </div>

      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-zks-text-muted">
        {description}
      </p>
    </Link>
  );
}
