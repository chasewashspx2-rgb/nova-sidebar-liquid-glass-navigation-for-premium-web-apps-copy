import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, BookOpen, Shield, BarChart2, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Flame, Sparkles, Radio, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MoodBadge } from "@/components/truddy/MoodBadge";
import { CircuitBreaker } from "@/components/truddy/CircuitBreaker";
import XPProgressCard, { calcXpFromActivity, getStage } from "@/components/truddy/XPProgressCard";
import StreakBadges from "@/components/truddy/StreakBadges";
import ConsistencyGrid from "@/components/truddy/ConsistencyGrid";
import CommunityWidget from "@/components/truddy/CommunityWidget";

// Compute streaks from activity data
function computeStreaks(trades, moodChecks) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  const journalDays = new Set(trades.map(t => (t.date || t.created_date || "").slice(0, 10)));
  const moodDays    = new Set(moodChecks.map(m => (m.date || "").slice(0, 10)));
  const ruleDays    = new Set(trades.filter(t => t.followed_rules === "yes").map(t => (t.date || t.created_date || "").slice(0, 10)));

  const streak = (daySet) => {
    let count = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (daySet.has(fmt(d))) count++;
      else break;
    }
    return count;
  };

  return {
    journal:  streak(journalDays),
    mood:     streak(moodDays),
    pretrade: streak(ruleDays),
  };
}

export default function TruddyHome({ onNavigate }) {
  const [trades, setTrades]       = useState([]);
  const [moodChecks, setMoodChecks] = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TradeJournal.list("-created_date", 50),
      base44.entities.MoodCheck.list("-created_date", 30),
      base44.entities.TradingSession.list("-created_date", 30),
    ]).then(([t, m, s]) => {
      setTrades(t);
      setMoodChecks(m);
      setSessions(s);
      setLoading(false);
    });
  }, []);

  const today      = new Date().toISOString().split("T")[0];
  const todayMood  = moodChecks.find(m => m.date === today);
  const recentTrades = trades.slice(0, 5);
  const total      = trades.length;
  const wins       = trades.filter(t => t.outcome === "win").length;
  const winRate    = total > 0 ? Math.round((wins / total) * 100) : 0;
  const rulesViolated = trades.filter(t => t.followed_rules === "no" || t.followed_rules === "partially").length;
  const disciplineRate = total > 0 ? Math.round(((total - rulesViolated) / total) * 100) : 0;

  // XP calculation
  const xp = calcXpFromActivity({
    journals:     trades.length,
    pretrades:    trades.length, // approximate
    sessions:     sessions.filter(s => s.status === "completed").length,
    moodChecks:   moodChecks.length,
    ruleFollowed: trades.filter(t => t.followed_rules === "yes").length,
  });

  // Streaks
  const streaks = computeStreaks(trades, moodChecks);

  // Loss streak for circuit breaker
  const lossStreak = (() => {
    let count = 0;
    for (const t of trades) { if (t.outcome === "loss") count++; else break; }
    return count;
  })();

  const disciplineStreak = (() => {
    let count = 0;
    for (const t of trades) { if (t.followed_rules === "yes") count++; else break; }
    return count;
  })();

  const quickActions = [
    { icon: <Radio size={18} />,         label: "Live Session",   sub: "Real-time trade tracking",  page: "session", accent: true },
    { icon: <MessageCircle size={18} />, label: "Yin and Yang",   sub: "AI coaching session",       page: "coach" },
    { icon: <BookOpen size={18} />,      label: "Journal Entry",  sub: "Log and reflect on trades", page: "journal" },
    { icon: <ShieldCheck size={18} />,   label: "Pre-Trade Gate", sub: "Validate your next trade",  page: "pretrade" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-[24px] sm:text-[28px] font-bold tracking-tight">Truddy</div>
        <div className="text-sm sm:text-base font-medium text-[rgba(var(--muted),0.85)]">Your trading psychology co-pilot</div>
      </motion.div>

      {/* XP Progress Card — replaces Today's Check-In */}
      <XPProgressCard xp={xp} onNavigate={onNavigate} />

      {/* Circuit Breaker */}
      {lossStreak >= 2 && <CircuitBreaker trades={trades} maxLosses={2} />}

      {/* Discipline Streak */}
      {disciplineStreak >= 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[18px] p-4 border flex items-center gap-3"
          style={{ background: "rgba(255,180,50,0.12)", borderColor: "rgba(255,180,50,0.35)" }}>
          <Flame size={18} className="text-yellow-500 flex-shrink-0" />
          <div>
            <span className="font-semibold text-sm text-yellow-500">🔥 {disciplineStreak}-trade discipline streak!</span>
            <div className="text-xs text-[rgba(var(--muted),0.8)] mt-0.5">You've followed your rules {disciplineStreak} trades in a row. +{disciplineStreak * 5} bonus XP earned.</div>
          </div>
        </motion.div>
      )}

      {/* Streaks + Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        {/* Streaks */}
        <div className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">
          <div className="font-semibold text-sm mb-3">Daily Streaks</div>
          <StreakBadges streaks={streaks} />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 sm:min-w-[200px]">
          <div className="text-sm font-semibold text-[rgba(var(--muted),0.85)] mb-1">Quick Access</div>
          {quickActions.map((action, i) => (
            <motion.button key={action.page} onClick={() => onNavigate(action.page)}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.06 }}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-4 py-3 rounded-[18px] cursor-pointer text-left"
              style={action.accent
                ? { background: "linear-gradient(135deg, rgba(104,155,251,0.25), rgba(121,113,249,0.18))", border: "1px solid rgba(104,155,251,0.35)" }
                : { background: "rgba(var(--glass),0.38)", border: "1px solid rgba(255,255,255,0.28)" }}>
              <div className="w-8 h-8 rounded-[11px] grid place-items-center flex-shrink-0"
                style={{ background: action.accent ? "rgba(104,155,251,0.2)" : "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.35)" }}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-[10px] text-[rgba(var(--muted),0.65)] mt-0.5">{action.sub}</div>
              </div>
              <ArrowRight size={13} className="opacity-30 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Consistency Grid */}
      <ConsistencyGrid trades={trades} moodChecks={moodChecks} sessions={sessions} />

      {/* Community + Truddy Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-5">
        {/* Community Widget */}
        <CommunityWidget xp={xp} trades={trades} onNavigate={onNavigate} />

        {/* Truddy AI Insight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.35) 0%, rgba(121,113,249,0.28) 100%)", border: "1px solid rgba(104,155,251,0.35)" }}>
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
                Welcome! Log your first trade (+20 XP), complete a mood check-in (+10 XP), and run the Pre-Trade Gate (+15 XP) to start climbing the leaderboard.
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
                    <div className="text-sm text-[rgba(var(--text),0.85)]">Rule violations in {100 - disciplineRate}% of trades. Each clean trade earns +5 bonus XP — consistency pays.</div>
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
                    <div className="text-sm text-[rgba(var(--text),0.85)]">No mood check-in today — that's 10 XP on the table. Emotional awareness is your first line of defense.</div>
                  </div>
                )}
              </div>
            )}
            <motion.button onClick={() => onNavigate("insights")} whileHover={{ x: 4 }} whileTap={{ scale: 0.95 }}
              className="mt-4 text-xs font-semibold underline underline-offset-4 cursor-pointer">
              See full analysis →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}