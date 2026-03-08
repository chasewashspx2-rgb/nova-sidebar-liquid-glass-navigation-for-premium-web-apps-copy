import React from "react";
import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, Flame, Star, Award } from "lucide-react";

export const STAGES = [
  { level: 1, name: "Beginner",     minXp: 0,    maxXp: 200,  color: "rgba(160,172,195,0.9)",  glow: "rgba(160,172,195,0.2)",  grad: ["rgba(160,172,195,0.22)", "rgba(160,172,195,0.1)"],  arc: "#a0acb3" },
  { level: 2, name: "Developing",   minXp: 200,  maxXp: 600,  color: "rgba(104,155,251,0.9)",  glow: "rgba(104,155,251,0.25)", grad: ["rgba(104,155,251,0.22)", "rgba(121,113,249,0.14)"], arc: "#689bfb" },
  { level: 3, name: "Intermediate", minXp: 600,  maxXp: 1400, color: "rgba(250,180,60,0.9)",   glow: "rgba(250,180,60,0.22)",  grad: ["rgba(250,180,60,0.2)",  "rgba(250,150,40,0.1)"],   arc: "#fab43c" },
  { level: 4, name: "Advanced",     minXp: 1400, maxXp: 3000, color: "rgba(121,113,249,0.95)", glow: "rgba(121,113,249,0.28)", grad: ["rgba(121,113,249,0.25)", "rgba(104,155,251,0.16)"], arc: "#7971f9" },
  { level: 5, name: "Elite",        minXp: 3000, maxXp: 9999, color: "rgba(255,200,50,0.95)",  glow: "rgba(255,200,50,0.3)",   grad: ["rgba(255,200,50,0.22)", "rgba(255,160,30,0.12)"],  arc: "#ffc832" },
];

const STAGE_ICONS = [Shield, TrendingUp, Flame, Zap, Award];

export function getStage(xp) {
  return [...STAGES].reverse().find(s => xp >= s.minXp) || STAGES[0];
}

export function calcXpFromActivity({ journals = 0, pretrades = 0, sessions = 0, moodChecks = 0, ruleFollowed = 0 }) {
  return journals * 20 + pretrades * 15 + sessions * 30 + moodChecks * 10 + ruleFollowed * 5;
}

export default function XPProgressCard({ xp = 0, onNavigate }) {
  const stage = getStage(xp);
  const StageIcon = STAGE_ICONS[stage.level - 1];
  const nextStage = STAGES.find(s => s.minXp > stage.minXp) || stage;
  const isMax = stage.level === 5;
  const xpInLevel = xp - stage.minXp;
  const xpNeeded = (isMax ? stage.maxXp : nextStage.minXp) - stage.minXp;
  const pct = Math.min((xpInLevel / xpNeeded) * 100, 100);
  const xpToNext = xpNeeded - xpInLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="glass rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${stage.glow}, transparent 60%)` }} />

      <div className="relative">
        {/* Top row — level badge + earn chips */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] grid place-items-center flex-shrink-0"
              style={{ background: `${stage.arc}22`, border: `1.5px solid ${stage.arc}44` }}>
              <StageIcon size={15} style={{ color: stage.arc }} />
            </div>
            <div className="px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: `${stage.arc}18`, border: `1px solid ${stage.arc}44`, color: stage.arc }}>
              Lv.{stage.level} · {stage.name}
            </div>
          </div>

          {/* Quick earn chips */}
          <div className="flex items-center gap-1.5">
            {[
              { label: "Journal", xp: "+20", page: "journal" },
              { label: "Session", xp: "+30", page: "session" },
            ].map(h => (
              <motion.button key={h.page} onClick={() => onNavigate?.(h.page)}
                whileTap={{ scale: 0.94 }} whileHover={{ y: -1 }}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer flex items-center gap-1"
                style={{ background: `${stage.arc}14`, border: `1px solid ${stage.arc}35`, color: stage.arc }}>
                <Zap size={8} />{h.xp}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Big XP number */}
        <div className="mb-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-5xl font-black tracking-tight leading-none"
            style={{ color: stage.arc }}
          >
            {xp.toLocaleString()}
          </motion.div>
          <div className="text-xs font-semibold text-[rgba(var(--muted),0.5)] mt-1 uppercase tracking-widest">Total XP</div>
        </div>

        {/* Stage name */}
        <div className="text-lg font-bold text-[rgba(var(--text),0.8)] mb-4">{stage.name} Trader</div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-2"
          style={{ background: "rgba(var(--glass),0.35)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.3, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${stage.arc}77, ${stage.arc})`, boxShadow: `0 0 8px ${stage.glow}` }}
          />
        </div>

        {/* Bar labels */}
        <div className="flex justify-between text-[11px] text-[rgba(var(--muted),0.5)]">
          <span>{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP this level</span>
          <span style={{ color: stage.arc }} className="font-semibold">
            {isMax ? "Max level" : `${xpToNext.toLocaleString()} to ${nextStage.name}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}