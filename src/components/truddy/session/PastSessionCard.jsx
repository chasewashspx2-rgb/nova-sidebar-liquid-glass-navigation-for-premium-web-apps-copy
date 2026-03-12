import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, Trash2 } from "lucide-react";
import { format } from "date-fns";
import MentalStateIndicator from "@/components/truddy/session/MentalStateIndicator";

export default function PastSessionCard({ session, isExpanded, onToggle, onDelete }) {
  const date  = new Date(session.created_date || session.started_at);
  const title = session.session_title || "Untitled Session";
  const score = Number.isFinite(Number(session.overall_score)) ? Math.round(Number(session.overall_score)) : null;
  const recommendation = session.trading_recommendation || "";
  const takeaway = recommendation || session.summary || session.problem_identified || "";

  // Score-based accent color
  const accent =
    score === null ? { color: "#888888", bg: "rgba(120,120,120,0.08)", border: "rgba(120,120,120,0.18)", light: "rgba(120,120,120,0.06)" }
    : score >= 7   ? { color: "#1a9e64", bg: "rgba(26,158,100,0.1)",   border: "rgba(26,158,100,0.3)",  light: "rgba(26,158,100,0.06)" }
    : score >= 4   ? { color: "#b08a00", bg: "rgba(176,138,0,0.1)",    border: "rgba(176,138,0,0.28)",  light: "rgba(176,138,0,0.06)" }
    :                { color: "#c83c28", bg: "rgba(200,60,40,0.1)",    border: "rgba(200,60,40,0.28)",  light: "rgba(200,60,40,0.06)" };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this session?")) onDelete(session.id);
  };

  return (
    <motion.button
      layout
      onClick={onToggle}
      className="w-full text-left rounded-2xl overflow-hidden transition-all"
      style={{
        background: isExpanded ? accent.light : "rgba(var(--glass), var(--glassA))",
        border: `1px solid ${isExpanded ? accent.border : "rgba(var(--glass), 0.18)"}`,
        boxShadow: isExpanded
          ? `0 4px 20px ${accent.bg}, 0 1px 3px rgba(0,0,0,0.06)`
          : "0 1px 3px rgba(0,0,0,0.06)",
        borderLeft: `3px solid ${accent.color}`,
      }}
      whileTap={{ scale: 0.995 }}
    >
      {/* ── Card header ── */}
      <div className="px-4 py-4 flex items-start gap-3">

        {/* Score badge */}
        <div className="flex-shrink-0 mt-0.5">
          {score !== null ? (
            <div
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center"
              style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
            >
              <span className="text-[14px] font-bold leading-none" style={{ color: accent.color }}>{score}</span>
              <span className="text-[8px] font-medium mt-0.5" style={{ color: accent.color, opacity: 0.7 }}>/10</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-gray-100 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-gray-900 dark:text-[rgb(var(--text))] leading-snug truncate">
            {title}
          </div>

          {/* Date + time pills */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center text-[11px] font-medium text-gray-500 dark:text-[rgb(var(--muted))] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-2.5 py-0.5">
              {format(date, "MMM d, yyyy")}
            </span>
            <span className="inline-flex items-center text-[11px] font-medium text-gray-500 dark:text-[rgb(var(--muted))] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-2.5 py-0.5">
              {format(date, "h:mm a")}
            </span>
          </div>

          {takeaway && !isExpanded && (
            <div className="text-[12px] mt-2 line-clamp-1 leading-snug text-gray-400">
              {takeaway}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full grid place-items-center hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} className="text-gray-300 hover:text-red-400" />
          </button>
          <div className="w-7 h-7 rounded-full grid place-items-center text-gray-400">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* ── Expanded details ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="px-4 pb-5 space-y-4 border-t border-gray-100 dark:border-white/10"
          >
            {score !== null && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="pt-3">
                <MentalStateIndicator score={score} recommendation={recommendation} />
              </motion.div>
            )}

            {session.summary && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Summary</div>
                <div className="text-[13px] leading-relaxed text-gray-700 dark:text-[rgb(var(--muted))]">{session.summary}</div>
              </motion.div>
            )}

            {session.patterns?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Observed Patterns</div>
                <div className="space-y-1.5">
                  {session.patterns.map((p, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="flex-shrink-0 mt-0.5 text-gray-300">—</span>
                      <span className="leading-snug text-gray-600">{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.problem_identified && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <div className="rounded-xl p-3.5 space-y-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-red-500">
                  <AlertTriangle size={11} /> Biggest Problem
                </div>
                <div className="text-[12px] leading-relaxed text-gray-700 dark:text-red-200/70">{session.problem_identified}</div>
                </div>
              </motion.div>
            )}

            {session.proposed_solution && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                <div className="rounded-xl p-3.5 space-y-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-green-600 dark:text-green-400">
                  <Lightbulb size={11} /> Recommended Fix
                </div>
                <div className="text-[12px] leading-relaxed text-gray-700 dark:text-green-200/70">{session.proposed_solution}</div>
                </div>
              </motion.div>
            )}

            {session.recommendations?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Coach's Advice</div>
                <div className="space-y-1.5">
                  {session.recommendations.map((item, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="flex-shrink-0 mt-0.5 text-green-500">+</span>
                      <span className="leading-snug text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.full_transcript && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Transcript</div>
                <div
                  className="text-[12px] leading-relaxed text-gray-500 max-h-32 overflow-y-auto rounded-xl px-3 py-3 bg-gray-50 border border-gray-100"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {session.full_transcript}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}