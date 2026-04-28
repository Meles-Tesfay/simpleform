import React, { useState } from "react";

const suggestions = [
  "Tomoca Coffee",
  "Kaldi's",
  "Local Juice House",
  "Java House",
];

const questions = [
  {
    id: "year",
    type: "single",
    q: "What is your year of study?",
    am: "ስንተኛ ዓመት ነዎት?",
    options: ["1st year", "2nd year", "3rd year", "4th year", "Graduate"],
  },
  {
    id: "freq",
    type: "freq",
    q: "How often do you go outside campus?",
    am: "በሳምንት ስንት ጊዜ ከካምፓስ ውጭ ይወጣሉ?",
    globalOptions: ["Never"],
    groups: [
      {
        id: 'week',
        label: 'Per week',
        am: 'በሳምንት',
        options: ['1-2 times','3-4 times','5+ times']
      },
      {
        id: 'month',
        label: 'Per month',
        am: 'በወር',
        options: ['Once a month','2-3 times a month','4+ times a month']
      }
    ]
  },
  {
    id: "where",
    type: "multi",
    q: "Where do you usually go? (Select all that apply)",
    am: "ብዙ ጊዜ የሚሄዱት የት ነው? (ከብዙ ምርጫ ይምረጡ)",
    options: [
      "Cafés ☕",
      "Restaurants 🍽",
      "Juice houses 🥤",
      "Shops 🛍",
      "Entertainment 🎮",
      "Other (please specify) — ሌላ (ይጻፉ)",
    ],
  },
  {
    id: "business",
    type: "business",
    q: "Which exact place do you visit the MOST?",
    am: "ብዙ ጊዜ የሚሄዱበት ቦታ ምንድን ነው?",
  },
  {
    id: "spend",
    type: "single",
    q: "How much do you usually spend per visit?",
    am: "በአንድ ጊዜ ስንት ብር ይወጣሉ?",
    options: ["Less than 50 birr", "50 – 100 birr", "100 – 200 birr", "More than 200 birr"],
  },
];

