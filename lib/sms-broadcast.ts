import { coercePhoneValue, isSmsConfigured, sendSmsMessage } from "./messaging";
import { loadParentUsers } from "./notify-service";

export type SmsBroadcastResult = {
  totalParents: number;
  parentsWithPhone: number;
  smsSent: number;
  skippedNoPhone: number;
  errors: string[];
};

export async function broadcastSmsToAllParents(message: string): Promise<SmsBroadcastResult> {
  const result: SmsBroadcastResult = {
    totalParents: 0,
    parentsWithPhone: 0,
    smsSent: 0,
    skippedNoPhone: 0,
    errors: [],
  };

  if (!isSmsConfigured()) {
    result.errors.push("Brak SMSAPI_TOKEN na Vercel.");
    return result;
  }

  const trimmed = message.trim();

  if (!trimmed) {
    result.errors.push("Treść SMS nie może być pusta.");
    return result;
  }

  const parents = await loadParentUsers();
  result.totalParents = parents.length;

  for (const parent of parents) {
    const phone = coercePhoneValue(parent.telefon);

    if (!phone) {
      result.skippedNoPhone += 1;
      continue;
    }

    result.parentsWithPhone += 1;

    const smsResult = await sendSmsMessage({
      phone,
      message: trimmed,
    });

    if (smsResult.ok) {
      result.smsSent += 1;
    } else if (!smsResult.skipped && "error" in smsResult && smsResult.error) {
      result.errors.push(`${phone}: ${smsResult.error}`);
    }
  }

  return result;
}
