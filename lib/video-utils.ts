const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_ID_PATTERN);
  return match?.[1] || null;
}

export function youtubePosterUrl(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(youtubeId: string, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}

export function formatVideoDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
