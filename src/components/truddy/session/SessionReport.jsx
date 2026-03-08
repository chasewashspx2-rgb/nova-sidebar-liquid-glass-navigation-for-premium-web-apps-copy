import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Pencil, Check, X, Brain, Lightbulb, AlertCircle, Star } from "lucide-react";
import { MoodBadge } from "@/components/truddy/MoodBadge";
import { format } from "date-fns";

const emotionScore = { confident: 9, focused: 8, excited: 7, neutral: 5, tired: 4, anxious: 3, fomo: 2, angry: 1 };
const emotionColor = {
  focused: "rgba(104,155,251,0.9)", confident: "rgba(72,199,142,0.9)", excited: "rgba(250,210,60,0.9)",
  neutral: "rgba(160,172,195,0.8)", tired: "rgba(130,100,220,0.9)", anxious: "rgba(255,180,80,0.9)",
  fomo: "rgba(255,100,80,0.9)", angry: "rgba(220,60,60,0.9)", regret: "rgba(180,80,80,0.9)", proud: "rgba(255,200,50,0.9)"
};

function ArcTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-[12px] text-xs max-w-[200px]"
      style={{ background: "rgba(15,20,35,0.92)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div className="font-semibold mb-1" style={{ color: emotionColor[d.emotion] }}>{d.emotion}</div>
      <div className="opacity-70 leading-relaxed">{d.text}</div>
      <div className="opacity-40 mt-1">{d.time}</div>
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, payload } = props;
  const color = emotionColor[payload.emotion] || "rgba(160,172,195,0.8)";
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
    </g>
  );
}

