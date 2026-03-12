import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Shield, BarChart2, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Flame, Sparkles, Radio, Bell, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MoodBadge } from "@/components/truddy/MoodBadge";
import { CircuitBreaker } from "@/components/truddy/CircuitBreaker";
import XPProgressCard, { calcXpFromActivity, getStage } from "@/components/truddy/XPProgressCard";
import StreakWidget from "@/components/truddy/StreakWidget";
import ConsistencyGrid from "@/components/truddy/ConsistencyGrid";
import CommunityWidget from "@/components/truddy/CommunityWidget";
import RotatingQuote from "@/components/truddy/RotatingQuote";
import YinYangIcon from "@/components/YinYangIcon";
import PenJournalIcon from "@/components/PenJournalIcon";

// Compute streaks — weekdays only (Mon–Fri), skip weekends
function computeStreaks(trades, ruleCompliances) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  const journalDays = new Set(trades.map(t => (t.date || t.created_date || "").slice(0, 10)));

  // Discipline streak: days where at least one rule was followed and none violated
  const complianceDayMap = {};
  for (const c of ruleCompliances) {
    if (!complianceDayMap[c.date]) complianceDayMap[c.date] = { followed: 0, violated: 0 };
    if (c.followed) complianceDayMap[c.date].followed++;
    else complianceDayMap[c.date].violated++;
  }
  const disciplineDays = new Set(
    Object.entries(complianceDayMap)
      .filter(([, v]) => v.followed > 0 && v.violated === 0)
      .map(([date]) => date)
  );

  const streak = (daySet) => {
    let count = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      // Skip weekends — they don't break the streak
      if (dow === 0 || dow === 6) continue;
      if (daySet.has(fmt(d))) count++;
      else break;
    }
    return count;
  };

  return {
    journal:  streak(journalDays),
    pretrade: streak(disciplineDays),
  };
}

