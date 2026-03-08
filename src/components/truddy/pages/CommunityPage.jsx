import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Lightbulb, Send, ChevronRight, Users, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getStage } from "@/components/truddy/XPProgressCard";

const STAGE_ROOMS = [
  { key: "beginner",     label: "Beginner",     emoji: "🌱", color: "rgba(160,172,195,0.9)", bg: "rgba(160,172,195,0.12)", border: "rgba(160,172,195,0.3)" },
  { key: "developing",   label: "Developing",   emoji: "📈", color: "rgba(104,155,251,0.9)", bg: "rgba(104,155,251,0.12)", border: "rgba(104,155,251,0.3)" },
  { key: "intermediate", label: "Intermediate", emoji: "🔥", color: "rgba(250,180,60,0.9)",  bg: "rgba(250,180,60,0.12)",  border: "rgba(250,180,60,0.3)"  },
  { key: "advanced",     label: "Advanced",     emoji: "⚡", color: "rgba(121,113,249,0.9)", bg: "rgba(121,113,249,0.12)", border: "rgba(121,113,249,0.3)" },
  { key: "elite",        label: "Elite",        emoji: "🏆", color: "rgba(255,200,50,0.9)",  bg: "rgba(255,200,50,0.12)",  border: "rgba(255,200,50,0.3)"  },
];

const CHALLENGE_ROOMS = [
  { key: "fomo",            label: "FOMO",             emoji: "😤", color: "rgba(255,100,80,0.9)",  bg: "rgba(255,100,80,0.1)",  border: "rgba(255,100,80,0.28)"  },
  { key: "revenge_trading", label: "Revenge Trading",  emoji: "🔄", color: "rgba(220,60,60,0.9)",   bg: "rgba(220,60,60,0.1)",   border: "rgba(220,60,60,0.28)"   },
  { key: "overtrading",     label: "Overtrading",      emoji: "⚠️", color: "rgba(250,180,60,0.9)",  bg: "rgba(250,180,60,0.1)",  border: "rgba(250,180,60,0.28)"  },
  { key: "fear",            label: "Fear",             emoji: "😰", color: "rgba(130,100,220,0.9)", bg: "rgba(130,100,220,0.1)", border: "rgba(130,100,220,0.28)" },
  { key: "discipline",      label: "Discipline",       emoji: "🛡️", color: "rgba(72,199,142,0.9)",  bg: "rgba(72,199,142,0.1)",  border: "rgba(72,199,142,0.28)"  },
];

const ALL_ROOMS = [...STAGE_ROOMS, ...CHALLENGE_ROOMS];

const REACTIONS = [
  { key: "support",  icon: <Heart size={13} />,      label: "Support",  color: "rgba(255,100,120,0.9)" },
  { key: "relate",   icon: <RefreshCw size={13} />,  label: "Relate",   color: "rgba(104,155,251,0.9)" },
  { key: "helpful",  icon: <Lightbulb size={13} />,  label: "Helpful",  color: "rgba(250,180,60,0.9)"  },
];

