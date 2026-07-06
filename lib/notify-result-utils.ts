import type { NotifyResult } from "./notify-service";

const TECHNICAL_PUSH =
  /received unexpected response|unexpected response code|web-?push|push subscription/i;

function isPushNoise(message: string, pushSent: number) {
  if (TECHNICAL_PUSH.test(message)) {
    return true;
  }

  if (pushSent > 0 && /push|subskrypc/i.test(message)) {
    return true;
  }

  return false;
}

/** Usuwa techniczne komunikaty push z odpowiedzi dla panelu admina. */
export function sanitizeNotifyResult(result: NotifyResult): NotifyResult {
  const pushSent = result.pushSent ?? 0;

  return {
    ...result,
    errors: result.errors.filter((message) => !isPushNoise(message, pushSent)),
    warnings: result.warnings.filter((message) => !isPushNoise(message, pushSent)),
  };
}

export function hasNotifyIssues(result: NotifyResult) {
  const clean = sanitizeNotifyResult(result);
  return clean.errors.length > 0 || clean.warnings.length > 0;
}
