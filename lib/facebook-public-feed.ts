import type { FacebookPost } from "./facebook-results-types";

export const FACEBOOK_PUBLIC_USER_AGENT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

function decodeFacebookText(raw: string) {
  return raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function extractTimestamp(html: string, postId: string) {
  const patterns = [
    new RegExp(`"post_id":"${postId}"[^}]*?"creation_time":(\\d+)`),
    new RegExp(`"post_id":"${postId}"[^}]*?"created_time":"([^"]+)"`),
    new RegExp(`"story_fbid":"${postId}"[^}]*?"creation_time":(\\d+)`),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    if (/^\d+$/.test(match[1])) {
      return new Date(Number(match[1]) * 1000).toISOString();
    }

    return new Date(match[1]).toISOString();
  }

  return new Date().toISOString();
}

function parsePostsFromHtml(html: string, pageUrl: string): FacebookPost[] {
  const posts = new Map<string, FacebookPost>();

  const combinedPattern =
    /"post_id":"(\d+)"[\s\S]{0,4000}?"message":\{"text":"((?:\\.|[^"\\])*)"/g;

  for (const match of html.matchAll(combinedPattern)) {
    const id = match[1];
    const message = decodeFacebookText(match[2]).trim();

    if (!message || posts.has(id)) continue;

    posts.set(id, {
      id,
      message,
      created_time: extractTimestamp(html, id),
      permalink_url: `https://www.facebook.com/${pageUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, "")}/posts/${id}`,
    });
  }

  if (posts.size > 0) {
    return Array.from(posts.values());
  }

  for (const match of html.matchAll(/"message":\{"text":"((?:\\.|[^"\\])*)"/g)) {
    const message = decodeFacebookText(match[1]).trim();
    if (!message) continue;

    const syntheticId = `public-${hashMessage(message)}`;
    if (posts.has(syntheticId)) continue;

    posts.set(syntheticId, {
      id: syntheticId,
      message,
      created_time: new Date().toISOString(),
      permalink_url: pageUrl,
    });
  }

  return Array.from(posts.values());
}

function hashMessage(message: string) {
  let hash = 0;

  for (let i = 0; i < message.length; i += 1) {
    hash = (hash * 31 + message.charCodeAt(i)) >>> 0;
  }

  return hash.toString(36);
}

function parseRssItems(xml: string, pageUrl: string): FacebookPost[] {
  const items: FacebookPost[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;

  for (const match of xml.matchAll(itemPattern)) {
    const block = match[1];
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
    const description = block
      .match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]
      ?.trim();
    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
    const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim();

    const message = stripHtml(description || title || "");
    if (!message) continue;

    const id = guid?.match(/\d{8,}/)?.[0] || `rss-${hashMessage(message)}`;

    items.push({
      id,
      message,
      created_time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      permalink_url: link || pageUrl,
    });
  }

  return items;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .trim();
}

export async function fetchFacebookPostsFromPublicPage(
  pageUrl = "https://www.facebook.com/zksbialogard"
): Promise<FacebookPost[]> {
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": FACEBOOK_PUBLIC_USER_AGENT },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać publicznej strony Facebooka (${response.status}).`);
  }

  const html = await response.text();
  return parsePostsFromHtml(html, pageUrl);
}

export async function fetchFacebookPostsFromRss(feedUrl: string): Promise<FacebookPost[]> {
  const response = await fetch(feedUrl, { next: { revalidate: 0 } });

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać kanału RSS Facebooka (${response.status}).`);
  }

  const xml = await response.text();
  return parseRssItems(xml, FACEBOOK_CLUB_PAGE_URL);
}

export const FACEBOOK_CLUB_PAGE_URL = "https://www.facebook.com/zksbialogard";
