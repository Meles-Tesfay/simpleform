const { getAdminSecret, getSupabaseAdmin } = require("../_supabase");

function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [keys.join(",")];
  for (const row of rows) {
    lines.push(keys.map((k) => esc(row[k])).join(","));
  }
  return lines.join("\n");
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const expected = getAdminSecret();
    if (!expected) return res.status(500).json({ error: "ADMIN_SECRET is not configured" });

    const provided = req.headers["x-admin-secret"] || req.query.admin_secret;
    if (!provided || provided !== expected) return res.status(401).json({ error: "Unauthorized" });

    const format = (req.query.format || "json").toLowerCase();
    const limit = parseInt(req.query.limit || "0", 10) || 0;

    const supabase = getSupabaseAdmin();
    let query = supabase.from("survey_responses").select("*");
    if (limit > 0) query = query.limit(limit);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    if (format === "csv") {
      const csv = toCSV(data || []);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=survey_export.csv");
      return res.status(200).send(csv);
    }

    return res.status(200).json({ rows: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
};
