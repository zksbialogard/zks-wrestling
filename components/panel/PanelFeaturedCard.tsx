import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PanelFeaturedCardProps = {
  kicker: string;
  title: string;
  description?: string;
  href: string;
  cta?: string;
  icon?: LucideIcon;
};

export default function PanelFeaturedCard({
  kicker,
  title,
  description,
  href,
  cta = "Zobacz więcej",
  icon: Icon,
}: PanelFeaturedCardProps) {
  return (
    <Link href={href} className="panel-featured-card group block">
      <div className="panel-featured-card-glow" aria-hidden />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="panel-featured-kicker">{kicker}</p>
          <h2 className="panel-featured-title">{title}</h2>
          {description ? (
            <p className="panel-featured-description">{description}</p>
          ) : null}
          <span className="panel-featured-cta">
            {cta}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
        {Icon ? (
          <span className="panel-featured-icon">
            <Icon className="h-7 w-7 text-zks-gold-bright" />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
