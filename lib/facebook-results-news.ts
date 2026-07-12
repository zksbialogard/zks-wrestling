import { formatEventDate } from "./event-utils";
import { buildFacebookEventGroupKey } from "./facebook-event-utils";
import { createSupabaseAdmin } from "./supabase";
import { placeLabel, clubPlaceLabel } from "./place-utils";
import { seedDefaultTemplatesIfEmpty } from "./notifications-db";
import { notifyClubMembers } from "./notify-service";
import type { FacebookEventResults } from "./facebook-results-types";

function buildResultsNews(event: FacebookEventResults) {
  const publishedResults = event.results
    .filter((result) => result.published && result.place)
    .sort((a, b) => (a.place || 99) - (b.place || 99));

  const resultLines = publishedResults.map((result) => {
    const weight = result.weight_class ? ` (${result.weight_class} kg)` : "";
    const style = result.style ? ` — ${result.style}` : "";
    return `• ${result.athlete_name}${weight}${style}: ${placeLabel(result.place)}`;
  });

  let intro = `Nasz klub wziął udział w zawodach ${event.event_title}`;

  if (event.event_date) {
    intro += ` (${formatEventDate(event.event_date)})`;
  }

  if (event.location) {
    intro += ` w ${event.location}`;
  }

  intro += ".";

  const sections = [intro];

  if (resultLines.length) {
    sections.push("", "Wyniki naszych zawodników:", ...resultLines);
  }

  if (event.club_place) {
    let clubLine = clubPlaceLabel(event.club_place);

    if (event.club_points?.trim()) {
      clubLine += ` (${event.club_points.trim()} pkt)`;
    }

    sections.push("", clubLine);
  }

  sections.push("", "Pełna lista wyników: /zawody/wyniki-zawodow");

  return {
    title: `Wyniki zawodów: ${event.event_title}`,
    content: sections.join("\n"),
  };
}

export async function syncResultsNewsForEvent(
  event: FacebookEventResults,
  options?: { notify?: boolean }
) {
  const supabase = createSupabaseAdmin();
  const publishedCount = event.results.filter((result) => result.published && result.place).length;

  if (!publishedCount) {
    return { created: false, updated: false, skipped: true as const };
  }

  const { title, content } = buildResultsNews(event);
  let existingNewsId =
    event.news_post_id || event.results.find((row) => row.news_post_id)?.news_post_id;

  if (!existingNewsId) {
    const { data: linkedRows } = await supabase
      .from("facebook_competition_results")
      .select("news_post_id")
      .eq("year", event.results[0]?.year || new Date().getFullYear())
      .eq("event_date", event.event_date || null)
      .not("news_post_id", "is", null);

    existingNewsId =
      linkedRows?.find((row) => row.news_post_id)?.news_post_id || null;
  }

  if (!existingNewsId && event.event_date) {
    const { data: newsCandidates } = await supabase
      .from("aktualnosci")
      .select("id,title")
      .ilike("title", "Wyniki zawodów:%")
      .order("created_at", { ascending: false })
      .limit(50);

    const eventKey = buildFacebookEventGroupKey(event.event_title, event.event_date);
    const match = (newsCandidates || []).find((item) => {
      const candidateTitle = item.title.replace(/^wyniki zawodów:\s*/i, "").trim();
      return buildFacebookEventGroupKey(candidateTitle, event.event_date) === eventKey;
    });

    existingNewsId = match?.id || null;
  }

  if (existingNewsId) {
    const { error } = await supabase
      .from("aktualnosci")
      .update({ title, content })
      .eq("id", existingNewsId);

    if (error) {
      throw new Error(error.message);
    }

    await supabase
      .from("facebook_competition_results")
      .update({ news_post_id: existingNewsId, updated_at: new Date().toISOString() })
      .eq("event_date", event.event_date || null)
      .in(
        "event_title",
        [...new Set(event.results.map((row) => row.event_title).filter(Boolean))]
      );

    return { created: false, updated: true as const, newsPostId: existingNewsId };
  }

  const { data, error } = await supabase
    .from("aktualnosci")
    .insert([{ title, content }])
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message || "Nie udało się utworzyć aktualności.");
  }

  const newsPostId = data.id as string;

  await supabase
    .from("facebook_competition_results")
    .update({ news_post_id: newsPostId, updated_at: new Date().toISOString() })
    .eq("event_date", event.event_date || null)
    .in(
      "event_title",
      [...new Set(event.results.map((row) => row.event_title).filter(Boolean))]
    );

  await seedDefaultTemplatesIfEmpty();

  if (options?.notify === false) {
    return { created: true as const, updated: false, newsPostId };
  }

  const preview = content.length > 120 ? `${content.slice(0, 117).trim()}…` : content;

  await notifyClubMembers({
    templateKey: "news_published",
    variables: { title, content: preview },
    channels: {
      email: false,
      sms: false,
      inApp: true,
      push: true,
    },
    type: "news",
    link: "/aktualnosci",
  });

  return { created: true as const, updated: false, newsPostId };
}
