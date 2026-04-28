import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function Stats({ onClose }) {
  const [loading, setLoading] = useState(true)
  const [placeCounts, setPlaceCounts] = useState([])
  const [freqCounts, setFreqCounts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)

      // Preferred: read from aggregated views created in Supabase
      const tryViews = async () => {
        try {
          const { data: places, error: pErr } = await supabase.from('view_place_counts').select('*').order('cnt', { ascending: false })
          const { data: freqs, error: fErr } = await supabase.from('view_freq_counts').select('*').order('cnt', { ascending: false })
          if (pErr || fErr) throw pErr || fErr
          return { places, freqs }
        } catch (e) {
          return null
        }
      }

      const views = await tryViews()
      if (views) {
        if (!mounted) return
        setPlaceCounts(views.places || [])
        setFreqCounts(views.freqs || [])
        setLoading(false)
        return
      }

      // Fallback: compute aggregates client-side from table
      try {
        // Try to read columns directly
        const { data, error: sErr } = await supabase.from('survey_responses').select('where_choices, freq_value, answers')
        if (sErr) throw sErr

        const placeMap = new Map()
        const freqMap = new Map()

        (data || []).forEach((r) => {
          // where_choices is text[] in table; may be null
          if (r.where_choices) {
            r.where_choices.forEach((p) => placeMap.set(p, (placeMap.get(p) || 0) + 1))
          } else if (r.answers && r.answers.where) {
            (r.answers.where || []).forEach((p) => placeMap.set(p, (placeMap.get(p) || 0) + 1))
          }
          const fv = r.freq_value || (r.answers && r.answers.freq && r.answers.freq.value)
          if (fv) freqMap.set(fv, (freqMap.get(fv) || 0) + 1)
        })

        const places = Array.from(placeMap.entries()).map(([place, cnt]) => ({ place, cnt })).sort((a, b) => b.cnt - a.cnt)
        const freqs = Array.from(freqMap.entries()).map(([freq, cnt]) => ({ freq, cnt })).sort((a, b) => b.cnt - a.cnt)

        if (!mounted) return
        setPlaceCounts(places)
        setFreqCounts(freqs)
        setLoading(false)
      } catch (e) {
        console.error('stats load err', e)
        if (!mounted) return
        setError(e.message || String(e))
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ width: 760, maxWidth: '96%', background: '#fff', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Survey Stats — Aggregate only (no user data)</h3>
          <div>
            <button className="btn ghost" onClick={onClose} style={{ marginRight: 8 }}>Close</button>
          </div>
        </div>

        {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
        {error && <div style={{ marginTop: 16, color: 'red' }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 16 }}>
            <div>
              <h4>Places (how many selections)</h4>
              <ul>
                {placeCounts.length ? placeCounts.map((p) => (
                  <li key={p.place || p.place} style={{ marginBottom: 8 }}>
                    <strong style={{ marginRight: 8 }}>{p.place}</strong>
                    <span style={{ color: '#666' }}>{p.cnt || p.count || p.cnt}</span>
                  </li>
                )) : <li>No data</li>}
              </ul>
            </div>

            <div>
              <h4>Frequency (how often)</h4>
              <ul>
                {freqCounts.length ? freqCounts.map((f) => (
                  <li key={f.freq || f.place} style={{ marginBottom: 8 }}>
                    <strong style={{ marginRight: 8 }}>{f.freq || f.place}</strong>
                    <span style={{ color: '#666' }}>{f.cnt || f.count || f.cnt}</span>
                  </li>
                )) : <li>No data</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
