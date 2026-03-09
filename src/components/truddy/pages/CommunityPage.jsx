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

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Community</h1>
            <p className="text-sm text-[rgba(var(--muted),0.75)] mt-1">Connect with other traders</p>
          </div>
          <motion.button
            onClick={() => setShowCompose(v => !v)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="btn-primary text-sm w-full sm:w-auto"
          >
            <Send size={14} /> Share
          </motion.button>
        </div>
      </motion.div>

      {/* Chat Type Selector */}
      <div className="flex gap-2">
        {CHATS.map(chat => (
          <motion.button
            key={chat.key}
            onClick={() => setActiveChat(chat.key)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={activeChat === chat.key
              ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3), rgba(121,113,249,0.22))", border: "1px solid rgba(104,155,251,0.4)" }
              : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {chat.label}
          </motion.button>
        ))}
      </div>

      {/* Issue Filter (for Shared Issues chat) */}
      {activeChat === "issues" && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ISSUES.map(issue => (
            <motion.button
              key={issue.key}
              onClick={() => setSelectedIssue(issue.key)}
              whileTap={{ scale: 0.97 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={selectedIssue === issue.key
                ? { background: "rgba(104,155,251,0.25)", border: "1px solid rgba(104,155,251,0.4)" }
                : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              {issue.label}
            </motion.button>
          ))}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-3">
        {/* Compose Box */}
        <AnimatePresence>
          {showCompose && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="glass rounded-[16px] p-4 space-y-3">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share your thoughts, ask for advice, or support others..."
                rows={4}
                className="w-full bg-transparent resize-none text-sm outline-none placeholder:text-[rgba(var(--muted),0.4)] text-[rgba(var(--text),0.9)]"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-[rgba(var(--muted),0.5)]">Be kind · No bragging · Support each other</div>
                <div className="flex gap-2">
                  <motion.button onClick={() => setShowCompose(false)} whileTap={{ scale: 0.96 }}
                    className="btn-secondary text-xs h-8 px-4">Cancel</motion.button>
                  <motion.button onClick={handlePost} disabled={!draft.trim() || posting} whileTap={{ scale: 0.96 }}
                    className="btn-primary text-xs h-8 px-4 flex items-center gap-1.5">
                    {posting ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><RefreshCw size={12} /></motion.span> : <Send size={12} />}
                    Post
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Level Display */}
      {activeChat === "level" && (
        <div className="glass rounded-[16px] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Your Level</span>
            <span className="text-xs text-[rgba(var(--muted),0.6)]">{userLevel} ({levelRange})</span>
          </div>
        </div>
      )}

      {/* Chat Info */}
      <div className="flex items-center gap-2 text-sm text-[rgba(var(--muted),0.75)] px-1">
        <MessageCircle size={14} />
        {activeChat === "level" 
          ? `Traders in Levels ${levelRange} (${posts.length} posts)`
          : `${ISSUES.find(i => i.key === selectedIssue)?.label} Challenge (${posts.length} posts)`
        }
      </div>

        {/* Posts */}
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
        ) : posts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass rounded-[16px] py-10 px-4 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
            <div className="font-semibold mb-1">No posts yet</div>
            <div className="text-sm text-[rgba(var(--muted),0.6)] mb-4">Be the first to share — your voice matters.</div>
            <motion.button onClick={() => setShowCompose(true)} whileTap={{ scale: 0.96 }}
              className="btn-primary text-sm">
              <Send size={14} /> Share Now
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PostCard post={post} onReact={handleReact} currentUserEmail={user?.email} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}