function AnnotatableEntry({ entry, index, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.annotation || "");

  const save = () => { onSave(index, draft); setEditing(false); };
  const cancel = () => { setDraft(entry.annotation || ""); setEditing(false); };

  const isNegative = ["anxious", "angry", "fomo", "tired"].includes(entry.emotion);

  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
      className="relative flex gap-3 pl-4"
      style={{ borderLeft: `3px solid ${emotionColor[entry.emotion] || "rgba(160,172,195,0.5)"}` }}>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono opacity-45">{format(new Date(entry.timestamp), "HH:mm:ss")}</span>
          {entry.emotion && <MoodBadge emotion={entry.emotion} />}
          {isNegative && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,100,80,0.12)", color: "rgba(255,100,80,0.9)", border: "1px solid rgba(255,100,80,0.25)" }}>⚠ Coaching moment</span>}
        </div>
        <p className="text-sm leading-relaxed">{entry.text}</p>
        {entry.ai_response && (
          <div className="flex gap-2 p-2.5 rounded-[12px] text-xs leading-relaxed"
            style={{ background: "rgba(104,155,251,0.08)", border: "1px solid rgba(104,155,251,0.18)" }}>
            <span className="text-[rgba(104,155,251,0.9)] flex-shrink-0">✦</span>
            <span className="opacity-75">{entry.ai_response}</span>
          </div>
        )}
        {/* Annotation */}
        <AnimatePresence>
          {editing ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 mt-1">
              <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                placeholder="Add your annotation..."
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-transparent outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.3)", background: "rgba(var(--glass),0.3)" }} />
              <button onClick={save} className="w-8 h-8 rounded-lg grid place-items-center cursor-pointer" style={{ background: "rgba(72,199,142,0.2)", border: "1px solid rgba(72,199,142,0.4)" }}><Check size={13} /></button>
              <button onClick={cancel} className="w-8 h-8 rounded-lg grid place-items-center cursor-pointer opacity-50 hover:opacity-100" style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.25)" }}><X size={13} /></button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              {entry.annotation && <span className="text-xs opacity-60 italic">📝 {entry.annotation}</span>}
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[10px] opacity-30 hover:opacity-70 transition-opacity cursor-pointer">
                <Pencil size={10} /> {entry.annotation ? "Edit" : "Annotate"}
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function SessionReport({ session, onUpdateAnnotation }) {
  const entries = session.entries || [];

  const arcData = entries.map((e, i) => ({
    index: i + 1,
    score: emotionScore[e.emotion] ?? 5,
    emotion: e.emotion || "neutral",
    time: format(new Date(e.timestamp), "HH:mm"),
    text: e.text.length > 60 ? e.text.slice(0, 60) + "…" : e.text,
  }));

  const score = session.overall_score || 0;
  const scoreColor = score >= 7 ? "rgba(72,199,142,0.9)" : score >= 5 ? "rgba(255,180,80,0.9)" : "rgba(255,100,80,0.9)";

  return (
    <div className="flex flex-col gap-5">
      {/* Score + Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
        <div className="flex flex-col items-center justify-center px-6 py-5 rounded-[20px] text-center"
          style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.3)", minWidth: 110 }}>
          <div className="text-4xl font-bold" style={{ color: scoreColor }}>{score.toFixed(1)}</div>
          <div className="text-[11px] opacity-50 mt-1">Psych Score</div>
          <div className="mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="inline" fill={i < Math.round(score / 2) ? scoreColor : "transparent"} style={{ color: scoreColor }} />
            ))}
          </div>
        </div>
        <div className="px-5 py-4 rounded-[20px] flex flex-col justify-center"
          style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="opacity-60" />
            <span className="text-xs font-semibold opacity-60 uppercase tracking-wide">AI Session Summary</span>
          </div>
          <p className="text-sm leading-relaxed">{session.summary || "No summary available."}</p>
        </div>
      </div>

      {/* Emotional Arc */}
      {arcData.length > 1 && (
        <div className="p-4 rounded-[20px]" style={{ background: "rgba(var(--glass),0.28)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <div className="text-xs font-semibold opacity-50 uppercase tracking-wide mb-3">Emotional Arc</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={arcData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(104,155,251,0.4)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgba(104,155,251,0.0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "rgba(var(--muted),0.6)" }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: "rgba(var(--muted),0.6)" }} />
              <Tooltip content={<ArcTooltip />} />
              <Area type="monotone" dataKey="score" stroke="rgba(104,155,251,0.7)" strokeWidth={2}
                fill="url(#arcGrad)" dot={<CustomDot />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Patterns & Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {session.patterns?.length > 0 && (
          <div className="p-4 rounded-[20px]" style={{ background: "rgba(255,100,80,0.08)", border: "1px solid rgba(255,100,80,0.22)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} style={{ color: "rgba(255,100,80,0.9)" }} />
              <span className="text-xs font-semibold" style={{ color: "rgba(255,100,80,0.9)" }}>Behavioral Patterns</span>
            </div>
            <ul className="flex flex-col gap-2">
              {session.patterns.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="opacity-40 flex-shrink-0">·</span>
                  <span className="leading-snug opacity-85">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {session.recommendations?.length > 0 && (
          <div className="p-4 rounded-[20px]" style={{ background: "rgba(72,199,142,0.08)", border: "1px solid rgba(72,199,142,0.22)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} style={{ color: "rgba(72,199,142,0.9)" }} />
              <span className="text-xs font-semibold" style={{ color: "rgba(72,199,142,0.9)" }}>Recommendations</span>
            </div>
            <ul className="flex flex-col gap-2">
              {session.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span style={{ color: "rgba(72,199,142,0.7)" }} className="flex-shrink-0">→</span>
                  <span className="leading-snug opacity-85">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Annotatable Timeline */}
      {entries.length > 0 && (
        <div className="p-4 rounded-[20px]" style={{ background: "rgba(var(--glass),0.22)", border: "1px solid rgba(255,255,255,0.24)" }}>
          <div className="text-xs font-semibold opacity-50 uppercase tracking-wide mb-4">Session Timeline — click any entry to annotate</div>
          <div className="flex flex-col gap-5">
            {entries.map((entry, i) => (
              <AnnotatableEntry key={i} entry={entry} index={i} onSave={onUpdateAnnotation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}