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
    : score >= 7   ? "rgba(80,220,160,1)"
    : score >= 4   ? "rgba(232,200,74,1)"
    : "rgba(255,122,90,1)";

  const scoreBg =
    score === null ? null
    : score >= 7   ? "rgba(80,220,160,0.1)"
    : score >= 4   ? "rgba(232,200,74,0.1)"
    : "rgba(255,122,90,0.1)";

  const scoreBorder =
    score === null ? null
    : score >= 7   ? "rgba(80,220,160,0.25)"
    : score >= 4   ? "rgba(232,200,74,0.25)"
    : "rgba(255,122,90,0.25)";

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this session?")) onDelete(session.id);
  };

  return (
    <motion.div
      layout
      className="rounded-[20px] overflow-hidden cursor-pointer transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: isExpanded ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)",
      }}
      onClick={onToggle}
    >
      {/* ── Card header ── */}
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Score badge or dot */}
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
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-white/90 leading-snug truncate">{title}</div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-[11px] text-white/35">
              <Calendar size={10} className="opacity-60" />
              <span>{format(date, "MMM d, yyyy")}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1 text-[11px] text-white/35">
              <Clock size={10} className="opacity-60" />
              <span>{format(date, "h:mm a")}</span>
            </div>
          </div>
          {takeaway && !isExpanded && (
            <div className="text-[12px] text-white/35 mt-2 line-clamp-1 leading-snug">{takeaway}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full grid place-items-center hover:bg-white/10 transition-colors"
          >
            <Trash2 size={12} className="text-white/25 hover:text-white/55" />
          </button>
          <div className="w-7 h-7 rounded-full grid place-items-center text-white/30">
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
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {score !== null && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="pt-3">
                <MentalStateIndicator score={score} recommendation={recommendation} />
              </motion.div>
            )}

            {session.summary && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Summary</div>
                <div className="text-[13px] leading-relaxed text-white/65">{session.summary}</div>
              </motion.div>
            )}

            {session.patterns?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Observed Patterns</div>
                <div className="space-y-1.5">
                  {session.patterns.map((p, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="text-white/20 flex-shrink-0 mt-0.5">—</span>
                      <span className="text-white/60 leading-snug">{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.problem_identified && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <div
                  className="rounded-[14px] p-4 space-y-1.5"
                  style={{ background: "rgba(255,100,80,0.07)", border: "1px solid rgba(255,100,80,0.2)" }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,120,90,0.85)" }}>
                    <AlertTriangle size={11} /> Biggest Problem
                  </div>
                  <div className="text-[12px] leading-relaxed text-white/70">{session.problem_identified}</div>
                </div>
              </motion.div>
            )}

            {session.proposed_solution && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                <div
                  className="rounded-[14px] p-4 space-y-1.5"
                  style={{ background: "rgba(80,220,160,0.06)", border: "1px solid rgba(80,220,160,0.2)" }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(80,220,160,0.85)" }}>
                    <Lightbulb size={11} /> Recommended Fix
                  </div>
                  <div className="text-[12px] leading-relaxed text-white/70">{session.proposed_solution}</div>
                </div>
              </motion.div>
            )}

            {session.recommendations?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Coach's Advice</div>
                <div className="space-y-1.5">
                  {session.recommendations.map((item, i) => (
                    <div key={i} className="flex gap-2.5 text-[12px]">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "rgba(80,220,160,0.6)" }}>+</span>
                      <span className="text-white/60 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {session.full_transcript && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Transcript</div>
                <div
                  className="text-[12px] leading-relaxed text-white/45 max-h-32 overflow-y-auto rounded-[12px] px-3 py-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", whiteSpace: "pre-wrap" }}
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