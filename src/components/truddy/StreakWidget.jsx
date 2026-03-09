import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, TrendingUp, Flame } from "lucide-react";

function buildXpHistory(trades) {
  if (!trades.length) return [];
  const days = 30;
  const today = new Date();
  const data = [];
  let cumulative = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayTrades = trades.filter(t => (t.date || t.created_date || "").slice(0, 10) === key);
    const dayXp = dayTrades.reduce((acc, t) => {
      let xp = 20; // base per journal
      if (t.followed_rules === "yes") xp += 5;
      return acc + xp;
    }, 0);
    cumulative += dayXp;
    data.push({ date: key, xp: cumulative, dayXp });
  }
  return data;
}

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

export default function StreakWidget({ streaks = {}, trades = [] }) {
  const xpData = useMemo(() => buildXpHistory(trades), [trades]);
  const currentXp = xpData[xpData.length - 1]?.xp || 0;
  const weekAgoXp = xpData[xpData.length - 8]?.xp || 0;
  const xpGrowth = currentXp - weekAgoXp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass rounded-[24px] p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-base tracking-tight flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          Daily Streaks
        </div>
        {xpGrowth > 0 && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(72,199,142,0.15)", color: "#34d399", border: "1px solid rgba(72,199,142,0.3)" }}>
            <TrendingUp size={11} />
            +{xpGrowth} XP this week
          </div>
        )}
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
          label="Rules Clean"
          count={streaks.pretrade || 0}
          color="52,211,153"
          glowColor="52,211,153"
        />
      </div>

      {/* XP Growth Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(var(--muted),0.7)" }}>
            <Zap size={11} />
            XP Growth · Last 30 Days
          </div>
          <div className="text-xs font-bold" style={{ color: "rgb(104,155,251)" }}>
            {currentXp.toLocaleString()} XP total
          </div>
        </div>
        <div className="h-[72px] w-full">
          {xpData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(104,155,251)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="rgb(104,155,251)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: "rgba(20,20,30,0.85)", border: "none", borderRadius: 10, fontSize: 11, padding: "4px 10px" }}
                  labelFormatter={() => ""}
                  formatter={(v) => [`${v} XP`, "Total"]}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="rgb(104,155,251)"
                  strokeWidth={2}
                  fill="url(#xpGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "rgb(104,155,251)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs" style={{ color: "rgba(var(--muted),0.4)" }}>
              Log your first trade to start tracking XP growth
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}