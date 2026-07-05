/**
 * ZKS Białogard — Manager
 * Design tokens wyciągnięte z mockupu i logo klubu.
 */

export const APP_NAME = "ZKS Białogard — Manager";
export const APP_SHORT_NAME = "ZKS Manager";
export const CLUB_NAME = "ZKS Białogard";

/** Tło i powierzchnie */
export const colors = {
  black: "#000000",
  blackSoft: "#050505",
  charcoal: "#0A0A0A",
  card: "#121212",
  cardBorder: "rgba(197, 160, 89, 0.25)",

  /** Złoto — gradient od jasnego do brązu */
  goldBright: "#F7D154",
  goldHighlight: "#FFE17B",
  gold: "#D4AF37",
  goldMid: "#C5A059",
  goldDeep: "#8A6D3B",
  goldBronze: "#8B6B23",
  goldShadow: "#3D2B1F",

  /** Tekst */
  white: "#FFFFFF",
  text: "#E0E0E0",
  textMuted: "#A3A3A3",
  textDim: "#737373",
} as const;

/** Gradienty i efekty */
export const gradients = {
  gold: `linear-gradient(135deg, ${colors.goldBright} 0%, ${colors.gold} 45%, ${colors.goldDeep} 100%)`,
  goldHorizontal: `linear-gradient(to right, ${colors.goldHighlight}, ${colors.gold}, ${colors.goldBronze})`,
  goldText: `linear-gradient(to right, ${colors.goldBright}, ${colors.gold}, ${colors.goldDeep})`,
  heroOverlay: `radial-gradient(ellipse at 70% 50%, rgba(212, 175, 55, 0.12) 0%, transparent 60%)`,
} as const;

export const shadows = {
  goldGlow: "0 0 30px rgba(247, 209, 84, 0.35)",
  goldGlowSm: "0 0 20px rgba(247, 209, 84, 0.2)",
  goldGlowLg: "0 0 50px rgba(247, 209, 84, 0.45)",
  card: "0 4px 24px rgba(0, 0, 0, 0.5)",
} as const;

/** Typografia — Oswald (nagłówki, logo) + Inter (treść) */
export const typography = {
  heading: "var(--font-heading), 'Oswald', sans-serif",
  body: "var(--font-sans), 'Inter', sans-serif",

  /** Style z mockupu */
  label: {
    size: "0.75rem",
    weight: 700,
    tracking: "0.35em",
    transform: "uppercase" as const,
  },
  heroTitle: {
    weight: 700,
    transform: "uppercase" as const,
  },
  motto: {
    tracking: "0.15em",
    transform: "uppercase" as const,
  },
} as const;

export const radius = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
  button: "0.625rem",
  card: "0.75rem",
} as const;
