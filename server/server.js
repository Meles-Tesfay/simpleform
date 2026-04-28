const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: ".env.local" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env. Set them before running the server.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/survey", async (req, res) => {
  try {
    const payload = req.body;
    // Use RPC to insert (function should exist)
    const { data, error } = await supabase.rpc("insert_survey", { payload });
    if (error) {
      // Try direct insert as fallback
      const ins = await supabase
        .from("survey_responses")
        .insert([{ answers: payload }]);
      if (ins.error) return res.status(500).json({ error: ins.error.message });
      return res.json({ id: ins.data && ins.data[0] && ins.data[0].id });
    }
    return res.json({ id: data });
  } catch (err) {
    console.error("server insert error", err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin export endpoint (secure)
function checkAdminSecret(req) {
  const secret = process.env.ADMIN_SECRET || process.env.SUPABASE_ADMIN_SECRET;
  if (!secret) return false;
  const header = req.get("x-admin-secret") || req.query.admin_secret;
  return header && header === secret;
}

function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(keys.map((k) => esc(r[k])).join(","));
  }
  return lines.join("\n");
}

app.get("/api/admin/export", async (req, res) => {
  try {
    if (!checkAdminSecret(req))
      return res.status(401).json({ error: "Unauthorized" });

    const format = (req.query.format || "json").toLowerCase();
    const limit = parseInt(req.query.limit || "0", 10) || 0;

    let query = supabase.from("survey_responses").select("*");
    if (limit > 0) query = query.limit(limit);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    if (format === "csv") {
      const csv = toCSV(data || []);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=survey_export.csv",
      );
      return res.send(csv);
    }

    return res.json({ rows: data || [] });
  } catch (err) {
    console.error("admin export error", err);
    return res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, () =>
  console.log(`Fallback server listening on ${PORT}`),
);

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Another server is likely already running.`,
    );
    console.error(
      "Stop the existing process or run with a different port, e.g. PORT=3001 npm run server",
    );
    process.exit(1);
  }
  throw err;
});
