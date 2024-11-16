import { createClient } from "@supabase/supabase-js";
//supabase client
const supabase_key = process.env.REACT_APP_SUPABASE_ANON_KEY;
const project_url = process.env.REACT_APP_PROJECT_URL;
export const supabase = createClient(project_url, supabase_key);
