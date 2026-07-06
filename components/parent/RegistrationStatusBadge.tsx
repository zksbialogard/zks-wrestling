import {
  normalizeRegistrationStatus,
  registrationStatusLabel,
} from "@/lib/registration-types";

type Props = {
  status: string;
  size?: "sm" | "md";
};

export default function RegistrationStatusBadge({ status, size = "md" }: Props) {
  const normalized = normalizeRegistrationStatus(status);

  const colorClass =
    normalized === "approved"
      ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
      : normalized === "rejected"
        ? "bg-red-500/15 text-red-400 ring-red-500/25"
        : "bg-zks-gold/15 text-zks-gold-bright ring-zks-gold-mid/25";

  const sizeClass =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide ring-1 ring-inset ${colorClass} ${sizeClass}`}
    >
      {registrationStatusLabel(status)}
    </span>
  );
}
