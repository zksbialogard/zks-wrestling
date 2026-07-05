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
  const filter = glow
    ? "url(#zks-logo-knockout) drop-shadow(0 0 28px rgba(247, 209, 84, 0.42))"
    : "url(#zks-logo-knockout)";

  return (
    <div
      className={cn("relative shrink-0", fluid && "h-auto w-full", className)}
      style={fluid ? undefined : { width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute inset-[10%] rounded-full bg-zks-gold/15 blur-2xl"
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
          "relative z-10 object-contain",
          fluid ? "h-auto w-full" : "h-full w-full",
          imageClassName
        )}
        style={{ filter }}
      />
    </div>
  );
}
