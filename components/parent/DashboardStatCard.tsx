import Link from "next/link";
import { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  highlight?: boolean;
};

export default function DashboardStatCard({
  href,
  icon: Icon,
  label,
  value,
  hint,
  highlight = false,
}: Props) {
  return (
    <Link
      href={href}
      className={`zks-card group block min-h-[44px] p-4 transition hover:-translate-y-0.5 hover:border-zks-gold-mid/50 sm:p-5 ${
        highlight ? "border-zks-gold-bright/30 bg-zks-gold/5" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zks-text-muted">
            {label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-white sm:text-3xl">
            {value}
          </p>
          {hint && (
            <p className="mt-1 truncate text-xs text-zks-text-muted">{hint}</p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10 transition group-hover:shadow-gold-glow-sm">
          <Icon className="h-5 w-5 text-zks-gold-bright" />
        </div>
      </div>
    </Link>
  );
}
