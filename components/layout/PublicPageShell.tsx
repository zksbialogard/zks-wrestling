import type { ReactNode } from "react";

type PublicPageShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "max-w-5xl" | "max-w-6xl" | "max-w-7xl";
  className?: string;
};

export function PublicPageShell({
  title,
  description,
  children,
  maxWidth = "max-w-6xl",
  className = "",
}: PublicPageShellProps) {
  return (
    <main className={`app-page ${className}`.trim()}>
      <div className={`app-page-inner ${maxWidth}`}>
        {(title || description) && (
          <header className="app-page-header">
            {title ? <h1 className="app-page-title">{title}</h1> : null}
            {description ? <p className="app-page-lead">{description}</p> : null}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}

export function PublicPageStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`app-stack ${className}`.trim()}>{children}</div>;
}
