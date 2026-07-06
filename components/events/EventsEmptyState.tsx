import { CalendarOff } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

export default function EventsEmptyState({
  title = "Brak zaplanowanych zawodów",
  description = "Wkrótce pojawią się nowe terminy startów klubowych.",
}: Props) {
  return (
    <div className="zks-card rounded-2xl p-10 text-center sm:p-14">
      <CalendarOff className="mx-auto h-12 w-12 text-zks-gold-mid" />
      <h3 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-zks-text-muted sm:text-base">
        {description}
      </p>
    </div>
  );
}
