import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (!url || !anonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Supabase client will be a noop.\n" +
      "Create a .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart the dev server.",
  );

  const noop = () => ({ error: new Error("Supabase not configured") });

  supabase = {
    // minimal stubs used by this app: rpc and from
    async rpc() {
      return { data: null, error: new Error("Supabase not configured") };
    },
    from() {
      return {
        async insert() {
          return { data: null, error: new Error("Supabase not configured") };
        },
      };
    },
  };
} else {
  supabase = createClient(url, anonKey);
}

export { supabase };
export default supabase;
