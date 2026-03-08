import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, RefreshCw, Lightbulb, ArrowRight, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getStage } from "@/components/truddy/XPProgressCard";

const STAGE_KEY_MAP = {
  1: "beginner",
  2: "developing",
  3: "intermediate",
  4: "advanced",
  5: "elite",
};

const CHALLENGE_META = {
  fomo:            { label: "FOMO",            emoji: "😤", color: "rgba(255,100,80,0.9)" },
  revenge_trading: { label: "Revenge Trading", emoji: "🔄", color: "rgba(220,60,60,0.9)"  },
  overtrading:     { label: "Overtrading",     emoji: "⚠️", color: "rgba(250,180,60,0.9)" },
  fear:            { label: "Fear",            emoji: "😰", color: "rgba(130,100,220,0.9)"},
  discipline:      { label: "Discipline",      emoji: "🛡️", color: "rgba(72,199,142,0.9)"  },
};

const STAGE_META = {
  beginner:     { label: "Beginner",     emoji: "🌱", color: "rgba(160,172,195,0.9)" },
  developing:   { label: "Developing",   emoji: "📈", color: "rgba(104,155,251,0.9)" },
  intermediate: { label: "Intermediate", emoji: "🔥", color: "rgba(250,180,60,0.9)"  },
  advanced:     { label: "Advanced",     emoji: "⚡", color: "rgba(121,113,249,0.9)" },
  elite:        { label: "Elite",        emoji: "🏆", color: "rgba(255,200,50,0.9)"  },
};

function isNew(dateStr) {
  return (Date.now() - new Date(dateStr)) < 24 * 60 * 60 * 1000;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostRow({ post, roomMeta, isNewPost }) {
  const reactions = post.reactions || {};
  const totalReactions = (reactions.support || 0) + (reactions.relate || 0) + (reactions.helpful || 0);

  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}>
      {/* Room badge */}
      <div className="w-7 h-7 rounded-full grid place-items-center flex-shrink-0 text-sm mt-0.5"
        style={{ background: roomMeta?.color?.replace("0.9", "0.12") || "rgba(160,172,195,0.12)", border: `1px solid ${roomMeta?.color?.replace("0.9", "0.25") || "rgba(255,255,255,0.15)"}` }}>
        {roomMeta?.emoji || "💬"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-semibold" style={{ color: roomMeta?.color }}>
            {roomMeta?.label}
          </span>
          {isNewPost && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(104,155,251,0.2)", color: "rgba(104,155,251,0.95)", border: "1px solid rgba(104,155,251,0.3)" }}>
              NEW
            </span>
          )}
          <span className="text-[10px] text-[rgba(var(--muted),0.4)] ml-auto flex-shrink-0">{timeAgo(post.created_date)}</span>
        </div>
        <p className="text-xs text-[rgba(var(--text),0.8)] leading-relaxed line-clamp-2">{post.content}</p>
        {totalReactions > 0 && (
          <div className="flex items-center gap-2 mt-1">
            {(reactions.support || 0) > 0 && <span className="text-[10px] text-[rgba(var(--muted),0.5)] flex items-center gap-0.5"><Heart size={9} /> {reactions.support}</span>}
            {(reactions.relate || 0) > 0 && <span className="text-[10px] text-[rgba(var(--muted),0.5)] flex items-center gap-0.5"><RefreshCw size={9} /> {reactions.relate}</span>}
            {(reactions.helpful || 0) > 0 && <span className="text-[10px] text-[rgba(var(--muted),0.5)] flex items-center gap-0.5"><Lightbulb size={9} /> {reactions.helpful}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommunityWidget({ xp = 0, trades = [], onNavigate }) {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const stage = getStage(xp);
  const stageRoomKey = STAGE_KEY_MAP[stage.level] || "beginner";

  // Infer most-relevant challenge room from recent trades
  const challengeRoomKey = (() => {
    const recent = trades.slice(0, 10);
    const fomoCount     = recent.filter(t => t.pre_emotion === "fomo" || t.pre_emotion === "excited").length;
    const revengeCount  = recent.filter(t => t.pre_emotion === "angry" && t.outcome === "loss").length;
    const fearCount     = recent.filter(t => t.pre_emotion === "anxious" || t.pre_emotion === "tired").length;
    const disciplineCount = recent.filter(t => t.followed_rules === "no").length;
    const overtradeCount  = recent.filter(t => t.outcome === "loss").length;

    const scores = { fomo: fomoCount, revenge_trading: revengeCount, fear: fearCount, discipline: disciplineCount, overtrading: overtradeCount };
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "discipline";
  })();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [stagePosts, challengePosts] = await Promise.all([
        base44.entities.CommunityPost.filter({ room_key: stageRoomKey }, "-created_date", 4),
        base44.entities.CommunityPost.filter({ room_key: challengeRoomKey }, "-created_date", 3),
      ]);
      // Merge, dedupe, sort by date
      const merged = [...stagePosts, ...challengePosts]
        .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 6);
      setPosts(merged);
      setLoading(false);
    }
    load();
  }, [stageRoomKey, challengeRoomKey]);

  const newCount = posts.filter(p => isNew(p.created_date)).length;
  const stageMeta = STAGE_META[stageRoomKey];
  const challengeMeta = CHALLENGE_META[challengeRoomKey];

  return (
    <div className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={15} className="opacity-60" />
          <div className="font-semibold text-sm">Community</div>
          {newCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(104,155,251,0.2)", color: "rgba(104,155,251,0.95)", border: "1px solid rgba(104,155,251,0.3)" }}>
              {newCount} new
            </span>
          )}
        </div>
        <motion.button onClick={() => onNavigate?.("community")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="pill cursor-pointer text-xs flex items-center gap-1">
          View All <ArrowRight size={10} />
        </motion.button>
      </div>

      {/* Active rooms */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: stageMeta?.color?.replace("0.9","0.1"), border: `1px solid ${stageMeta?.color?.replace("0.9","0.25")}`, color: stageMeta?.color }}>
          {stageMeta?.emoji} {stageMeta?.label}
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: challengeMeta?.color?.replace("0.9","0.1"), border: `1px solid ${challengeMeta?.color?.replace("0.9","0.25")}`, color: challengeMeta?.color }}>
          {challengeMeta?.emoji} {challengeMeta?.label}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 bg-white/10 rounded-full w-1/3" />
                <div className="h-2 bg-white/10 rounded-full w-full" />
                <div className="h-2 bg-white/10 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-6 text-[rgba(var(--muted),0.5)] text-xs">
          <MessageCircle size={24} className="mx-auto mb-2 opacity-30" />
          No posts yet — be the first to share in your rooms.
          <motion.button onClick={() => onNavigate?.("community")} whileTap={{ scale: 0.96 }}
            className="block mx-auto mt-3 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
            style={{ background: "rgba(104,155,251,0.15)", border: "1px solid rgba(104,155,251,0.3)", color: "rgba(104,155,251,0.9)" }}>
            Open Community →
          </motion.button>
        </div>
      ) : (
        <div>
          {posts.map((post, i) => {
            const meta = STAGE_META[post.room_key] || CHALLENGE_META[post.room_key];
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PostRow post={post} roomMeta={meta} isNewPost={isNew(post.created_date)} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}