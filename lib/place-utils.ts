const MEDAL_EMOJI: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function placeLabel(place: number | null | undefined): string {
  if (!place) return "—";

  const medal = MEDAL_EMOJI[place];
  return medal ? `${medal} ${place}. miejsce` : `${place}. miejsce`;
}

export function clubPlaceLabel(place: number | null | undefined): string {
  if (!place) return "";

  const medal = MEDAL_EMOJI[place];
  return medal ? `${medal} ${place}. miejsce klubowe` : `${place}. miejsce klubowe`;
}

export const PLACE_OPTIONS_ABOVE_THIRD = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;
