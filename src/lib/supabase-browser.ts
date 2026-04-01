import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export function createSupabaseBrowserClient() {
  return createClient(env.supabaseUrl, env.supabasePublishableKey);
}
