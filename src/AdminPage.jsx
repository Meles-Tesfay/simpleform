import React, { useMemo, useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

  const total = rows.length;
  const yearCounts = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const key = r?.answers?.year || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

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
        setError(`Cannot reach backend at ${apiBase}. Start it with: npm run server`);
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
            <div style={{ marginTop: 10 }}>
              <strong>Latest raw rows (admin only):</strong>
              <pre style={{ maxHeight: 260, overflow: "auto", fontSize: 12 }}>
                {JSON.stringify(rows.slice(0, 20), null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
