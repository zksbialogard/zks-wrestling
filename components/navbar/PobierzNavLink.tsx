"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";

type PobierzNavLinkProps = {
  href: string;
  label: string;
  className?: string;
  onNavigate?: () => void;
  children?: ReactNode;
};

export default function PobierzNavLink({
  href,
  label,
  className,
  onNavigate,
  children,
}: PobierzNavLinkProps) {
  const { canInstall, promptInstall } = usePwaInstall();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (canInstall) {
      event.preventDefault();
      onNavigate?.();
      await promptInstall();
      return;
    }

    onNavigate?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children ?? label}
    </Link>
  );
}

export function isPobierzLink(href: string) {
  return href === "/pobierz";
}
