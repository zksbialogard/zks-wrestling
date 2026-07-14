import { revalidatePath } from "next/cache";

import { refreshResultsNewsAfterChange } from "@/lib/facebook-results-news";

export function revalidateResultsPaths() {
  revalidatePath("/zawody/wyniki-zawodow");
  revalidatePath("/panel-rodzica/wyniki");
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

export async function syncResultsNewsImmediately(
  facebookPostId: string,
  eventTitle: string,
  fallback?: {
    newsPostId?: string | null;
    eventDate?: string | null;
    year?: number;
  }
) {
  const news = await refreshResultsNewsAfterChange(facebookPostId, eventTitle, fallback);
  revalidateResultsPaths();
  return news;
}
