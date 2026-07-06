export type CompetitionResultRecord = {
  id: string;
  event_id: string;
  registration_id?: string | null;
  child_id?: string | null;
  parent_uid?: string | null;
  athlete_name: string;
  weight_class: string;
  place?: number | null;
  published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CompetitionResultInput = {
  registration_id?: string | null;
  child_id?: string | null;
  parent_uid?: string | null;
  athlete_name: string;
  weight_class?: string;
  place?: number | null;
};

export type PublishedEventResults = {
  event_id: string;
  event_title: string;
  event_date: string;
  location: string;
  results: CompetitionResultRecord[];
};
