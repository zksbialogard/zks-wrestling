export const EVENT_TYPES = ["zawody", "zgrupowanie", "inne"] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  zawody: "Zawody",
  zgrupowanie: "Zgrupowanie",
  inne: "Inne",
};

export function isEventType(value: string): value is EventType {
  return EVENT_TYPES.includes(value as EventType);
}

export function getEventTypeLabel(type?: string): string {
  if (type && isEventType(type)) {
    return EVENT_TYPE_LABELS[type];
  }

  return EVENT_TYPE_LABELS.zawody;
}

export function getEventTypeBadgeClass(type?: string): string {
  if (type === "zgrupowanie") {
    return "border-sky-400/40 bg-sky-500/10 text-sky-200";
  }

  if (type === "inne") {
    return "border-zks-gold-mid/30 bg-zks-gold/10 text-zks-gold-bright";
  }

  return "border-zks-gold-bright/40 bg-zks-gold-bright/10 text-zks-gold-bright";
}
