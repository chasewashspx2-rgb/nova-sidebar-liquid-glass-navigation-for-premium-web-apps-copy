import React from "react";
import { motion } from "framer-motion";

export default function MentalStateIndicator({ score = 5, recommendation = "" }) {
  // Map score (1-10) to color gradient
  const getColor = () => {
    if (score <= 2) return { bg: "rgba(220,38,38,0.12)", border: "rgba(220,38,38,0.4)", text: "rgba(239,68,68,0.9)" }; // Red
    if (score <= 4) return { bg: "rgba(234,88,12,0.12)", border: "rgba(234,88,12,0.4)", text: "rgba(251,146,60,0.9)" }; // Orange
    if (score <= 6) return { bg: "rgba(202,138,4,0.12)", border: "rgba(202,138,4,0.4)", text: "rgba(234,179,8,0.9)" }; // Yellow
    if (score <= 8) return { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", text: "rgba(74,222,128,0.9)" }; // Light Green
    return { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.4)", text: "rgba(16,185,129,0.9)" }; // Deep Green
  };

  const getLabel = () => {
    if (score <= 2) return "Not Ready";
    if (score <= 4) return "Caution";
    if (score <= 6) return "Neutral";
    if (score <= 8) return "Good";
    return "Optimal";
  };

  const color = getColor();
  const label = getLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[12px] p-3 space-y-2"
      style={{ background: color.bg, border: `1px solid ${color.border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: color.text }}>
            Mental State Index
          </div>
          <div
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: color.text, color: "#0a0a0a", opacity: 0.85 }}
          >
            {label}
          </div>
        </div>
        <div className="text-sm font-bold" style={{ color: color.text }}>
          {score}/10
        </div>
      </div>

      {/* Visual bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, rgba(220,38,38,0.6), ${color.text})` }}
        />
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="text-xs leading-relaxed text-[#faf9f6] opacity-75 pt-1">
          {recommendation}
        </div>
      )}
    </motion.div>
  );
}