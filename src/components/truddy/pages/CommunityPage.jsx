import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Lightbulb, Send, MessageCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Chat types
const CHATS = [
  { key: "level", label: "Your Level", description: "Chat with traders in your level range" },
  { key: "issues", label: "Shared Issues", description: "Connect over common trading challenges" },
];

const ISSUES = [
  { key: "fomo", label: "FOMO" },
  { key: "revenge_trading", label: "Revenge Trading" },
  { key: "overtrading", label: "Overtrading" },
  { key: "fear", label: "Fear" },
  { key: "discipline", label: "Discipline" },
];

const REACTIONS = [
  { key: "support", label: "Support", icon: "👍" },
  { key: "relate", label: "Relate", icon: "🔄" },
  { key: "helpful", label: "Helpful", icon: "💡" },
];

function PostCard({ post, onReact, currentUserEmail }) {
  const hasReacted = (post.reacted_by || []).includes(currentUserEmail);
  const reactions = post.reactions || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[16px] p-4"
    >
      {/* Author info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{post.author_name || "Anonymous"}</div>
          {post.author_level && (
            <div className="text-xs text-[rgba(var(--muted),0.6)]">Level {post.author_level}</div>
          )}
        </div>
        <div className="text-xs text-[rgba(var(--muted),0.5)] flex-shrink-0 ml-2">
          {post.created_date ? new Date(post.created_date).toLocaleDateString() : ""}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.88)] mb-3">{post.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {REACTIONS.map(r => (
          <motion.button
            key={r.key}
            onClick={() => !hasReacted && onReact(post.id, r.key)}
            whileTap={!hasReacted ? { scale: 0.9 } : {}}
            disabled={hasReacted}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: (reactions[r.key] || 0) > 0 ? "rgba(104,155,251,0.15)" : "rgba(var(--glass),0.3)",
              border: `1px solid ${(reactions[r.key] || 0) > 0 ? "rgba(104,155,251,0.3)" : "rgba(255,255,255,0.2)"}`,
              cursor: hasReacted ? "default" : "pointer",
              opacity: hasReacted ? 0.6 : 1,
            }}
          >
            <span>{r.icon}</span>
            {(reactions[r.key] || 0) > 0 && <span className="text-[10px]">{reactions[r.key]}</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [activeChat, setActiveChat] = useState("level");
  const [selectedIssue, setSelectedIssue] = useState("fomo");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [draft, setDraft] = useState("");
  const [user, setUser] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  // Fetch user and calculate level
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Calculate level from XP (1-100 scale)
      const xp = u?.xp || 0;
      const level = Math.min(100, Math.max(1, Math.floor(xp / 100) + 1));
      setUserLevel(level);
    }).catch(() => {});
  }, []);

  // Load posts based on active chat
  useEffect(() => {
    loadPosts();
  }, [activeChat, selectedIssue]);

  async function loadPosts() {
    setLoading(true);
    let query = {};

    if (activeChat === "level") {
      // Get level range (e.g., level 15 -> 11-20)
      const minLevel = Math.max(1, Math.floor((userLevel - 1) / 10) * 10 + 1);
      const maxLevel = minLevel + 9;
      query = { room_key: "level", author_level: { $gte: minLevel, $lte: maxLevel } };
    } else {
      query = { room_key: "issue", issue_type: selectedIssue };
    }

    const data = await base44.entities.CommunityPost.filter(query, "-created_date", 40);
    setPosts(data);
    setLoading(false);
  }

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);

    const postData = {
      room_key: activeChat === "level" ? "level" : "issue",
      author_name: user?.full_name || "Anonymous",
      author_level: userLevel,
      content: draft.trim(),
      reactions: { support: 0, relate: 0, helpful: 0 },
      reacted_by: [],
    };

    if (activeChat === "issues") {
      postData.issue_type = selectedIssue;
    }

    await base44.entities.CommunityPost.create(postData);
    setDraft("");
    setShowCompose(false);
    setPosting(false);
    loadPosts();
  }

  async function handleReact(postId, reactionKey) {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post || (post.reacted_by || []).includes(user.email)) return;

    const updatedReactions = { ...(post.reactions || {}), [reactionKey]: ((post.reactions || {})[reactionKey] || 0) + 1 };
    await base44.entities.CommunityPost.update(postId, {
      reactions: updatedReactions,
      reacted_by: [...(post.reacted_by || []), user.email],
    });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: updatedReactions, reacted_by: [...(p.reacted_by || []), user.email] } : p));
  }

  const levelRange = activeChat === "level"
    ? `${Math.max(1, Math.floor((userLevel - 1) / 10) * 10 + 1)}-${Math.min(100, Math.floor((userLevel - 1) / 10) * 10 + 10)}`
    : null;

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