function roomMeta(key) {
  return ALL_ROOMS.find(r => r.key === key) || { label: key, emoji: "💬", color: "rgba(160,172,195,0.9)", bg: "rgba(160,172,195,0.1)", border: "rgba(160,172,195,0.25)" };
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostCard({ post, onReact, currentUserEmail }) {
  const meta = roomMeta(post.room_key);
  const hasReacted = (post.reacted_by || []).includes(currentUserEmail);
  const reactions = post.reactions || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[18px] p-4"
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full grid place-items-center text-sm flex-shrink-0"
          style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
          {post.author_stage ? getStage(0).emoji : "👤"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{post.author_name || "Anonymous Trader"}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-[rgba(var(--muted),0.5)]">
            <span style={{ color: meta.color }}>{meta.emoji} {meta.label}</span>
            <span>·</span>
            <span>{timeAgo(post.created_date)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-[rgba(var(--text),0.88)] mb-3">{post.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-2">
        {REACTIONS.map(r => (
          <motion.button
            key={r.key}
            onClick={() => !hasReacted && onReact(post.id, r.key)}
            whileTap={!hasReacted ? { scale: 0.9 } : {}}
            disabled={hasReacted}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
            style={{
              background: (reactions[r.key] || 0) > 0 ? `${r.color.replace("0.9", "0.12")}` : "rgba(var(--glass),0.3)",
              border: `1px solid ${(reactions[r.key] || 0) > 0 ? r.color.replace("0.9", "0.3") : "rgba(255,255,255,0.2)"}`,
              color: (reactions[r.key] || 0) > 0 ? r.color : "rgba(var(--muted),0.6)",
              cursor: hasReacted ? "default" : "pointer",
            }}
          >
            {r.icon}
            <span>{r.label}</span>
            {(reactions[r.key] || 0) > 0 && <span className="ml-0.5 font-bold">{reactions[r.key]}</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const [activeTab, setActiveTab]     = useState("stage");
  const [activeRoom, setActiveRoom]   = useState("beginner");
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [posting, setPosting]         = useState(false);
  const [draft, setDraft]             = useState("");
  const [user, setUser]               = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [activeRoom]);

  async function loadPosts() {
    setLoading(true);
    const data = await base44.entities.CommunityPost.filter({ room_key: activeRoom }, "-created_date", 30);
    setPosts(data);
    setLoading(false);
  }

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    await base44.entities.CommunityPost.create({
      room_key: activeRoom,
      room_type: activeTab,
      author_name: user?.full_name || "Anonymous Trader",
      author_stage: "beginner",
      content: draft.trim(),
      reactions: { support: 0, relate: 0, helpful: 0 },
      reacted_by: [],
    });
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

  const tabRooms = activeTab === "stage" ? STAGE_ROOMS : CHALLENGE_ROOMS;
  const currentRoom = ALL_ROOMS.find(r => r.key === activeRoom) || STAGE_ROOMS[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[24px] sm:text-[28px] font-bold tracking-tight flex items-center gap-2">
              <Users size={24} /> Community Hub
            </div>
            <div className="text-sm text-[rgba(var(--muted),0.75)] mt-0.5">Peer support — empathy over performance</div>
          </div>
          <motion.button
            onClick={() => setShowCompose(v => !v)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="btn-primary shimmer cursor-pointer flex items-center gap-2 text-sm"
          >
            <Send size={14} />
            Share
          </motion.button>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { key: "stage",     label: "Trader Stages", emoji: "🏅" },
          { key: "challenge", label: "Challenges",    emoji: "🧠" },
        ].map(t => (
          <motion.button key={t.key} onClick={() => { setActiveTab(t.key); setActiveRoom(t.key === "stage" ? "beginner" : "fomo"); }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
            style={activeTab === t.key
              ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3), rgba(121,113,249,0.22))", border: "1px solid rgba(104,155,251,0.4)" }
              : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span>{t.emoji}</span> {t.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Room list */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0">
          {tabRooms.map((room, i) => (
            <motion.button key={room.key}
              onClick={() => setActiveRoom(room.key)}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[16px] text-sm font-medium cursor-pointer flex-shrink-0 lg:flex-shrink transition-all"
              style={activeRoom === room.key
                ? { background: room.bg, border: `1px solid ${room.border}`, color: room.color }
                : { background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(var(--muted),0.8)" }}>
              <span className="text-base">{room.emoji}</span>
              <span className="whitespace-nowrap">{room.label}</span>
              {activeRoom === room.key && <ChevronRight size={13} className="ml-auto hidden lg:block" style={{ color: room.color }} />}
            </motion.button>
          ))}
        </div>

        {/* Posts feed */}
        <div className="space-y-3">
          {/* Compose box */}
          <AnimatePresence>
            {showCompose && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="glass rounded-[20px] p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: currentRoom.color }}>
                  <span>{currentRoom.emoji}</span> Sharing in {currentRoom.label}
                </div>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={`Share what's on your mind — a challenge you're facing, a lesson learned, or support for others in the ${currentRoom.label} room...`}
                  rows={4}
                  className="w-full bg-transparent resize-none text-sm outline-none placeholder:text-[rgba(var(--muted),0.4)] text-[rgba(var(--text),0.9)]"
                />
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-[rgba(var(--muted),0.45)]">Be kind · No P&L bragging · Support each other</div>
                  <div className="flex gap-2">
                    <motion.button onClick={() => setShowCompose(false)} whileTap={{ scale: 0.96 }}
                      className="btn-secondary text-xs h-8 px-4 cursor-pointer">Cancel</motion.button>
                    <motion.button onClick={handlePost} disabled={!draft.trim() || posting} whileTap={{ scale: 0.96 }}
                      className="btn-primary text-xs h-8 px-4 cursor-pointer flex items-center gap-1.5">
                      {posting ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><RefreshCw size={12} /></motion.span> : <Send size={12} />}
                      Post
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room header */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-lg">{currentRoom.emoji}</span>
            <span className="font-semibold">{currentRoom.label} Room</span>
            <span className="text-xs text-[rgba(var(--muted),0.5)] ml-1">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass rounded-[18px] p-4 animate-pulse">
                  <div className="h-3 bg-white/20 rounded-full w-1/3 mb-3" />
                  <div className="h-3 bg-white/10 rounded-full w-full mb-2" />
                  <div className="h-3 bg-white/10 rounded-full w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-[20px] py-14 text-center">
              <div className="text-4xl mb-3">{currentRoom.emoji}</div>
              <div className="font-semibold mb-1">No posts yet in {currentRoom.label}</div>
              <div className="text-sm text-[rgba(var(--muted),0.6)]">Be the first to share — your experience could help someone else.</div>
              <motion.button onClick={() => setShowCompose(true)} whileTap={{ scale: 0.96 }}
                className="mt-4 btn-primary text-sm cursor-pointer inline-flex items-center gap-2">
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
    </div>
  );
}