import React from "react";
import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, Flame, Star, Award } from "lucide-react";

export const STAGES = [
  { level: 1, name: "Beginner",     minXp: 0,    maxXp: 200,  color: "rgba(160,172,195,0.9)",  glow: "rgba(160,172,195,0.2)",  grad: ["rgba(160,172,195,0.18)", "rgba(160,172,195,0.08)"],  arc: "#a0acb3", Icon: Shield },
  { level: 2, name: "Developing",   minXp: 200,  maxXp: 600,  color: "rgba(104,155,251,0.9)",  glow: "rgba(104,155,251,0.25)", grad: ["rgba(104,155,251,0.18)", "rgba(121,113,249,0.10)"],  arc: "#689bfb", Icon: TrendingUp },
  { level: 3, name: "Intermediate", minXp: 600,  maxXp: 1400, color: "rgba(250,180,60,0.9)",   glow: "rgba(250,180,60,0.22)",  grad: ["rgba(250,180,60,0.18)", "rgba(250,150,40,0.08)"],    arc: "#fab43c", Icon: Flame },
  { level: 4, name: "Advanced",     minXp: 1400, maxXp: 3000, color: "rgba(121,113,249,0.95)", glow: "rgba(121,113,249,0.28)", grad: ["rgba(121,113,249,0.20)", "rgba(104,155,251,0.12)"],  arc: "#7971f9", Icon: Star },
  { level: 5, name: "Elite",        minXp: 3000, maxXp: 9999, color: "rgba(255,200,50,0.95)",  glow: "rgba(255,200,50,0.3)",   grad: ["rgba(255,200,50,0.20)", "rgba(255,160,30,0.10)"],    arc: "#ffc832", Icon: Award },
];

export function getStage(xp) {
  return [...STAGES].reverse().find(s => xp >= s.minXp) || STAGES[0];
}

export function calcXpFromActivity({ journals = 0, pretrades = 0, sessions = 0, moodChecks = 0, ruleFollowed = 0 }) {
  return journals * 20 + pretrades * 15 + sessions * 30 + moodChecks * 10 + ruleFollowed * 5;
}

export default function XPProgressCard({ xp = 0, onNavigate }) {
  const stage = getStage(xp);
  const { Icon } = stage;
  const nextStage = STAGES.find(s => s.minXp > stage.minXp) || stage;
  const isMax = stage.level === 5;
  const xpInLevel = xp - stage.minXp;
  const xpNeeded = (isMax ? stage.maxXp : nextStage.minXp) - stage.minXp;
  const pct = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="glass rounded-[24px] p-5 sm:p-6 relative overflow-hidden"
    >
      {/* Subtle bg glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full blur-3xl opacity-40"
        style={{ background: `radial-gradient(circle, ${stage.glow}, transparent 70%)` }} />

      <div className="relative flex items-center gap-5">
        {/* Level badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1"
          style={{
            background: `linear-gradient(135deg, ${stage.grad[0]}, ${stage.grad[1]})`,
            border: `1.5px solid ${stage.arc}55`,
            boxShadow: `0 8px 24px ${stage.glow}`,
          }}
        >
          <Icon size={20} style={{ color: stage.arc }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stage.arc }}>Lv {stage.level}</span>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: stage.arc }}>
              {xp.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-[rgba(var(--muted),0.6)]">XP</span>
            <span className="ml-auto text-sm font-semibold" style={{ color: stage.arc }}>{stage.name}</span>
          </div>

          {/* Thin progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mt-2 mb-1.5"
            style={{ background: "rgba(var(--glass),0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${stage.arc}99, ${stage.arc})`, boxShadow: `0 0 8px ${stage.glow}` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-[rgba(var(--muted),0.45)] font-medium">
            <span>{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP this level</span>
            {!isMax && <span>{(nextStage.minXp - xp).toLocaleString()} to {nextStage.name}</span>}
            {isMax && <span>Max level 🏆</span>}
          </div>
        </div>
      </div>

      {/* XP earning chips */}
      <div className="relative flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        {[
          { label: "+20 XP", sub: "Journal", page: "journal" },
          { label: "+15 XP", sub: "Pre-Gate", page: "pretrade" },
          { label: "+10 XP", sub: "Mood", page: "mood" },
          { label: "+30 XP", sub: "Session", page: "session" },
        ].map(h => (
          <motion.button key={h.page} onClick={() => onNavigate?.(h.page)}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            className="flex-1 flex flex-col items-center py-2 rounded-[12px] cursor-pointer"
            style={{ background: `${stage.arc}12`, border: `1px solid ${stage.arc}30` }}>
            <span className="text-[11px] font-bold" style={{ color: stage.arc }}>{h.label}</span>
            <span className="text-[10px] text-[rgba(var(--muted),0.5)] mt-0.5">{h.sub}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}