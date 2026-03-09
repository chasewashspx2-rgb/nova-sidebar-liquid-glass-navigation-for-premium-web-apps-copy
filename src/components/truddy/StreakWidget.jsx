import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, TrendingUp, Flame } from "lucide-react";


function MilestoneLabel({ count }) {
  if (count >= 30) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,149,0,0.2)", color: "#ff9500" }}>LEGEND</span>;
  if (count >= 14) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,107,53,0.2)", color: "#ff6b35" }}>ON FIRE</span>;
  if (count >= 7)  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.2)", color: "#f59e0b" }}>HOT STREAK</span>;
  if (count >= 3)  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(104,155,251,0.2)", color: "#689bfb" }}>BUILDING</span>;
  return null;
}

function StreakCounter({ icon: Icon, label, count, color, glowColor }) {
  const isActive = count > 0;
  const fireColor = count >= 14 ? "#ff6b35" : count >= 7 ? "#fbbf24" : count >= 3 ? "#fbbf24" : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-[20px] relative overflow-hidden"
      style={{ background: isActive ? `rgba(${glowColor},0.1)` : "rgba(var(--glass),0.15)", border: `1px solid ${isActive ? `rgba(${glowColor},0.3)` : "rgba(255,255,255,0.15)"}` }}
    >
      {isActive && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, rgba(${glowColor},0.2) 0%, transparent 70%)` }} />
      )}

      {/* Icon */}
      <div className="relative">
        <div className="w-12 h-12 rounded-[16px] grid place-items-center"
          style={{ background: isActive ? `rgba(${glowColor},0.18)` : "rgba(var(--glass),0.3)", border: `1.5px solid ${isActive ? `rgba(${glowColor},0.5)` : "rgba(255,255,255,0.2)"}` }}>
          <Icon size={20} strokeWidth={1.8} style={{ color: isActive ? `rgb(${color})` : "rgba(var(--muted),0.4)" }} />
        </div>
        {fireColor && (
          <motion.div
            className="absolute -top-2 -right-2 text-base"
            animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >🔥</motion.div>
        )}
      </div>

      {/* Count */}
      <div className="flex flex-col items-center leading-tight">
        <motion.div
          key={count}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          className="text-4xl font-black tracking-tight"
          style={{ color: isActive ? `rgb(${color})` : "rgba(var(--muted),0.25)" }}
        >
          {count}
        </motion.div>
        <div className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
          style={{ color: isActive ? `rgba(${color},0.7)` : "rgba(var(--muted),0.3)" }}>
          days
        </div>
      </div>

      <div className="text-xs font-semibold text-center" style={{ color: isActive ? `rgb(${color})` : "rgba(var(--muted),0.4)" }}>
        {label}
      </div>
      <MilestoneLabel count={count} />
    </motion.div>
  );
}

export default function StreakWidget({ streaks = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass rounded-[24px] p-5 space-y-4"
    >
      {/* Header */}
      <div className="font-bold text-base tracking-tight flex items-center gap-2">
        <Flame size={16} className="text-orange-400" />
        Daily Streaks
      </div>

      {/* Streak Counters */}
      <div className="flex gap-3">
        <StreakCounter
          icon={BookOpen}
          label="Journal Streak"
          count={streaks.journal || 0}
          color="104,155,251"
          glowColor="104,155,251"
        />
        <StreakCounter
          icon={ShieldCheck}
          label="No Rule Violations"
          count={streaks.pretrade || 0}
          color="52,211,153"
          glowColor="52,211,153"
        />
      </div>
    </motion.div>
  );
}