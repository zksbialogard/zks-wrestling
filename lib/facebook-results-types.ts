export type FacebookResultRecord = {
  id: string;
  facebook_post_id: string;
  event_title: string;
  event_date?: string | null;
  location: string;
  athlete_name: string;
  weight_class: string;
  style: string;
  place?: number | null;
  year: number;
  source_url?: string | null;
  published: boolean;
  club_place?: number | null;
  club_points?: string | null;
  news_post_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FacebookResultInput = {
  facebook_post_id: string;
  event_title: string;
  event_date?: string | null;
  location?: string;
  athlete_name: string;
  weight_class?: string;
  style?: string;
  place?: number | null;
  year: number;
  source_url?: string | null;
  published?: boolean;
  club_place?: number | null;
  club_points?: string | null;
};

export type FacebookEventResults = {
  facebook_post_id: string;
  event_title: string;
  event_date?: string | null;
  location: string;
  source_url?: string | null;
  club_place?: number | null;
  club_points?: string | null;
  news_post_id?: string | null;
  results: FacebookResultRecord[];
};

export type FacebookPost = {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
};

export type ParsedFacebookResult = {
  athlete_name: string;
  place: number;
  weight_class?: string;
  style?: string;
};

export type FacebookSeedEvent = {
  facebook_post_id: string;
  event_title: string;
  event_date: string;
  location?: string;
  source_url?: string;
  results: Array<{
    athlete_name: string;
    place: number;
    weight_class?: string;
    style?: string;
  }>;
};
