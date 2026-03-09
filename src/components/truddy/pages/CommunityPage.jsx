import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, AlertCircle, ExternalLink, Users, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { calcXpFromActivity, calcLevel } from "@/components/truddy/XPProgressCard";

const ISSUES = [
  { key: "fomo", label: "FOMO" },
  { key: "revenge_trading", label: "Revenge Trading" },
  { key: "overtrading", label: "Overtrading" },
  { key: "fear", label: "Fear" },
  { key: "discipline", label: "Discipline" },
  { key: "motivation", label: "Motivation" },
];

function MessageRow({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[16px] p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{message.author || "Unknown User"}</div>
        </div>
        <div className="text-xs text-[rgba(var(--muted),0.5)] flex-shrink-0 ml-2">
          {new Date(message.timestamp).toLocaleDateString()}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.88)]">{message.content}</p>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [mode, setMode] = useState("level");
  const [selectedIssue, setSelectedIssue] = useState("fomo");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [user, setUser] = useState(null);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.TradeJournal.list("-created_date", 50),
      base44.entities.TradingSession.list("-created_date", 30),
      base44.entities.MoodCheck.list("-created_date", 100),
    ]).then(([u, trades, sessions, moods]) => {
      setUser(u);
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

  useEffect(() => {
    loadMessages();
  }, [mode, selectedIssue]);

  async function loadMessages() {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getDiscordMessages', {});
      const allMessages = response.data || [];
      
      if (mode === "level") {
        const levelRange = Math.floor((userLevel - 1) / 10) * 10 + 1;
        const filtered = allMessages.filter(m => m.channel.startsWith(`level-${levelRange}`));
        setMessages(filtered);
      } else {
        const filtered = allMessages.filter(m => m.channel === `issue-${selectedIssue}`);
        setMessages(filtered);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  }

  async function handleJoinChannel() {
    setJoining(true);
    try {
      await base44.functions.invoke('joinDiscordIssueChannel', { issueType: selectedIssue });
      alert(`Joined #issue-${selectedIssue} on Discord!`);
    } catch (error) {
      console.error('Error joining channel:', error);
      alert('Could not join channel. Please try again.');
    }
    setJoining(false);
  }

  const levelRange = `${Math.max(1, Math.floor((userLevel - 1) / 10) * 10 + 1)}-${Math.min(100, Math.floor((userLevel - 1) / 10) * 10 + 10)}`;

  async function handleJoinIssue(issueKey) {
    setJoining(true);
    try {
      await base44.functions.invoke('joinDiscordIssueChannel', { issueType: issueKey });
      alert(`Joined #issue-${issueKey} on Discord!`);
    } catch (error) {
      console.error('Error joining channel:', error);
      alert('Could not join channel. Please try again.');
    }
    setJoining(false);
  }

  async function handleJoinLevel() {
    setJoining(true);
    try {
      const levelStart = Math.floor((userLevel - 1) / 10) * 10 + 1;
      await base44.functions.invoke('syncUserToDiscord', { userLevel });
      alert(`Joined #level-${levelStart} on Discord!`);
    } catch (error) {
      console.error('Error joining level channel:', error);
      alert('Could not join channel. Please try again.');
    }
    setJoining(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Discord Community</h1>
            <p className="text-sm text-[rgba(var(--muted),0.75)] mt-1">Live discussions on Discord</p>
          </div>
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer"
            className="btn-primary text-sm flex items-center gap-2">
            <ExternalLink size={14} /> Open Discord
          </a>
        </div>
      </motion.div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => setMode("level")}
          whileTap={{ scale: 0.97 }}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={mode === "level"
            ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3), rgba(121,113,249,0.22))", border: "1px solid rgba(104,155,251,0.4)" }
            : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Users size={14} /> Your Level
        </motion.button>
        <motion.button
          onClick={() => setMode("issues")}
          whileTap={{ scale: 0.97 }}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={mode === "issues"
            ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3), rgba(121,113,249,0.22))", border: "1px solid rgba(104,155,251,0.4)" }
            : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Zap size={14} /> Issues
        </motion.button>
      </div>

      {/* Issues Grid */}
      {mode === "issues" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ISSUES.map((issue, i) => (
            <motion.div
              key={issue.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-[16px] p-6 flex flex-col gap-4"
            >
              <div>
                <h3 className="font-semibold text-base mb-1">{issue.label}</h3>
                <p className="text-xs text-[rgba(var(--muted),0.6)]">
                    {issue.key === "fomo" && "Fear of missing out on trades"}
                    {issue.key === "revenge_trading" && "Trading to recover losses"}
                    {issue.key === "overtrading" && "Taking too many trades"}
                    {issue.key === "fear" && "Analysis paralysis and hesitation"}
                    {issue.key === "discipline" && "Following your trading rules"}
                    {issue.key === "motivation" && "Stay inspired and motivated"}
                  </p>
              </div>
              <motion.button
                onClick={() => handleJoinIssue(issue.key)}
                disabled={joining}
                whileTap={{ scale: 0.96 }}
                className="w-full btn-primary text-sm"
              >
                {joining ? "Joining..." : `Join #issue-${issue.key}`}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Messages Feed - Only show for level mode */}
      {mode === "level" && (
      <div className="space-y-3">
        {/* Level Info */}
        <div className="glass rounded-[16px] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Your Level {userLevel}</span>
            <span className="text-xs text-[rgba(var(--muted),0.6)]">Access to Levels {levelRange}</span>
          </div>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-[16px] p-4 animate-pulse">
                <div className="h-3 bg-white/20 rounded-full w-1/3 mb-3" />
                <div className="h-3 bg-white/10 rounded-full w-full mb-2" />
                <div className="h-3 bg-white/10 rounded-full w-3/4" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
           <motion.button
             onClick={() => handleJoinLevel()}
             whileTap={{ scale: 0.96 }}
             className="w-full btn-primary text-sm py-6"
           >
             Join Level {Math.floor((userLevel - 1) / 10) * 10 + 1}-{Math.min(100, Math.floor((userLevel - 1) / 10) * 10 + 10)} Channel
           </motion.button>
         ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MessageRow message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      )}
    </div>
  );
}