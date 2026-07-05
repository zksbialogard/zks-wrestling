import { supabase } from "./supabase";
import { auth } from "./firebase";
import { getFirebaseNews } from "./news-firebase";

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  source?: "supabase" | "firebase";
};

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("aktualnosci")
    .select("*")
    .order("created_at", { ascending: false });

  const supabaseNews: NewsItem[] = error
    ? []
    : (data || []).map((item) => ({
        ...item,
        source: "supabase" as const,
      }));

  const firebaseNews = (await getFirebaseNews()).map((item) => ({
    ...item,
    id: `fb_${item.id}`,
    source: "firebase" as const,
  }));

  return [...supabaseNews, ...firebaseNews].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export async function createNews(data: { title: string; content: string }) {
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
  data: { title: string; content: string }
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
