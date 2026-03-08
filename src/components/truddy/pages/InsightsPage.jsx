import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, TrendingDown, Brain, Shield, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MoodBadge, emotionConfig } from "@/components/truddy/MoodBadge";
import { SectionHeader } from "@/components/truddy/SectionHeader";

function InsightCard({ icon, title, value, sub, type = "neutral", delay = 0 }) {
  const colors = {
    good: { bg: "rgba(72,199,142,0.15)", border: "rgba(72,199,142,0.35)", text: "text-green-500" },
    bad: { bg: "rgba(220,80,80,0.15)", border: "rgba(220,80,80,0.3)", text: "text-red-400" },
    warn: { bg: "rgba(255,180,50,0.15)", border: "rgba(255,180,50,0.3)", text: "text-yellow-500" },
    neutral: { bg: "rgba(104,155,251,0.12)", border: "rgba(104,155,251,0.25)", text: "text-[rgb(var(--accent))]" },
  };
  const c = colors[type];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay }} className="rounded-[20px] p-4 sm:p-5 border" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${c.text}`}>{icon}</div>
        <div>
          <div className="text-xs text-[rgba(var(--muted),0.75)] font-medium mb-1">{title}</div>
          <div className={`text-xl font-bold ${c.text}`}>{value}</div>
          {sub && <div className="text-xs text-[rgba(var(--muted),0.7)] mt-0.5">{sub}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-[rgba(var(--muted),0.75)] w-20 flex-shrink-0 truncate">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color || "linear-gradient(90deg, rgba(104,155,251,1), rgba(121,113,249,1))" }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <div className="text-xs font-semibold w-6 text-right">{value}</div>
    </div>
  );
}

export default function InsightsPage() {
  const [trades, setTrades] = useState([]);
  const [moodChecks, setMoodChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TradeJournal.list("-created_date", 100),
      base44.entities.MoodCheck.list("-created_date", 30),
    ]).then(([t, m]) => { setTrades(t); setMoodChecks(m); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-[rgba(var(--muted),0.5)] text-sm">Analyzing your patterns...</div>;

  if (trades.length === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader title="Insights" subtitle="Psychology patterns & performance analysis" />
        <div className="glass rounded-[24px] p-12 text-center">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
          <div className="font-semibold text-base mb-2">No data yet</div>
          <div className="text-sm text-[rgba(var(--muted),0.6)]">Log at least 5 trades to unlock your psychology insights.</div>
        </div>
      </div>
    );
  }

  // Calculations
  const wins = trades.filter(t => t.outcome === "win");
  const losses = trades.filter(t => t.outcome === "loss");
  const winRate = Math.round((wins.length / trades.length) * 100);
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const avgWin = wins.length ? (wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length).toFixed(0) : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length).toFixed(0) : 0;
  const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "∞";
  const disciplinedTrades = trades.filter(t => t.followed_rules === "yes").length;
  const disciplineRate = Math.round((disciplinedTrades / trades.length) * 100);

  // Emotion performance map
  const emotionStats = {};
  trades.forEach(t => {
    if (!t.pre_emotion) return;
    if (!emotionStats[t.pre_emotion]) emotionStats[t.pre_emotion] = { wins: 0, total: 0, pnl: 0 };
    emotionStats[t.pre_emotion].total++;
    if (t.outcome === "win") emotionStats[t.pre_emotion].wins++;
    emotionStats[t.pre_emotion].pnl += (t.pnl || 0);
  });
  const emotionList = Object.entries(emotionStats).sort((a, b) => b[1].total - a[1].total);
  const bestEmotion = emotionList.reduce((best, cur) => {
    const wr = cur[1].total > 1 ? cur[1].wins / cur[1].total : 0;
    const bestWr = best ? best[1].wins / best[1].total : 0;
    return wr > bestWr ? cur : best;
  }, null);
  const worstEmotion = emotionList.reduce((worst, cur) => {
    const wr = cur[1].total > 1 ? cur[1].wins / cur[1].total : 1;
    const worstWr = worst ? worst[1].wins / worst[1].total : 1;
    return wr < worstWr ? cur : worst;
  }, null);

  // Violations
  const allViolations = trades.flatMap(t => t.violations || []);
  const violationCounts = {};
  allViolations.forEach(v => { violationCounts[v] = (violationCounts[v] || 0) + 1; });
  const topViolations = Object.entries(violationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Day of week patterns
  const dayStats = {};
  trades.forEach(t => {
    const day = new Date(t.created_date).toLocaleDateString("en-US", { weekday: "short" });
    if (!dayStats[day]) dayStats[day] = { wins: 0, total: 0 };
    dayStats[day].total++;
    if (t.outcome === "win") dayStats[day].wins++;
  });
  const dayList = ["Mon", "Tue", "Wed", "Thu", "Fri"].map(d => ({ day: d, ...(dayStats[d] || { wins: 0, total: 0 }) }));

  // Generate Truddy narrative
  const narratives = [];
  if (winRate >= 60) narratives.push({ type: "good", text: `Your ${winRate}% win rate is above average. Your setups are high quality — protect this edge by staying selective.` });
  else if (winRate < 45) narratives.push({ type: "bad", text: `Your win rate of ${winRate}% suggests either setups need refinement or you're entering on emotion. Review the trades where rules were broken.` });
  if (disciplineRate < 60) narratives.push({ type: "bad", text: `Only ${disciplineRate}% of trades followed your rules. This is your #1 focus area — discipline is more important than finding new setups.` });
  else narratives.push({ type: "good", text: `${disciplineRate}% rule compliance is strong. Disciplined execution is what separates consistent traders from gamblers.` });
  if (bestEmotion && bestEmotion[1].total > 1) narratives.push({ type: "neutral", text: `You perform best when feeling ${emotionConfig[bestEmotion[0]]?.emoji} ${emotionConfig[bestEmotion[0]]?.label} (${Math.round(bestEmotion[1].wins / bestEmotion[1].total * 100)}% win rate). Recognize this state and protect it.` });
  if (worstEmotion && worstEmotion[0] !== bestEmotion?.[0] && worstEmotion[1].total > 1) narratives.push({ type: "warn", text: `You struggle when feeling ${emotionConfig[worstEmotion[0]]?.emoji} ${emotionConfig[worstEmotion[0]]?.label} (${Math.round(worstEmotion[1].wins / worstEmotion[1].total * 100)}% win rate). Consider sitting out when in this state.` });
  if (topViolations.length > 0) narratives.push({ type: "warn", text: `"${topViolations[0][0]}" is your most common violation (${topViolations[0][1]}x). Add a specific rule or trigger to stop this pattern.` });

  return (
    <div className="space-y-5">
      <SectionHeader title="Insights" subtitle="Your psychology patterns & performance data" />

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InsightCard icon={<TrendingUp size={16} />} title="Win Rate" value={`${winRate}%`} sub={`${wins.length}W / ${losses.length}L`} type={winRate >= 55 ? "good" : winRate < 45 ? "bad" : "warn"} delay={0.05} />
        <InsightCard icon={<BarChart2 size={16} />} title="Avg R:R" value={`1:${rr}`} sub={`Avg W $${avgWin} / L $${avgLoss}`} type={Number(rr) >= 1.5 ? "good" : Number(rr) < 1 ? "bad" : "warn"} delay={0.1} />
        <InsightCard icon={<Shield size={16} />} title="Discipline" value={`${disciplineRate}%`} sub={`${disciplinedTrades} of ${trades.length} trades`} type={disciplineRate >= 75 ? "good" : disciplineRate < 50 ? "bad" : "warn"} delay={0.15} />
        <InsightCard icon={<Brain size={16} />} title="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`} sub={`${trades.length} trades logged`} type={totalPnl > 0 ? "good" : totalPnl < 0 ? "bad" : "neutral"} delay={0.2} />
      </div>

      {/* Truddy Narrative */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-[20px] p-4 sm:p-5 border" style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.15))", borderColor: "rgba(104,155,251,0.3)" }}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
            <Sparkles size={16} className="text-[rgb(var(--accent))]" />
          </motion.div>
          <div className="font-semibold text-sm">Truddy's Analysis</div>
        </div>
        <div className="space-y-3">
          {narratives.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-2.5">
              {n.type === "good" ? <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" /> : n.type === "bad" ? <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />}
              <div className="text-sm text-[rgba(var(--text),0.85)]">{n.text}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emotion Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-[20px] p-4 sm:p-5">
          <div className="font-semibold text-sm mb-4">Performance by Mood</div>
          {emotionList.length === 0 ? (
            <div className="text-xs text-[rgba(var(--muted),0.5)] py-4 text-center">Log emotions on your trades to see this.</div>
          ) : (
            <div className="space-y-3">
              {emotionList.map(([emotion, stats]) => {
                const cfg = emotionConfig[emotion];
                const wr = Math.round((stats.wins / stats.total) * 100);
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="text-lg flex-shrink-0">{cfg?.emoji || "😐"}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{cfg?.label || emotion}</span>
                        <span className={`text-xs font-semibold ${wr >= 55 ? "text-green-500" : wr < 45 ? "text-red-400" : "text-yellow-500"}`}>{wr}% WR</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: wr >= 55 ? "rgba(72,199,142,0.8)" : wr < 45 ? "rgba(220,80,80,0.8)" : "rgba(255,180,50,0.8)" }} initial={{ width: 0 }} animate={{ width: `${wr}%` }} transition={{ duration: 0.5 }} />
                      </div>
                    </div>
                    <span className="text-xs text-[rgba(var(--muted),0.6)] flex-shrink-0">{stats.total}t</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Day of Week */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-[20px] p-4 sm:p-5">
          <div className="font-semibold text-sm mb-4">Performance by Day</div>
          <div className="space-y-3">
            {dayList.map((d) => {
              const wr = d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0;
              return (
                <div key={d.day} className="flex items-center gap-3">
                  <div className="text-xs font-semibold w-8 flex-shrink-0 text-[rgba(var(--muted),0.75)]">{d.day}</div>
                  <div className="flex-1 h-6 rounded-[8px] bg-white/10 overflow-hidden relative">
                    <motion.div className="h-full rounded-[8px]" style={{ background: d.total === 0 ? "transparent" : wr >= 55 ? "rgba(72,199,142,0.5)" : wr < 45 ? "rgba(220,80,80,0.5)" : "rgba(255,180,50,0.5)" }} initial={{ width: 0 }} animate={{ width: d.total > 0 ? `${wr}%` : "0%" }} transition={{ duration: 0.5 }} />
                    {d.total > 0 && <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">{wr}% ({d.total} trades)</span>}
                    {d.total === 0 && <span className="absolute inset-0 flex items-center px-2 text-xs text-[rgba(var(--muted),0.4)]">No trades</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Violations */}
        {topViolations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-[20px] p-4 sm:p-5">
            <div className="font-semibold text-sm mb-4">Most Common Violations</div>
            <div className="space-y-3">
              {topViolations.map(([v, count], i) => (
                <MiniBar key={v} label={v} value={count} max={topViolations[0][1]} color="rgba(220,80,80,0.7)" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Consistency over time (P&L by trade) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-[20px] p-4 sm:p-5">
          <div className="font-semibold text-sm mb-4">Cumulative P&L</div>
          {(() => {
            const sorted = [...trades].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            let cum = 0;
            const points = sorted.map((t) => { cum += (t.pnl || 0); return cum; });
            if (points.length < 2) return <div className="text-xs text-[rgba(var(--muted),0.5)] text-center py-4">Need more trades to show chart.</div>;
            const min = Math.min(...points, 0);
            const max = Math.max(...points);
            const range = max - min || 1;
            const w = 100 / (points.length - 1);
            const h = 120;
            const toY = (v) => h - ((v - min) / range) * h;
            const pathD = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i * w} ${toY(v)}`).join(" ");
            return (
              <svg className="w-full" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{ height: 120 }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={cum >= 0 ? "rgba(72,199,142,0.4)" : "rgba(220,80,80,0.4)"} />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path d={`${pathD} L ${(points.length - 1) * w} ${h} L 0 ${h} Z`} fill="url(#pnlGrad)" />
                <path d={pathD} fill="none" stroke={cum >= 0 ? "rgba(72,199,142,0.9)" : "rgba(220,80,80,0.9)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
}