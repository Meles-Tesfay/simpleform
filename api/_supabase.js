const { createClient } = require("@supabase/supabase-js");

function getEnv(name) {
  return process.env[name];
}

function getSupabaseAdmin() {
  const url = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
  const serviceRoleKey =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("VITE_SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey);
}

function getAdminSecret() {
  return getEnv("ADMIN_SECRET") || getEnv("SUPABASE_ADMIN_SECRET");
}

module.exports = {
  getSupabaseAdmin,
  getAdminSecret,
};
