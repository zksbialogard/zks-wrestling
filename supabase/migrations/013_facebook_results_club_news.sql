-- ZKS Białogard — klasyfikacja klubowa i powiązanie z aktualnością
-- Uruchom w Supabase → SQL Editor

alter table public.facebook_competition_results
  add column if not exists club_place integer check (club_place is null or club_place > 0),
  add column if not exists club_points text,
  add column if not exists news_post_id uuid;

create index if not exists facebook_competition_results_news_idx
  on public.facebook_competition_results (news_post_id)
  where news_post_id is not null;
