import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Trash2 } from "lucide-react";
import { format } from "date-fns";
import MentalStateIndicator from "@/components/truddy/session/MentalStateIndicator";

export default function PastSessionCard({ session, isExpanded, onToggle, onDelete }) {
  const date = new Date(session.created_date || session.started_at);
  const dateStr = format(date, "MMM d, yyyy");
  const timeStr = format(date, "h:mm a");
  const title = session.session_title || "Untitled Session";

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this session?")) onDelete(session.id);
  };

  return (
    <motion.div
      layout
      className="rounded-[16px] overflow-hidden cursor-pointer"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      onClick={onToggle}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#faf9f6] truncate">{title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#faf9f6] opacity-50">{dateStr}</span>
            <span className="text-[10px] text-[#faf9f6] opacity-30">·</span>
            <span className="text-[11px] text-[#faf9f6] opacity-50">{timeStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <button onClick={handleDelete} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <Trash2 size={13} className="text-[#faf9f6] opacity-35 hover:opacity-70" />
          </button>
          <div className="text-[#faf9f6] opacity-40">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 space-y-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Mental State Indicator */}
            {session.overall_score && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <MentalStateIndicator 
                  score={Math.round(session.overall_score)} 
                  recommendation={session.trading_recommendation}
                />
              </motion.div>
            )}

            {/* Summary */}
            {session.summary && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pt-2 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#faf9f6] opacity-40 font-semibold">Session Summary</div>
                <div className="text-xs leading-relaxed text-[#faf9f6] opacity-75">{session.summary}</div>
              </motion.div>
            )}

            {/* Patterns */}
            {session.patterns && session.patterns.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pt-2 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-[#faf9f6] opacity-40 font-semibold">Observed Patterns</div>
                <div className="space-y-1.5">
                  {session.patterns.map((pattern, idx) => (
                    <div key={idx} className="flex gap-2 text-xs">
                      <span className="text-[rgba(200,200,200,0.4)] flex-shrink-0">•</span>
                      <span className="text-[#faf9f6] opacity-75">{pattern}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Problem */}
            {session.problem_identified && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="rounded-[12px] p-3 space-y-1" style={{ background: "rgba(255,100,80,0.1)", border: "1px solid rgba(255,100,80,0.25)" }}>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: "rgba(255,120,90,0.9)" }}>
                    <AlertTriangle size={11} /> Biggest Problem
                  </div>
                  <div className="text-xs leading-relaxed text-[#faf9f6] opacity-80">{session.problem_identified}</div>
                </div>
              </motion.div>
            )}

            {/* Solution */}
            {session.proposed_solution && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <div className="rounded-[12px] p-3 space-y-1" style={{ background: "rgba(80,220,160,0.08)", border: "1px solid rgba(80,220,160,0.25)" }}>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: "rgba(80,220,160,0.9)" }}>
                    <Lightbulb size={11} /> Recommended Fix
                  </div>
                  <div className="text-xs leading-relaxed text-[#faf9f6] opacity-80">{session.proposed_solution}</div>
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            {session.recommendations && session.recommendations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-[#faf9f6] opacity-40 font-semibold">Coach's Advice</div>
                <div className="space-y-1.5">
                  {session.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2 text-xs">
                      <span className="text-[rgba(80,220,160,0.7)] flex-shrink-0">✓</span>
                      <span className="text-[#faf9f6] opacity-75">{rec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Transcript */}
            {session.full_transcript && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="pt-2 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#faf9f6] opacity-40 font-semibold">Full Transcript</div>
                <div className="text-xs leading-relaxed text-[#faf9f6] opacity-70 max-h-28 overflow-y-auto" style={{ whiteSpace: "pre-wrap" }}>
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