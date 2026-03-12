import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Users, Zap, MessageCircle, CheckCircle, AlertCircle, Loader2, Link } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { calcXpFromActivity, calcLevel } from "@/components/truddy/XPProgressCard";
import CommunityGuidelines from "@/components/truddy/CommunityGuidelines";

const ISSUES = [
  { key: "fomo",            label: "FOMO",            desc: "Fear of missing out on trades" },
  { key: "revenge_trading", label: "Revenge Trading",  desc: "Trading to recover losses" },
  { key: "overtrading",     label: "Overtrading",      desc: "Taking too many trades" },
  { key: "fear",            label: "Fear",             desc: "Analysis paralysis and hesitation" },
  { key: "discipline",      label: "Discipline",       desc: "Following your trading rules" },
  { key: "motivation",      label: "Motivation",       desc: "Stay inspired and motivated" },
];

const DISCORD_INVITE = "https://discord.gg/truddy";
const DISCORD_GUILD_URL = "https://discord.com/channels/1480680849857933322/1480686131107598529";

// Persist Discord join status in localStorage
function getDiscordStatus() {
  return localStorage.getItem("truddy_discord_status") || "not_connected";
}
function setDiscordStatusLS(s) {
  localStorage.setItem("truddy_discord_status", s);
}

export default function CommunityPage() {
  const [mode, setMode] = useState("level");
  const [userLevel, setUserLevel] = useState(1);
  const [discordStatus, setDiscordStatus] = useState(getDiscordStatus); // not_connected | connecting | connected | failed
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.TradeJournal.list("-created_date", 50),
      base44.entities.TradingSession.list("-created_date", 30),
      base44.entities.MoodCheck.list("-created_date", 100),
    ]).then(([trades, sessions, moods]) => {
      const xp = calcXpFromActivity({
        journals: trades.length,
        pretrades: trades.length,
        sessions: sessions.filter(s => s.status === "completed").length,
        moodChecks: moods.length,
        ruleFollowed: trades.filter(t => t.followed_rules === "yes").length,
      });
      setUserLevel(calcLevel(xp));
    }).catch(() => {});
  }, []);

  const levelStart = Math.floor((userLevel - 1) / 10) * 10 + 1;
  const levelEnd   = Math.min(100, levelStart + 9);
  const levelRange = `${levelStart}–${levelEnd}`;

  async function handleConnectDiscord() {
    setJoining(true);
    setDiscordStatus("connecting");
    try {
      await base44.functions.invoke("syncUserToDiscord", { userLevel });
      setDiscordStatus("connected");
      setDiscordStatusLS("connected");
    } catch (err) {
      console.error("Discord sync error:", err);
      setDiscordStatus("failed");
      setDiscordStatusLS("failed");
    }
    setJoining(false);
  }

  function handleOpenChannel() {
    window.open(DISCORD_GUILD_URL, "_blank");
  }

  function handleRetry() {
    setDiscordStatus("not_connected");
    setDiscordStatusLS("not_connected");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-sm mt-1 opacity-50">Your peer group of traders at the same level</p>
      </motion.div>

      {/* Tier badge — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, rgba(104,155,251,0.12) 0%, rgba(121,113,249,0.08) 100%)",
          border: "1px solid rgba(104,155,251,0.25)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center"
            style={{ background: "rgba(104,155,251,0.18)", border: "1px solid rgba(104,155,251,0.3)" }}
          >
            <Users size={16} style={{ color: "rgba(104,155,251,1)" }} />
          </div>
          <div>
            <div className="font-bold text-sm">Level {userLevel} Trader</div>
            <div className="text-xs opacity-50 mt-0.5">Eligible for Levels {levelRange} community</div>
          </div>
        </div>
      </motion.div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        {[
          { key: "level",  label: "Your Level",  icon: <Users size={13} /> },
          { key: "issues", label: "Issues",       icon: <Zap size={13} /> },
        ].map(tab => (
          <motion.button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            style={mode === tab.key
              ? { background: "linear-gradient(135deg, rgba(104,155,251,0.28), rgba(121,113,249,0.2))", border: "1px solid rgba(104,155,251,0.4)" }
              : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {tab.icon}{tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── Level Mode ── */}
      <AnimatePresence mode="wait">
        {mode === "level" && (
          <motion.div key="level" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">

            {/* NOT CONNECTED */}
            {discordStatus === "not_connected" && (
              <DiscordPromptCard
                title={`Levels ${levelRange} Community`}
                description="Connect Discord to chat live with traders at your level. This is completely optional — the rest of the app works without it."
                cta="Optional: Join Discord Chat"
                ctaIcon={<MessageCircle size={14} />}
                onConnect={handleConnectDiscord}
                loading={joining}
              />
            )}

            {/* CONNECTING */}
            {discordStatus === "connecting" && (
              <StatusCard
                icon={<Loader2 size={18} className="animate-spin" style={{ color: "rgba(104,155,251,0.8)" }} />}
                title="Connecting to Discord…"
                subtitle="Adding you to the Levels community server"
                color="rgba(104,155,251,0.15)"
                border="rgba(104,155,251,0.25)"
              />
            )}

            {/* CONNECTED */}
            {discordStatus === "connected" && (
              <div className="space-y-3">
                <StatusCard
                  icon={<CheckCircle size={18} style={{ color: "rgba(26,200,120,0.9)" }} />}
                  title="Discord connected"
                  subtitle={`You're in the Levels ${levelRange} community`}
                  color="rgba(26,200,120,0.1)"
                  border="rgba(26,200,120,0.25)"
                />
                <motion.button
                  onClick={handleOpenChannel}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-2xl px-5 py-4 flex items-center justify-between text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, rgba(104,155,251,0.18), rgba(121,113,249,0.12))",
                    border: "1px solid rgba(104,155,251,0.35)",
                    boxShadow: "0 8px 28px rgba(104,155,251,0.14)",
                  }}
                >
                  <span style={{ color: "rgba(104,155,251,1)" }}>Open Levels {levelRange} Discord Channel</span>
                  <ExternalLink size={14} style={{ color: "rgba(104,155,251,0.7)" }} />
                </motion.button>
              </div>
            )}

            {/* FAILED */}
            {discordStatus === "failed" && (
              <div className="space-y-3">
                <StatusCard
                  icon={<AlertCircle size={18} style={{ color: "rgba(220,80,60,0.9)" }} />}
                  title="Discord connection failed"
                  subtitle="Something went wrong. You can try again or skip Discord entirely."
                  color="rgba(220,80,60,0.08)"
                  border="rgba(220,80,60,0.25)"
                />
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleConnectDiscord}
                    disabled={joining}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 btn-primary text-sm"
                  >
                    {joining ? <Loader2 size={14} className="animate-spin" /> : "Try Again"}
                  </motion.button>
                  <motion.button
                    onClick={handleRetry}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Skip for Now
                  </motion.button>
                </div>
              </div>
            )}

            <CommunityGuidelines />
          </motion.div>
        )}

        {/* ── Issues Mode ── */}
        {mode === "issues" && (
          <motion.div key="issues" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs opacity-40 px-1">Each channel focuses on a specific trading psychology challenge. Connect Discord to join the conversation.</p>
            <div className="grid grid-cols-1 gap-3">
              {ISSUES.map((issue, i) => (
                <motion.div
                  key={issue.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{issue.label}</div>
                    <div className="text-xs opacity-50 mt-0.5">{issue.desc}</div>
                  </div>

                  {discordStatus === "connected" ? (
                    <motion.button
                      onClick={() => window.open(DISCORD_GUILD_URL, "_blank")}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5"
                      style={{
                        background: "rgba(104,155,251,0.14)",
                        border: "1px solid rgba(104,155,251,0.28)",
                        color: "rgba(104,155,251,0.9)",
                      }}
                    >
                      <ExternalLink size={11} /> Open
                    </motion.button>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] opacity-30 font-medium">Discord optional</span>
                  )}
                </motion.div>
              ))}
            </div>

            {discordStatus !== "connected" && (
              <motion.button
                onClick={handleConnectDiscord}
                disabled={joining}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-2xl px-5 py-4 flex items-center justify-center gap-2 text-sm font-semibold"
                style={{
                  background: "rgba(104,155,251,0.1)",
                  border: "1px solid rgba(104,155,251,0.25)",
                  color: "rgba(104,155,251,0.85)",
                }}
              >
                {joining
                  ? <><Loader2 size={13} className="animate-spin" /> Connecting…</>
                  : <><Link size={13} /> Connect Discord to Join These Channels</>
                }
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DiscordPromptCard({ title, description, cta, ctaIcon, onConnect, loading }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "rgba(var(--glass),0.4)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div>
        <div className="font-semibold text-sm mb-1">{title}</div>
        <p className="text-xs leading-relaxed opacity-50">{description}</p>
      </div>
      <motion.button
        onClick={onConnect}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.14))",
          border: "1px solid rgba(104,155,251,0.35)",
          color: "rgba(104,155,251,1)",
          boxShadow: "0 6px 24px rgba(104,155,251,0.12)",
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : ctaIcon}
        {loading ? "Connecting…" : cta}
      </motion.button>
    </div>
  );
}

function StatusCard({ icon, title, subtitle, color, border }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-3"
      style={{ background: color, border: `1px solid ${border}` }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs opacity-55 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}