export default function TruddyHome({ onNavigate }) {
  const [trades, setTrades]       = useState([]);
  const [moodChecks, setMoodChecks] = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [ruleCompliances, setRuleCompliances] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [user, setUser]           = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Promise.all([
      base44.entities.TradeJournal.list("-created_date", 50),
      base44.entities.TradingSession.list("-created_date", 30),
      base44.auth.me(),
      base44.entities.CommunityPost.list("-created_date", 20),
      base44.entities.MoodCheck.list("-created_date", 100),
      base44.entities.RuleCompliance.list("-created_date", 200),
    ]).then(([t, s, u, posts, moods, compliances]) => {
      setTrades(t);
      setSessions(s);
      setUser(u);
      setMoodChecks(moods);
      setRuleCompliances(compliances);
      const unread = posts.filter(p => p.created_by !== u?.email).length;
      setUnreadCount(unread);
      setLoading(false);
    });
  }, []);

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
  const streaks = computeStreaks(trades, ruleCompliances);

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
    { icon: <Radio size={18} />,       label: "Live Session",   sub: "Real-time trade tracking",  page: "session", accent: false, iconColor: { icon: "#ff8060", bg: "rgba(255,120,90,0.2)", border: "rgba(255,140,110,0.4)" },
      btnStyle: { background: "linear-gradient(135deg, rgba(255,120,90,0.25) 0%, rgba(255,180,155,0.1) 100%)", border: "1px solid rgba(255,140,110,0.35)" } },
    { icon: <YinYangIcon size={18} />, label: "Yin and Yang",   sub: "AI coaching session",       page: "coach",   iconColor: null,
      btnStyle: { background: "linear-gradient(135deg, rgba(160,120,255,0.28) 0%, rgba(210,185,255,0.1) 100%)", border: "1px solid rgba(185,155,255,0.38)" } },
    { icon: <BookOpen size={18} />,    label: "Journal Entry",  sub: "Log and reflect on trades", page: "journal", iconColor: { icon: "#7eb8f7", bg: "rgba(126,184,247,0.18)", border: "rgba(126,184,247,0.35)" },
      btnStyle: { background: "linear-gradient(135deg, rgba(100,165,245,0.26) 0%, rgba(180,215,255,0.1) 100%)", border: "1px solid rgba(126,184,247,0.3)" } },
    { icon: <ShieldCheck size={18} />, label: "Pre-Trade Gate", sub: "Validate your next trade",  page: "pretrade", iconColor: { icon: "#e8c84a", bg: "rgba(232,200,74,0.18)", border: "rgba(232,200,74,0.35)" },
      btnStyle: { background: "linear-gradient(135deg, rgba(220,185,50,0.26) 0%, rgba(255,235,130,0.1) 100%)", border: "1px solid rgba(232,200,74,0.3)" } },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-start justify-between">
        <div>
          <div className="text-[24px] sm:text-[28px] font-bold tracking-tight">
            Hello, {user?.full_name?.split(" ")[0] || "Trader"} 👋
          </div>
          <RotatingQuote />
        </div>
        {unreadCount > 0 && (
          <motion.button onClick={() => onNavigate("community")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-[14px] text-xs font-semibold"
            style={{ background: "rgba(104,155,251,0.15)", border: "1px solid rgba(104,155,251,0.3)" }}>
            <Bell size={14} />
            <span>{unreadCount} unread</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[rgb(var(--accent))]" />
          </motion.button>
        )}
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
        <StreakWidget streaks={streaks} />

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 sm:min-w-[200px]">
          <div className="text-sm font-semibold text-[rgba(var(--muted),0.85)] mb-1">Quick Access</div>
          {quickActions.map((action, i) => (
            <motion.button key={action.page} onClick={() => onNavigate(action.page)}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.06 }}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-4 py-3 rounded-[18px] cursor-pointer text-left"
              style={action.btnStyle || { background: "rgba(var(--glass),0.38)", border: "1px solid rgba(255,255,255,0.28)" }}>
              <div className="w-8 h-8 rounded-[11px] grid place-items-center flex-shrink-0"
                style={{
                  background: action.accent ? "rgba(104,155,251,0.2)" : action.iconColor ? action.iconColor.bg : "rgba(255,255,255,0.28)",
                  border: `1px solid ${action.accent ? "rgba(104,155,251,0.4)" : action.iconColor ? action.iconColor.border : "rgba(255,255,255,0.35)"}`,
                  color: action.iconColor ? action.iconColor.icon : undefined,
                }}>
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
      <ConsistencyGrid trades={trades} sessions={sessions} />

      {/* Community + Truddy Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-5">
        {/* Community Widget */}
        <CommunityWidget xp={xp} trades={trades} onNavigate={onNavigate} />

        {/* Truddy AI Insight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[24px] overflow-hidden relative"
          style={{ background: "linear-gradient(145deg, rgba(104,155,251,0.22) 0%, rgba(121,113,249,0.15) 60%, rgba(104,155,251,0.1) 100%)", border: "1px solid rgba(104,155,251,0.28)", backdropFilter: "blur(20px)" }}>

          {/* Glow blob */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(121,113,249,0.25) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

          <div className="relative p-5 sm:p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl grid place-items-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(91,154,246,0.4), rgba(121,113,249,0.4))", border: "1px solid rgba(121,113,249,0.4)", boxShadow: "0 4px 14px rgba(121,113,249,0.25)" }}>
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
                  <Sparkles size={15} style={{ color: "#c4b5fd" }} />
                </motion.div>
              </div>
              <div>
                <div className="font-bold text-sm">Truddy's Insight</div>
                <div className="text-[10px] text-[rgba(var(--muted),0.6)] mt-0.5">AI-powered coaching</div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(104,155,251,0.3), rgba(121,113,249,0.15), transparent)" }} />

            {/* Content */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-[rgba(var(--muted),0.7)]">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Sparkles size={12} style={{ color: "#7eb8f7" }} />
                  </motion.div>
                  Analyzing your patterns...
                </div>
              ) : total === 0 ? (
                <p className="text-sm leading-relaxed text-[rgba(var(--text),0.8)]">
                  Welcome! Log your first trade <span className="font-semibold text-[#7eb8f7]">+20 XP</span>, complete a mood check-in <span className="font-semibold text-[#7eb8f7]">+10 XP</span>, and run the Pre-Trade Gate <span className="font-semibold text-[#7eb8f7]">+15 XP</span> to start climbing.
                </p>
              ) : (
                <>
                  {winRate >= 60 && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <CheckCircle2 size={11} className="text-green-400" />
                      </div>
                      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.85)]">
                        Win rate of <span className="font-semibold text-green-400">{winRate}%</span> — your setups are working. Protect your edge.
                      </p>
                    </div>
                  )}
                  {disciplineRate < 70 && total >= 3 && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)" }}>
                        <AlertCircle size={11} className="text-orange-400" />
                      </div>
                      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.85)]">
                        Rule violations in <span className="font-semibold text-orange-400">{100 - disciplineRate}%</span> of trades. Each clean trade earns <span className="font-semibold text-[#7eb8f7]">+5 bonus XP</span>.
                      </p>
                    </div>
                  )}
                  {disciplineRate >= 70 && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <CheckCircle2 size={11} className="text-green-400" />
                      </div>
                      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.85)]">
                        Discipline at <span className="font-semibold text-green-400">{disciplineRate}%</span> — consistency is your competitive advantage.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CTA */}
            <motion.button onClick={() => onNavigate("insights")} whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-[14px] text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, rgba(91,154,246,0.25), rgba(121,113,249,0.25))", border: "1px solid rgba(121,113,249,0.35)", color: "#c4b5fd" }}>
              <Sparkles size={11} />
              View Full Analysis
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}