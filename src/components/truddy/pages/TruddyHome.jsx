import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, BookOpen, Shield, BarChart2, TrendingUp, TrendingDown, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MoodBadge } from "@/components/truddy/MoodBadge";
import { StatCard } from "@/components/truddy/StatCard";

export default function TruddyHome({ onNavigate }) {
  const [trades, setTrades] = useState([]);
  const [moodChecks, setMoodChecks] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TradeJournal.list("-created_date", 20),
      base44.entities.MoodCheck.list("-created_date", 7),
      base44.entities.TradingRule.list(),
    ]).then(([t, m, r]) => {
      setTrades(t);
      setMoodChecks(m);
      setRules(r);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayMood = moodChecks.find((m) => m.date === today);
  const recentTrades = trades.slice(0, 5);
  const wins = trades.filter((t) => t.outcome === "win").length;
  const total = trades.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgDiscipline = trades.length > 0
    ? (trades.reduce((s, t) => s + (t.discipline_score || 0), 0) / trades.filter(t => t.discipline_score).length).toFixed(1)
    : "—";

  const rulesViolated = trades.filter((t) => t.followed_rules === "no" || t.followed_rules === "partially").length;
  const disciplineRate = total > 0 ? Math.round(((total - rulesViolated) / total) * 100) : 0;

  const quickActions = [
    { icon: <BookOpen size={18} />, label: "Log a Trade", sub: "Record your latest trade", page: "journal", accent: true },
    { icon: <Brain size={18} />, label: "Mood Check-In", sub: "How are you feeling?", page: "mood" },
    { icon: <Shield size={18} />, label: "My Rules", sub: "Review your playbook", page: "rules" },
    { icon: <BarChart2 size={18} />, label: "Insights", sub: "Patterns & psychology", page: "insights" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-[24px] sm:text-[28px] font-bold tracking-tight">Truddy</div>
        <div className="text-sm sm:text-base font-medium text-[rgba(var(--muted),0.85)]">Your trading psychology co-pilot</div>
      </motion.div>

      {/* Today's Mood Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="glass rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -left-10 top-8 w-[480px] h-[200px] rounded-full blur-3xl opacity-60 animate-floaty"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(121,113,249,0.5), rgba(104,155,251,0.3) 55%, transparent 72%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[rgba(var(--muted),0.75)] mb-1 font-medium uppercase tracking-wider">Today's Mindset</div>
            {todayMood ? (
              <div className="flex items-center gap-3">
                <MoodBadge emotion={todayMood.emotion} size="lg" />
                <div className="text-sm text-[rgba(var(--muted),0.85)]">{todayMood.intentions || "Ready to trade with discipline"}</div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="font-semibold">No check-in yet today</div>
                  <div className="text-xs text-[rgba(var(--muted),0.75)]">Start your session with a mindset check</div>
                </div>
              </div>
            )}
          </div>
          <motion.button
            onClick={() => onNavigate("mood")}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="btn-primary shimmer cursor-pointer flex items-center gap-2 text-sm"
          >
            <Brain size={15} />
            {todayMood ? "Update Mood" : "Check In Now"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Win Rate" value={`${winRate}%`} sub={`${wins} of ${total} trades`} accent delay={0.1} icon={<TrendingUp size={14} className="text-[rgb(var(--accent))]" />} />
        <StatCard label="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`} sub="All logged trades" delay={0.15} icon={<TrendingUp size={14} className="text-[rgb(var(--accent))]" />} />
        <StatCard label="Discipline" value={`${disciplineRate}%`} sub="Rules followed" delay={0.2} icon={<Shield size={14} className="text-[rgb(var(--accent))]" />} />
        <StatCard label="Avg. Focus" value={avgDiscipline === "—" ? "—" : `${avgDiscipline}/10`} sub="Self-rated discipline" delay={0.25} icon={<Brain size={14} className="text-[rgb(var(--accent))]" />} />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="text-sm font-semibold mb-3 text-[rgba(var(--muted),0.85)]">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.page}
              onClick={() => onNavigate(action.page)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="glass rounded-[20px] p-4 text-left cursor-pointer flex items-start gap-3 group"
              style={action.accent ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3) 0%, rgba(121,113,249,0.22) 100%)", border: "1px solid rgba(104,155,251,0.35)" } : {}}
            >
              <div className="w-9 h-9 rounded-[13px] grid place-items-center flex-shrink-0"
                style={{ background: action.accent ? "rgba(104,155,251,0.25)" : "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.4)" }}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-[rgba(var(--muted),0.75)] mt-0.5">{action.sub}</div>
              </div>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity mt-0.5 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Trades + Truddy Insight side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-5">
        {/* Recent Trades */}
        <div className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Recent Trades</div>
            <motion.button onClick={() => onNavigate("journal")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pill cursor-pointer text-xs">View All</motion.button>
          </div>
          {recentTrades.length === 0 ? (
            <div className="text-center py-8 text-[rgba(var(--muted),0.6)] text-sm">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              No trades logged yet. Start journaling!
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrades.map((trade, idx) => (
                <motion.div key={trade.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between rounded-[14px] px-3 py-2.5 glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full grid place-items-center text-sm flex-shrink-0 ${trade.outcome === "win" ? "bg-green-400/20 text-green-500" : trade.outcome === "loss" ? "bg-red-400/20 text-red-500" : "bg-gray-400/20 text-gray-500"}`}>
                      {trade.outcome === "win" ? "W" : trade.outcome === "loss" ? "L" : "B"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{trade.symbol || "Unknown"}</div>
                      <div className="text-xs text-[rgba(var(--muted),0.7)]">{trade.direction || "—"} · {new Date(trade.created_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoodBadge emotion={trade.pre_emotion || "neutral"} />
                    <div className={`font-semibold text-sm ${trade.pnl > 0 ? "text-green-500" : trade.pnl < 0 ? "text-red-400" : ""}`}>
                      {trade.pnl != null ? `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl}` : "—"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Truddy AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.35) 0%, rgba(121,113,249,0.28) 100%)", border: "1px solid rgba(104,155,251,0.35)" }}
        >
          <div className="absolute inset-0 backdrop-blur-[18px]" style={{ background: "radial-gradient(300px 250px at 20% 20%, rgba(255,255,255,0.2), transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
                <Sparkles size={16} className="text-[rgb(var(--accent))]" />
              </motion.div>
              <div className="font-semibold text-sm">Truddy's Insight</div>
            </div>
            {loading ? (
              <div className="text-sm text-[rgba(var(--muted),0.7)]">Analyzing your patterns...</div>
            ) : total === 0 ? (
              <div className="text-sm leading-relaxed text-[rgba(var(--text),0.85)]">
                Welcome to Truddy! Start by logging your first trade and completing a mood check-in. Your psychology patterns will surface as you build your journal.
              </div>
            ) : (
              <div className="space-y-3">
                {winRate >= 60 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-[rgba(var(--text),0.85)]">Strong win rate of {winRate}%. Your setups are working — protect your edge.</div>
                  </div>
                )}
                {disciplineRate < 70 && total >= 3 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-[rgba(var(--text),0.85)]">Rule violations in {100 - disciplineRate}% of trades. Review your rules and recommit before your next session.</div>
                  </div>
                )}
                {disciplineRate >= 70 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-[rgba(var(--text),0.85)]">Excellent discipline at {disciplineRate}%. Consistency is your competitive advantage.</div>
                  </div>
                )}
                {!todayMood && (
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-[rgba(var(--text),0.85)]">No mood check-in today. Emotional awareness is your first line of defense.</div>
                  </div>
                )}
              </div>
            )}
            <motion.button
              onClick={() => onNavigate("insights")}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 text-xs font-semibold underline underline-offset-4 cursor-pointer"
            >
              See full analysis →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}