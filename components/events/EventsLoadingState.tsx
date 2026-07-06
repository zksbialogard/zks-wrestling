import { Loader2 } from "lucide-react";

export default function EventsLoadingState() {
  return (
    <div className="zks-card flex items-center justify-center gap-3 rounded-2xl p-12 text-zks-text-muted">
      <Loader2 className="h-5 w-5 animate-spin text-zks-gold-mid" />
      Ładowanie zawodów...
    </div>
  );
}
