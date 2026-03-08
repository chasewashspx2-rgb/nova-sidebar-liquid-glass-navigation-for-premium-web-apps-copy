import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, ShieldCheck } from "lucide-react";

const STREAK_CONFIG = [
{ key: "journal",  label: "Journal",    Icon: BookOpen,    color: "#3b6fd4", iconColor: "#3b6fd4", tileBg: "#deeaff", border: "rgba(104,155,251,0.2)" },
{ key: "mood",     label: "Mood",       Icon: Brain,       color: "#7c5ce0", iconColor: "#7c5ce0", tileBg: "#ece8ff", border: "rgba(121,113,249,0.2)" },
{ key: "pretrade", label: "Discipline", Icon: ShieldCheck, color: "#1e9e65", iconColor: "#1e9e65", tileBg: "#d4f5e5", border: "rgba(72,199,142,0.2)" }];


function flameColor(streak) {
  if (streak >= 14) return "#ff9500";
  if (streak >= 7) return "#ff6b35";
  if (streak >= 3) return "#fbbf24";
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
            style={{ background: "rgba(var(--glass),0.22)", border: "1px solid rgba(255,255,255,0.2)" }}>

            <div className="relative">
              <div className="rounded-[14px] w-12 h-12 grid place-items-center"
              style={{ background: count > 0 ? s.tileBg : "rgba(200,205,215,0.25)" }}>
                <s.Icon size={20} style={{ color: count > 0 ? s.iconColor : "rgba(var(--muted),0.3)" }} />
              </div>
              {fire &&
              <motion.span
                className="absolute -top-1 -right-2 text-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                🔥</motion.span>
              }
            </div>
            <div className="font-bold text-xl leading-none" style={{ color: count > 0 ? s.iconColor : "rgba(var(--muted),0.4)" }}>
              {count}
            </div>
            <div className="text-[10px] font-semibold text-center" style={{ color: count > 0 ? s.iconColor : "rgba(var(--muted),0.35)" }}>
              {s.label}
            </div>
            <div className="text-[9px] opacity-40">{count === 1 ? "day" : "days"}</div>
          </motion.div>);

      })}
    </div>);

}