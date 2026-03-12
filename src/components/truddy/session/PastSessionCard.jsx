import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, Trash2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import MentalStateIndicator from "@/components/truddy/session/MentalStateIndicator";

export default function PastSessionCard({ session, isExpanded, onToggle, onDelete }) {
  const date  = new Date(session.created_date || session.started_at);
  const title = session.session_title || "Untitled Session";
  const score = Number.isFinite(Number(session.overall_score)) ? Math.round(Number(session.overall_score)) : null;
  const recommendation = session.trading_recommendation || "";
  const takeaway = recommendation || session.summary || session.problem_identified || "";

  const scoreColor =
    score === null ? null
    : score >= 7   ? "rgba(30,160,100,1)"
    : score >= 4   ? "rgba(180,140,0,1)"
    : "rgba(200,60,40,1)";

  const scoreBg =
    score === null ? null
    : score >= 7   ? "rgba(30,160,100,0.1)"
    : score >= 4   ? "rgba(200,160,0,0.1)"
    : "rgba(200,60,40,0.1)";

  const scoreBorder =
    score === null ? null
    : score >= 7   ? "rgba(30,160,100,0.25)"
    : score >= 4   ? "rgba(200,160,0,0.2)"
    : "rgba(200,60,40,0.2)";

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this session?")) onDelete(session.id);
  };

  return (
    <motion.div
      layout
      className="rounded-[20px] overflow-hidden cursor-pointer transition-all"
      style={{
        background: "rgba(var(--glass), 0.5)",
        border: isExpanded
          ? "1px solid rgba(var(--text), 0.15)"
          : "1px solid rgba(var(--text), 0.08)",
        boxShadow: isExpanded ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
      }}
      onClick={onToggle}
    >
      {/* ── Card header ── */}
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Score badge */}
        <div className="flex-shrink-0 mt-0.5">
          {score !== null ? (
            <div
              className="w-11 h-11 rounded-[14px] flex flex-col items-center justify-center"
              style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}
            >
              <span className="text-[15px] font-bold leading-none" style={{ color: scoreColor }}>{score}</span>
              <span className="text-[9px] font-medium mt-0.5" style={{ color: scoreColor, opacity: 0.65 }}>/10</span>
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-[14px] grid place-items-center"
              style={{ background: "rgba(var(--text), 0.04)", border: "1px solid rgba(var(--text), 0.08)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(var(--text), 0.2)" }} />
            </div>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-semibold leading-snug truncate"
            style={{ color: "rgb(var(--text))" }}
          >
            {title}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: "rgba(var(--text), 0.06)", color: "rgba(var(--text), 0.55)" }}
            >
              {format(date, "MMM d, yyyy")}
            </span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: "rgba(var(--text), 0.06)", color: "rgba(var(--text), 0.55)" }}
            >
              {format(date, "h:mm a")}
            </span>
          </div>
          {takeaway && !isExpanded && (
            <div
              className="text-[12px] mt-2 line-clamp-1 leading-snug"
              style={{ color: "rgba(var(--muted), 1)" }}
            >
              {takeaway}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full grid place-items-center hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} style={{ color: "rgba(var(--muted), 0.7)" }} />
          </button>
          <div className="w-7 h-7 rounded-full grid place-items-center" style={{ color: "rgba(var(--muted), 1)" }}>
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
            className="px-5 pb-5 space-y-4"
            style={{ borderTop: "1px solid rgba(var(--text), 0.07)" }}
          >
            {score !== null && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="pt-3">
                <MentalStateIndicator score={score} recommendation={recommendation} />
              </motion.div>
            )}

            {session.summary && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(var(--muted), 1)" }}>Summary</div>
                <div className="text-[13px] leading-relaxed" style={{ color: "rgba(var(--text), 0.75)" }}>{session.summary}</div>
              </motion.div>
            )}

            {session.patterns?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(var(--muted), 1)" }}>Observed Patterns</div>
                <div className="space-y-1.5">
                  {session.patterns.map((p, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "rgba(var(--muted), 0.6)" }}>—</span>
                      <span className="leading-snug" style={{ color: "rgba(var(--text), 0.7)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.problem_identified && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <div
                  className="rounded-[14px] p-4 space-y-1.5"
                  style={{ background: "rgba(200,60,40,0.06)", border: "1px solid rgba(200,60,40,0.18)" }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(180,50,30,0.9)" }}>
                    <AlertTriangle size={11} /> Biggest Problem
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "rgba(var(--text), 0.75)" }}>{session.problem_identified}</div>
                </div>
              </motion.div>
            )}

            {session.proposed_solution && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                <div
                  className="rounded-[14px] p-4 space-y-1.5"
                  style={{ background: "rgba(30,140,90,0.07)", border: "1px solid rgba(30,140,90,0.2)" }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(20,130,80,0.9)" }}>
                    <Lightbulb size={11} /> Recommended Fix
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "rgba(var(--text), 0.75)" }}>{session.proposed_solution}</div>
                </div>
              </motion.div>
            )}

            {session.recommendations?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(var(--muted), 1)" }}>Coach's Advice</div>
                <div className="space-y-1.5">
                  {session.recommendations.map((item, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "rgba(30,140,90,0.7)" }}>+</span>
                      <span className="leading-snug" style={{ color: "rgba(var(--text), 0.7)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.full_transcript && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(var(--muted), 1)" }}>Transcript</div>
                <div
                  className="text-[12px] leading-relaxed max-h-32 overflow-y-auto rounded-[12px] px-3 py-3"
                  style={{
                    background: "rgba(var(--text), 0.03)",
                    border: "1px solid rgba(var(--text), 0.07)",
                    color: "rgba(var(--text), 0.55)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {session.full_transcript}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}