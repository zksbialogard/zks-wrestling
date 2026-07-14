import { supabase } from "./supabase";
import { auth } from "./firebase";
import { getFirebaseNews } from "./news-firebase";
import { normalizeNewsImages, type NewsImage } from "./news-images";

export type { NewsImage };

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  source?: "supabase" | "firebase";
  images?: NewsImage[];
};

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany z uprawnieniami moderatora lub administratora.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function sortNewsByDate(items: NewsItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export async function getNews(options?: {
  fresh?: boolean;
  includeFirebase?: boolean;
}): Promise<NewsItem[]> {
  const fromServer = options?.fresh ?? typeof window === "undefined";

  const { data, error } = await supabase
    .from("aktualnosci")
    .select("*")
    .order("created_at", { ascending: false });

  const supabaseNews: NewsItem[] = error
    ? []
    : (data || []).map((item) => ({
        ...item,
        source: "supabase" as const,
        images: normalizeNewsImages(item.images),
      }));

  if (!error && !options?.includeFirebase) {
    return supabaseNews;
  }

  const firebaseNews = (
    await getFirebaseNews({ fromServer })
  ).map((item) => ({
    ...item,
    id: `fb_${item.id}`,
    source: "firebase" as const,
    images: normalizeNewsImages(item.images),
  }));

  if (error) {
    return sortNewsByDate(firebaseNews);
  }

  return sortNewsByDate([...supabaseNews, ...firebaseNews]);
}

export async function createNews(data: {
  title: string;
  content: string;
  notify?: boolean;
  images?: NewsImage[];
}) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/aktualnosci", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się dodać aktualności.");
  }

  return true;
}

export async function updateNews(
  id: string,
  data: { title: string; content: string; images?: NewsImage[] }
) {
  const headers = await getAuthHeader();

  const response = await fetch(`/api/admin/aktualnosci/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować aktualności.");
  }

  return true;
}

export async function deleteNews(id: string) {
  const headers = await getAuthHeader();

  const response = await fetch(`/api/admin/aktualnosci/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć aktualności.");
  }

  return true;
}
