import Link from "next/link";
import ClubLogo from "@/components/ui/ClubLogo";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="app-page flex min-h-screen items-start justify-center">
      <div className="app-page-inner w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <ClubLogo size={88} glow priority />
          <p className="zks-label mt-5">ZKS Białogard — Manager</p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(1.5rem,6vw,1.875rem)] font-bold uppercase text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-zks-text-muted">
              {subtitle}
            </p>
          )}
        </div>

        <div className="zks-card p-6 sm:p-8">{children}</div>

        {footer && <div className="mt-6">{footer}</div>}

        <p className="mt-8 text-center text-xs text-zks-text-muted">
          <Link href="/" className="text-zks-gold-mid transition hover:text-zks-gold-bright">
            ← Wróć na stronę główną
          </Link>
        </p>
      </div>
    </main>
  );
}
