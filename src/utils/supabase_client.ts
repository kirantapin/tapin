import { createClient, SupabaseClient } from "@supabase/supabase-js";
//supabase client
const environment_override = null;

const supabase_key =
  environment_override || process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_SUPABASE_ANON_KEY
    : process.env.NODE_ENV === "staging"
    ? process.env.REACT_APP_SUPABASE_ANON_KEY_STAGING
    : process.env.REACT_APP_SUPABASE_ANON_KEY_DEV;

export const project_ref =
  environment_override || process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_PROJECT_REF
    : process.env.NODE_ENV === "staging"
    ? process.env.REACT_APP_PROJECT_REF_STAGING
    : process.env.REACT_APP_PROJECT_REF_DEV;
export const project_url = `https://${project_ref}.supabase.co`;

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
