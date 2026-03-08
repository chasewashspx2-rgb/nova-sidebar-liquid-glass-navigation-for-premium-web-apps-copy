import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const STAGES = [
  { level: 1, name: "Beginner",     minXp: 0,    maxXp: 200,  emoji: "🌱", color: "rgba(160,172,195,0.9)",  glow: "rgba(160,172,195,0.2)",  grad: ["rgba(160,172,195,0.22)", "rgba(160,172,195,0.1)"],  arc: "#a0acb3" },
  { level: 2, name: "Developing",   minXp: 200,  maxXp: 600,  emoji: "📈", color: "rgba(104,155,251,0.9)",  glow: "rgba(104,155,251,0.25)", grad: ["rgba(104,155,251,0.22)", "rgba(121,113,249,0.14)"], arc: "#689bfb" },
  { level: 3, name: "Intermediate", minXp: 600,  maxXp: 1400, emoji: "🔥", color: "rgba(250,180,60,0.9)",   glow: "rgba(250,180,60,0.22)",  grad: ["rgba(250,180,60,0.2)",  "rgba(250,150,40,0.1)"],   arc: "#fab43c" },
  { level: 4, name: "Advanced",     minXp: 1400, maxXp: 3000, emoji: "⚡", color: "rgba(121,113,249,0.95)", glow: "rgba(121,113,249,0.28)", grad: ["rgba(121,113,249,0.25)", "rgba(104,155,251,0.16)"], arc: "#7971f9" },
  { level: 5, name: "Elite",        minXp: 3000, maxXp: 9999, emoji: "🏆", color: "rgba(255,200,50,0.95)",  glow: "rgba(255,200,50,0.3)",   grad: ["rgba(255,200,50,0.22)", "rgba(255,160,30,0.12)"],  arc: "#ffc832" },
];

export function getStage(xp) {
  return [...STAGES].reverse().find(s => xp >= s.minXp) || STAGES[0];
}

export function calcXpFromActivity({ journals = 0, pretrades = 0, sessions = 0, moodChecks = 0, ruleFollowed = 0 }) {
  return journals * 20 + pretrades * 15 + sessions * 30 + moodChecks * 10 + ruleFollowed * 5;
}

function ArcRing({ pct, color, glow, size = 180 }) {
  const radius = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Arc spans 240 degrees, starting at 150deg (bottom-left) going clockwise
  const startAngle = 150;
  const totalAngle = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const dashOffset = arcLength * (1 - Math.min(pct / 100, 1));

  const toRad = (deg) => (deg * Math.PI) / 180;
  const startRad = toRad(startAngle);
  const endRad = toRad(startAngle + totalAngle);
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = totalAngle > 180 ? 1 : 0;

  const trackPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`arc-grad-${color.slice(0,6)}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <filter id="arc-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
      {/* Progress */}
      <motion.path
        d={trackPath}
        fill="none"
        stroke={`url(#arc-grad-${color.slice(0,6)})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={arcLength}
        initial={{ strokeDashoffset: arcLength }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        filter="url(#arc-glow)"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      />
    </svg>
  );
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
      className="glass rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: `radial-gradient(circle at 50% 60%, ${stage.glow}, transparent 70%)` }} />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Arc Ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <ArcRing pct={pct} color={stage.arc} glow={stage.glow} size={180} />
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 20 }}>
            <motion.span
              className="text-4xl leading-none mb-1"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
            >
              {stage.emoji}
            </motion.span>
            <div className="text-[11px] uppercase tracking-widest font-bold text-[rgba(var(--muted),0.55)]">Lv.{stage.level}</div>
            <div className="font-extrabold text-lg leading-tight mt-0.5" style={{ color: stage.arc }}>{stage.name}</div>
            <div className="flex items-center gap-1 mt-1">
              <Zap size={10} style={{ color: stage.arc }} />
              <span className="text-xs font-bold" style={{ color: stage.arc }}>{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex-1 w-full">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[rgba(var(--muted),0.5)] mb-1">Progress to {isMax ? "Max" : nextStage.name}</div>
          <div className="flex justify-between text-xs text-[rgba(var(--muted),0.6)] mb-2">
            <span>{xpInLevel.toLocaleString()} XP this level</span>
            <span>{xpNeeded.toLocaleString()} needed</span>
          </div>

          {/* Flat bar as secondary indicator */}
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "rgba(var(--glass),0.4)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${stage.arc}88, ${stage.arc})`, boxShadow: `0 0 8px ${stage.glow}` }}
            />
          </div>

          {/* Milestone chips */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Journal", xp: "+20 XP", page: "journal" },
              { label: "Pre-Gate", xp: "+15 XP", page: "pretrade" },
              { label: "Session", xp: "+30 XP", page: "session" },
            ].map(h => (
              <motion.button key={h.page} onClick={() => onNavigate?.(h.page)} whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }}
                className="flex flex-col items-center py-2.5 px-1 rounded-[14px] cursor-pointer"
                style={{ background: stage.grad[0], border: `1px solid ${stage.arc}44` }}>
                <span className="text-[11px] font-bold" style={{ color: stage.arc }}>{h.xp}</span>
                <span className="text-[10px] text-[rgba(var(--muted),0.6)] mt-0.5">{h.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}