const STORAGE_KEY = "zks_push_prompt_snooze_until";

export function snoozePushPrompt(days = 3) {
  if (typeof window === "undefined") {
    return;
  }

  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, String(until));
}

export function clearPushPromptSnooze() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function isPushPromptSnoozed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return false;
  }

  const until = Number(raw);

  if (!Number.isFinite(until) || until <= Date.now()) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }

  return true;
}
