const { getSupabaseAdmin } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = req.body || {};

    const { data, error } = await supabase.rpc("insert_survey", { payload });
    if (error) {
      const ins = await supabase.from("survey_responses").insert([{ answers: payload }]).select("id").single();
      if (ins.error) return res.status(500).json({ error: ins.error.message });
      return res.status(200).json({ id: ins.data?.id || null });
    }

    return res.status(200).json({ id: data || null });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
};