export default function App() {
  const [i, setI] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState({});
  const [expandedFreqGroup, setExpandedFreqGroup] = useState(null);
  const stepCount = questions.length + 1;

  function setAnswer(key, val) {
    setAnswers((a) => ({ ...a, [key]: val }));
  }

  async function submit() {
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (res.ok) {
        setI(stepCount);
        return;
      }
    } catch (e) {
      console.warn("submit failed", e);
    }
    console.log("Survey submission (local):", answers);
    setI(stepCount);
  }

  if (i === -1)
    return (
      <div className="app">
        <div className="card">
          <div className="meta">
            <div className="progress">
              <span style={{ width: "4%" }} />
            </div>
            <div className="step">Intro</div>
          </div>
          <div className="question-area">
            <div className="question enter">
              <h2>Takes only 30 seconds ⏱</h2>
              <div className="amharic">ብዙ ጊዜ አይወስድም — የ30 ሰከንድ ጥያቄዎች</div>

              <p className="small-note" style={{ marginTop: 10 }}>
                This survey is anonymous and only used for general research. Please answer based on your real experience. ✅
              </p>
              <div className="amharic" style={{ fontSize: 13, marginTop: 8, color: "#56606a" }}>
                ይህ መረጃ ስም ሳይጠየቅ ለጠቅላላ ጥናት ብቻ ይጠቀማል። እባክዎ በእውነተኛ ልምድዎ መሠረት ይመልሱ።
              </div>

              <div className="small-note" style={{ marginTop: 12 }}>
                Almost done 👀
              </div>

              <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setI(0)}>
                Start Survey 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  if (i >= stepCount)
    return (
      <div className="app">
        <div className="card">
          <div className="question enter">
            <h2>🎉 You’re done! Thanks for helping improve student life.</h2>
            <div className="amharic">እስራሕ! አመሰግናለን — ለተማሪዎ ሕይወት ለማሻሻል ተማሪ ግምገማዎ ጠቃሚ ነው።</div>
            <div style={{ marginTop: 10, fontWeight: 700 }}>Thank you for your time. 🙏</div>
            <div className="amharic" style={{ marginTop: 4, color: "#56606a" }}>
              ለጊዜዎ እናመሰግናለን። 🙏
            </div>
            <div className="small-note">We use this data to bring better student discounts 👀</div>
            <pre style={{ marginTop: 12, fontSize: 13 }}>{JSON.stringify(answers, null, 2)}</pre>
          </div>
        </div>
      </div>
    );

  const q = questions[i];

  return (
    <div className="app">
      <div className="card">
        <div className="meta">
          <div className="progress">
            <span style={{ width: `${Math.round((i / stepCount) * 100)}%` }} />
          </div>
          <div className="step">
            Step {i + 1} of {stepCount}
          </div>
        </div>

        <div className="question-area">
          <div className="question enter">
            <h2>{q.q}</h2>
            <div className="amharic">{q.am}</div>

            {q.type === "single" && (
              <div className="options">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    className={`option-button`}
                    onClick={() => {
                      setAnswer(q.id, opt);
                      setI((s) => s + 1);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'freq' && (
              <div>
                <div style={{marginBottom:10}}>
                  {q.globalOptions && q.globalOptions.map(g=> (
                    <button key={g} className="option-button" style={{marginRight:8}} onClick={()=>{ setAnswer('freq',{period:'none',value:g}); setI(s=>s+1) }}>{g}</button>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {q.groups.map((gr) => (
                    <div key={gr.id} className="freq-group">
                      <div className="group-header" onClick={() => setExpandedFreqGroup((cur) => (cur === gr.id ? null : gr.id))}>
                        <div>
                          <div style={{fontWeight:700}}>{gr.label}</div>
                          <div className="amharic" style={{fontSize:13,marginTop:4}}>{gr.am}</div>
                        </div>
                        <div className={`chev ${expandedFreqGroup === gr.id ? 'expanded' : ''}`}>›</div>
                      </div>

                      {expandedFreqGroup === gr.id && (
                        <div className="group-body">
                          {gr.options.map((opt) => (
                            <button key={opt} className="option-button" onClick={() => { setAnswer('freq', { period: gr.id, value: opt }); setI((s) => s + 1); }}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {q.type === "multi" && (
              <MultiSelect q={q} value={answers[q.id] || []} onChange={(v) => setAnswer(q.id, v)} onNext={() => setI((s) => s + 1)} />
            )}

            {q.type === "business" && (
              <BusinessInput
                onChoose={(v) => {
                  setAnswer("business_name", v);
                }}
                onSetFreq={(v) => {
                  setAnswer("business_freq", v);
                  setI((s) => s + 1);
                }}
              />
            )}
          </div>
        </div>

        <div className="controls">
          <button className="btn ghost" onClick={() => setI((s) => Math.max(-1, s - 1))} style={{ visibility: i === 0 ? "hidden" : "visible" }}>
            Back
          </button>
          <button
            className="btn primary"
            onClick={() => {
              if (q.type === "multi") {
                if (!(answers[q.id] || []).length) {
                  alert("Please select at least one option");
                  return;
                }
              }
              if (i === questions.length - 1) {
                submit();
              } else {
                setI((s) => s + 1);
              }
            }}
          >
            {i === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ q, value, onChange, onNext }) {
  const [sel, setSel] = useState(new Set(value));
  function toggle(opt) {
    const next = new Set(sel);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    setSel(next);
    onChange(Array.from(next));
  }
  return (
    <div>
      <div className="options">
        {q.options.map((opt) => (
          <button key={opt} className={`option-button ${sel.has(opt) ? "selected" : ""}`} onClick={() => toggle(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {sel.has("Other (please specify) — ሌላ (ይጻፉ)") && (
        <input className="input" placeholder="If Other, tell us which (optional)" onChange={(e) => onChange([...Array.from(sel).filter((x) => !x.includes("Other")), e.target.value])} />
      )}
      <div className="small-note">Tap to select multiple. Then press Next.</div>
    </div>
  );
}

function BusinessInput({ onChoose, onSetFreq }) {
  const [custom, setCustom] = useState("");
  return (
    <div>
      <div className="chips">
        {suggestions.map((s) => (
          <div key={s} className="chip" onClick={() => { setCustom(""); onChoose(s); }}>
            {s}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <input className="input" placeholder="e.g. Tomoca Coffee, Kaldi's, Local Juice House" value={custom} onChange={(e) => { setCustom(e.target.value); onChoose(e.target.value); }} />
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="small-note">How often do you go there?</div>
        {['Daily','Weekly','Occasionally'].map((f) => (
          <button key={f} className="option-button" style={{ marginTop: 8 }} onClick={() => onSetFreq(f)}>{f}</button>
        ))}
      </div>
    </div>
  );
}
