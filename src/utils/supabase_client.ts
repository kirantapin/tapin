import { createClient, SupabaseClient } from "@supabase/supabase-js";
//supabase client
const supabase_key = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const project_url = process.env.REACT_APP_PROJECT_URL;

let supabase_key_local = process.env.REACT_APP_SUPABASE_ANON_KEY_LOCAL || "";
let project_url_local = process.env.REACT_APP_PROJECT_URL_LOCAL || "";

if (!supabase_key || !project_url) {
  throw new Error(
    "Missing Supabase environment variables: REACT_APP_SUPABASE_ANON_KEY or REACT_APP_PROJECT_URL"
  );
}

export const supabase: SupabaseClient = createClient(project_url, supabase_key);
export const supabase_local: SupabaseClient = createClient(
  window.location.hostname === "localhost" ? project_url_local : project_url,
  window.location.hostname === "localhost" ? supabase_key_local : supabase_key
);

// export const supabase_local: SupabaseClient = createClient(
//   project_url_local,
//   supabase_key_local
// );
