import { createClient, SupabaseClient } from "@supabase/supabase-js";
//supabase client
const supabase_key = process.env.REACT_APP_SUPABASE_ANON_KEY;
const project_url = process.env.REACT_APP_PROJECT_URL;

if (!supabase_key || !project_url) {
  throw new Error(
    "Missing Supabase environment variables: REACT_APP_SUPABASE_ANON_KEY or REACT_APP_PROJECT_URL"
  );
}

export const supabase: SupabaseClient = createClient(project_url, supabase_key);
