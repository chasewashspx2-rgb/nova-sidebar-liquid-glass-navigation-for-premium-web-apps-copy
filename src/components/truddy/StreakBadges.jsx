import React from "react";
import { motion } from "framer-motion";

const STREAK_CONFIG = [
  { key: "journal",  label: "Journal",  emoji: "📓", color: "rgba(104,155,251,0.9)",  bg: "rgba(104,155,251,0.12)", border: "rgba(104,155,251,0.3)" },
  { key: "mood",     label: "Mood",     emoji: "🧠", color: "rgba(121,113,249,0.9)",  bg: "rgba(121,113,249,0.12)", border: "rgba(121,113,249,0.3)" },
  { key: "pretrade", label: "Discipline",emoji: "🛡️", color: "rgba(72,199,142,0.9)",  bg: "rgba(72,199,142,0.12)", border: "rgba(72,199,142,0.3)"  },
];

function flameColor(streak) {
  if (streak >= 14) return "#ff9500";
  if (streak >= 7)  return "#ff6b35";
  if (streak >= 3)  return "#fbbf24";
  return null;
}

export default function StreakBadges({ streaks = {} }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STREAK_CONFIG.map((s, i) => {
        const count = streaks[s.key] || 0;
        const fire = flameColor(count);
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex flex-col items-center gap-1.5 rounded-[18px] py-4 px-3"
            style={{ background: count > 0 ? s.bg : "rgba(var(--glass),0.22)", border: `1px solid ${count > 0 ? s.border : "rgba(255,255,255,0.2)"}` }}
          >
            <div className="relative">
              <span className="text-2xl">{s.emoji}</span>
              {fire && (
                <motion.span
                  className="absolute -top-1 -right-2 text-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >🔥</motion.span>
              )}
            </div>
            <div className="font-bold text-xl leading-none" style={{ color: count > 0 ? s.color : "rgba(var(--muted),0.4)" }}>
              {count}
            </div>
            <div className="text-[10px] font-semibold text-center" style={{ color: count > 0 ? s.color : "rgba(var(--muted),0.35)" }}>
              {s.label}
            </div>
            <div className="text-[9px] opacity-40">{count === 1 ? "day" : "days"}</div>
          </motion.div>
        );
      })}
    </div>
  );
}