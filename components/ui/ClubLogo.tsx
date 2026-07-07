import { cn } from "@/lib/utils";

type ClubLogoProps = {
  size?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  glow?: boolean;
  fluid?: boolean;
};

export default function ClubLogo({
  size = 56,
  className,
  imageClassName,
  priority = false,
  glow = false,
  fluid = false,
}: ClubLogoProps) {
  const imageFilter = glow
    ? "url(#zks-logo-soft) drop-shadow(0 6px 22px rgba(247, 209, 84, 0.2))"
    : "url(#zks-logo-soft)";

  return (
    <div
      className={cn("club-logo relative shrink-0", fluid && "h-auto w-full", className)}
      style={fluid ? undefined : { width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden
          className="club-logo-glow absolute inset-[12%] rounded-full"
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-shield.png"
        alt="ZKS Białogard"
        width={fluid ? undefined : size}
        height={fluid ? undefined : size}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "club-logo-image relative z-10 object-contain",
          fluid ? "h-auto w-full" : "h-full w-full",
          imageClassName
        )}
        style={{ filter: imageFilter }}
      />
    </div>
  );
}
