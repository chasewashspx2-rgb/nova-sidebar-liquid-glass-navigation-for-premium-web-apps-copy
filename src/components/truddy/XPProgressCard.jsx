import React from "react";
import { motion } from "framer-motion";
import { Zap, Star, TrendingUp } from "lucide-react";

export const STAGES = [
  { level: 1, name: "Beginner",     minXp: 0,    maxXp: 200,  emoji: "🌱", color: "rgba(160,172,195,0.9)",  glow: "rgba(160,172,195,0.2)",  grad: ["rgba(160,172,195,0.22)", "rgba(160,172,195,0.1)"] },
  { level: 2, name: "Developing",   minXp: 200,  maxXp: 600,  emoji: "📈", color: "rgba(104,155,251,0.9)",  glow: "rgba(104,155,251,0.25)", grad: ["rgba(104,155,251,0.22)", "rgba(121,113,249,0.14)"] },
  { level: 3, name: "Intermediate", minXp: 600,  maxXp: 1400, emoji: "🔥", color: "rgba(250,180,60,0.9)",   glow: "rgba(250,180,60,0.22)",  grad: ["rgba(250,180,60,0.2)",  "rgba(250,150,40,0.1)"] },
  { level: 4, name: "Advanced",     minXp: 1400, maxXp: 3000, emoji: "⚡", color: "rgba(121,113,249,0.95)", glow: "rgba(121,113,249,0.28)", grad: ["rgba(121,113,249,0.25)", "rgba(104,155,251,0.16)"] },
  { level: 5, name: "Elite",        minXp: 3000, maxXp: 9999, emoji: "🏆", color: "rgba(255,200,50,0.95)",  glow: "rgba(255,200,50,0.3)",   grad: ["rgba(255,200,50,0.22)", "rgba(255,160,30,0.12)"] },
];

export function getStage(xp) {
  return [...STAGES].reverse().find(s => xp >= s.minXp) || STAGES[0];
}

export function calcXpFromActivity({ journals = 0, pretrades = 0, sessions = 0, moodChecks = 0, ruleFollowed = 0 }) {
  return journals * 20 + pretrades * 15 + sessions * 30 + moodChecks * 10 + ruleFollowed * 5;
}

export default function XPProgressCard({ xp = 0, onNavigate }) {
  const stage = getStage(xp);
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
      className="glass rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-10 top-8 w-[480px] h-[200px] rounded-full blur-3xl opacity-50 animate-floaty"
        style={{ background: `radial-gradient(circle at 30% 30%, ${stage.glow}, transparent 72%)` }} />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Level badge + info */}
        <div className="flex items-center gap-4">
          {/* Level badge */}
          <motion.div
            whileHover={{ scale: 1.06, rotate: 3 }}
            className="w-16 h-16 rounded-[20px] flex flex-col items-center justify-center flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${stage.grad[0]}, ${stage.grad[1]})`, border: `1.5px solid ${stage.color}`, boxShadow: `0 8px 32px ${stage.glow}` }}
          >
            <span className="text-2xl leading-none">{stage.emoji}</span>
            <span className="text-[10px] font-bold mt-0.5" style={{ color: stage.color }}>Lv.{stage.level}</span>
          </motion.div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[rgba(var(--muted),0.6)] mb-0.5">Trader Stage</div>
            <div className="font-bold text-xl leading-tight" style={{ color: stage.color }}>{stage.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap size={11} style={{ color: stage.color }} />
              <span className="text-xs font-semibold" style={{ color: stage.color }}>{xp.toLocaleString()} XP</span>
              {!isMax && <span className="text-xs text-[rgba(var(--muted),0.5)]">· {(nextStage.minXp - xp).toLocaleString()} to {nextStage.name}</span>}
              {isMax && <span className="text-xs text-[rgba(var(--muted),0.5)]">· Max level reached 🏆</span>}
            </div>
          </div>
        </div>

        {/* Right: XP bar */}
        <div className="flex-1 sm:max-w-[260px]">
          <div className="flex justify-between text-[10px] text-[rgba(var(--muted),0.55)] mb-1.5 font-medium">
            <span>{stage.name}</span>
            {!isMax && <span>{nextStage.name}</span>}
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(var(--glass),0.4)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${stage.color}, ${stage.glow.replace("0.2", "0.6")})`, boxShadow: `0 0 10px ${stage.glow}` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[rgba(var(--muted),0.45)] mt-1.5">
            <span>{xpInLevel.toLocaleString()} XP earned this level</span>
            <span>{xpNeeded.toLocaleString()} needed</span>
          </div>

          {/* XP earning hints */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              { label: "+20 XP Journal", page: "journal" },
              { label: "+15 XP Pre-Gate", page: "pretrade" },
              { label: "+10 XP Mood", page: "mood" },
            ].map(h => (
              <motion.button key={h.page} onClick={() => onNavigate?.(h.page)} whileTap={{ scale: 0.95 }}
                className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer font-medium"
                style={{ background: `${stage.grad[0]}`, border: `1px solid ${stage.color.replace("0.9", "0.3")}`, color: stage.color }}>
                {h.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}