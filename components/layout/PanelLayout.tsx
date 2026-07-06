import type { ReactNode } from "react";

type PanelPageProps = {
  children: ReactNode;
  className?: string;
};

type PanelPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
};

type PanelSectionProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PanelMain({ children }: { children: ReactNode }) {
  return <div className="panel-main">{children}</div>;
}

export function PanelAlerts({ children }: { children: ReactNode }) {
  return <div className="panel-alerts">{children}</div>;
}

export function PanelPage({ children, className = "" }: PanelPageProps) {
  return <div className={`panel-page ${className}`.trim()}>{children}</div>;
}

export function PanelPageHeader({
  title,
  description,
  action,
  badge,
}: PanelPageHeaderProps) {
  return (
    <header className="panel-page-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="panel-title">{title}</h1>
          {badge}
        </div>
        {description ? <p className="panel-description">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function PanelSection({
  title,
  description,
  action,
  children,
  className = "",
}: PanelSectionProps) {
  return (
    <section className={`panel-section ${className}`.trim()}>
      {(title || description || action) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="panel-section-title">{title}</h2> : null}
            {description ? (
              <p className="panel-section-description">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function PanelList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`panel-list ${className}`.trim()}>{children}</div>;
}

export function PanelLoadingState({ label = "Ładowanie..." }: { label?: string }) {
  return (
    <div className="zks-card zks-card-pad flex items-center gap-3 text-sm text-zks-text-muted">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zks-gold-mid/30 border-t-zks-gold-bright" />
      {label}
    </div>
  );
}

export function PanelEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="zks-card panel-empty">
      {icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10">
          {icon}
        </div>
      ) : null}
      <h2 className="panel-section-title mt-4">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zks-text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
