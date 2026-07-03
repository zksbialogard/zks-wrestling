import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ubvgiglzteunqgxmezkt.supabase.co";

const supabaseKey =
  "sb_publishable_Z3bExNGFkGBwNoS8GNYA5Q_zktBkUw0";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);