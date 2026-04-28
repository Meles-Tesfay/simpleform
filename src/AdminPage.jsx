import React, { useMemo, useState } from "react";

function parseAnswers(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function formatFreq(freq) {
  if (!freq) return "-";
  if (typeof freq === "string") return freq;
  const period = freq.period ? `${freq.period}: ` : "";
  const value = freq.value || "";
  return `${period}${value}`.trim() || "-";
}

function formatList(value) {
  if (!value) return "-";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "-";
  return String(value);
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  const normalizedRows = useMemo(
    () =>
      rows.map((r) => {
        const answers = parseAnswers(r?.answers);
        return {
          id: r?.id ?? "-",
          createdAt: r?.created_at || r?.inserted_at || null,
          year: answers.year || "-",
          freq: formatFreq(answers.freq),
          where: formatList(answers.where),
          business: answers.business_name || "-",
          businessFreq: answers.business_freq || "-",
          spend: answers.spend || "-",
          feedback: answers.feedback || "-",
        };
      }),
    [rows],
  );

  const total = normalizedRows.length;
  const yearCounts = useMemo(() => {
    const map = new Map();
    normalizedRows.forEach((r) => {
      const key = r.year || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [normalizedRows]);

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/admin/export?format=json`, {
        headers: { "x-admin-secret": secret },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to load admin data");
      setRows(body.rows || []);
    } catch (err) {
      setRows([]);
      const msg = err?.message || String(err);
      if (msg.includes("Failed to fetch")) {
        const baseLabel = apiBase || "same origin (/api)";
        setError(`Cannot reach backend at ${baseLabel}. Start it with: npm run server`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="card" style={{ maxWidth: 900 }}>
        <h2>Admin Dashboard</h2>
        <div className="small-note">
          Only users with admin secret can access full survey responses.
        </div>

        <input
          className="input"
          type="password"
          placeholder="Enter ADMIN_SECRET"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />

        <div className="controls">
          <button className="btn primary" onClick={loadRows} disabled={loading || !secret}>
            {loading ? "Loading..." : "Load Responses"}
          </button>
        </div>

        {error ? <div style={{ color: "red", marginTop: 12 }}>{error}</div> : null}

        {!error && rows.length > 0 ? (
          <div style={{ marginTop: 16 }}>
            <div><strong>Total responses:</strong> {total}</div>
            <div style={{ marginTop: 10 }}>
              <strong>By year:</strong>
              <ul>
                {yearCounts.map(([year, count]) => (
                  <li key={year}>
                    {year}: {count}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 14 }}>
              <strong>Responses (organized)</strong>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Year</th>
                      <th style={thStyle}>Frequency</th>
                      <th style={thStyle}>Places</th>
                      <th style={thStyle}>Business</th>
                      <th style={thStyle}>Business Freq</th>
                      <th style={thStyle}>Spend</th>
                      <th style={thStyle}>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedRows.slice(0, 200).map((r) => (
                      <tr key={r.id}>
                        <td style={tdStyle}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                        <td style={tdStyle}>{r.year}</td>
                        <td style={tdStyle}>{r.freq}</td>
                        <td style={tdStyle}>{r.where}</td>
                        <td style={tdStyle}>{r.business}</td>
                        <td style={tdStyle}>{r.businessFreq}</td>
                        <td style={tdStyle}>{r.spend}</td>
                        <td style={{ ...tdStyle, maxWidth: 240 }}>{r.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #dbe6f3",
  color: "#21414f",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #ecf1f7",
  verticalAlign: "top",
  color: "#163947",
};
