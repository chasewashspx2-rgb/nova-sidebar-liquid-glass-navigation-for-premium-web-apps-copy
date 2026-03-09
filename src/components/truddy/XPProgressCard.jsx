import React from "react";
import { motion } from "framer-motion";

// Each level requires 100 XP. Level 1 starts at 0 XP, max is 100.
export function calcLevel(xp) {
  return Math.min(100, Math.floor(xp / 100) + 1);
}

// Kept for backward compatibility
export function getStage(xp) {
  return { level: calcLevel(xp), arc: "#5b9af6" };
}

export function calcXpFromActivity({ journals = 0, pretrades = 0, sessions = 0, moodChecks = 0, ruleFollowed = 0 }) {
  return journals * 20 + pretrades * 15 + sessions * 30 + moodChecks * 10 + ruleFollowed * 5;
}

export default function XPProgressCard({ xp = 0, onNavigate }) {
  const stage = getStage(xp);
  const StageIcon = STAGE_ICONS[stage.level - 1];
  const nextStage = STAGES.find((s) => s.minXp > stage.minXp) || stage;
  const isMax = stage.level === 5;
  const xpInLevel = xp - stage.minXp;
  const xpNeeded = (isMax ? stage.maxXp : nextStage.minXp) - stage.minXp;
  const pct = Math.min(xpInLevel / xpNeeded * 100, 100);
  const xpToNext = xpNeeded - xpInLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-[20px] px-5 py-4 relative overflow-hidden">

      <div className="relative flex items-center gap-4">
        {/* Level Badge */}
        <div className="flex-shrink-0 w-11 h-11 rounded-[14px] grid place-items-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${stage.arc}33, ${stage.arc}18)`,
          border: `1.5px solid ${stage.arc}55`,
          boxShadow: `0 0 16px ${stage.arc}30, inset 0 1px 0 rgba(255,255,255,0.18)`
        }}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[8px] font-bold uppercase tracking-widest mb-0.5 text-emerald-400">LV</span>
            <span className="text-emerald-400 text-2xl font-black leading-none">{stage.level}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top line */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight leading-none" style={{ color: "#4a90d9" }}>
                {xp.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-[rgba(var(--muted),0.45)] uppercase tracking-wide">XP</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] font-semibold text-emerald-400">{stage.name}</span>
              



            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[5px] rounded-full overflow-hidden mb-1.5"
          style={{ background: "rgba(180,200,240,0.18)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #b8d4f8, #5b9af6, #2563eb)" }} />

          </div>

          {/* Sub label */}
          <div className="text-[10px] text-[rgba(var(--muted),0.45)]">
            {isMax ? "Max level reached" : `${xpToNext.toLocaleString()} XP to ${nextStage.name}`}
          </div>
        </div>
      </div>
    </motion.div>);

}