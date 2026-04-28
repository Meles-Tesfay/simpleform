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
    q: "What year are you studying?",
    am: "የትኛው ዓመት ነዎት?",
    options: ["1st year", "2nd year", "3rd year", "4th year", "Graduate"],
  },
  {
    id: "living",
    type: "single",
    q: "Where do you live?",
    am: "የት እንደምትኖሩ?",
    options: ["On-campus", "Off-campus"],
  },
  {
    id: "freq",
    type: "single",
    q: "How often do you go outside campus per week?",
    am: "እባክዎ በሳምንት ስንት ጊዜ እየወጡ ነው?",
    options: ["Never", "1-2 times", "3-4 times", "5+ times"],
  },
  {
    id: "where",
    type: "multi",
    q: "Where do you usually go? (pick any)",
    am: "የተለመዱት የምትሄዱበት ቦታ የት ነው?",
    options: [
      "Cafés",
      "Restaurants",
      "Juice houses",
      "Shops",
      "Entertainment",
      "Libraries",
      "Other",
    ],
  },
  {
    id: "reason",
    type: "single",
    q: "What is the main reason you go out?",
    am: "ዋናው ምክንያት ምንድን ነው?",
    options: [
      "Food/Drink",
      "Study/Group work",
      "Socializing",
      "Shopping",
      "Entertainment",
      "Other",
    ],
  },
  {
    id: "spend",
    type: "composite",
    q: "How much do you usually spend per visit?",
    am: "በእያንዳንዱ ጉብኝት እስከምን ያክላሉ?",
  },
  {
    id: "business",
    type: "business",
    q: "Which place do you visit the MOST?",
    am: "የብዙ ጊዜ የምትጎብኙት ቦታ የት ነው?",
  },
];

export default function App() {
  const [i, setI] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState({});
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
    // fallback: show final and log
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
              <div className="small-note">
                Almost done 👀 — quick and anonymous.
              </div>
              <button
                className="btn primary"
                style={{ marginTop: 16 }}
                onClick={() => setI(0)}
              >
                Start Survey
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
            <div className="amharic">
              እስራሕ! አመሰግናለን — ለተማሪዎ ሕይወት ለማሻሻል ተማሪ ግምገማዎ ጠቃሚ ነው።
            </div>
            <div className="small-note">
              We use this data to bring better student discounts 👀
            </div>
            <pre style={{ marginTop: 12, fontSize: 13 }}>
              {JSON.stringify(answers, null, 2)}
            </pre>
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

            {q.type === "multi" && (
              <MultiSelect
                q={q}
                value={answers[q.id] || []}
                onChange={(v) => setAnswer(q.id, v)}
                onNext={() => setI((s) => s + 1)}
              />
            )}

            {q.type === "composite" && (
              <div>
                <div className="options">
                  {["< $1", "$1 - $3", "$3 - $6", "> $6"].map((r) => (
                    <button
                      key={r}
                      className="option-button"
                      onClick={() => {
                        setAnswer("spend_per_visit", r);
                        setI((s) => s + 1);
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="small-note">
                    Or drag to pick an approximate amount (optional)
                  </div>
                  <input
                    className="slider"
                    type="range"
                    min="0"
                    max="100"
                    onInput={(e) => setAnswer("spend_slider", e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Weekly total spending (optional)"
                    type="number"
                    onChange={(e) => setAnswer("weekly_total", e.target.value)}
                  />
                </div>
              </div>
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
          <button
            className="btn ghost"
            onClick={() => setI((s) => Math.max(-1, s - 1))}
            style={{ visibility: i === 0 ? "hidden" : "visible" }}
          >
            Back
          </button>
          <button
            className="btn primary"
            onClick={() => {
              // if current is multi require selection
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
          <button
            key={opt}
            className={`option-button ${sel.has(opt) ? "selected" : ""}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {sel.has("Other") && (
        <input
          className="input"
          placeholder="If Other, tell us which (optional)"
          onChange={(e) =>
            onChange([
              ...Array.from(sel).filter((x) => x !== "Other"),
              e.target.value,
            ])
          }
        />
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
          <div
            key={s}
            className="chip"
            onClick={() => {
              setCustom("");
              onChoose(s);
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="e.g. Tomoca Coffee, Kaldi's, Local Juice House"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            onChoose(e.target.value);
          }}
        />
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="small-note">How often do you go there?</div>
        {["Daily", "Weekly", "Occasionally"].map((f) => (
          <button
            key={f}
            className="option-button"
            style={{ marginTop: 8 }}
            onClick={() => onSetFreq(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
