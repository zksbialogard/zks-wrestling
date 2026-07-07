import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type PanelQuickLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

type PanelQuickScrollProps = {
  title?: string;
  links: PanelQuickLink[];
};

export default function PanelQuickScroll({ title = "Szybki dostęp", links }: PanelQuickScrollProps) {
  return (
    <section className="panel-quick-section">
      <h2 className="panel-section-title">{title}</h2>
      <div className="panel-quick-scroll">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href} className="panel-quick-tile group">
              <span className="panel-quick-tile-icon">
                <Icon className="h-5 w-5 text-zks-gold-bright" />
                {link.badge && link.badge > 0 ? (
                  <span className="panel-quick-tile-badge">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                ) : null}
              </span>
              <span className="panel-quick-tile-label">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
