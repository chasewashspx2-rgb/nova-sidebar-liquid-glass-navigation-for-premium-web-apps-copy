import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getStage } from "@/components/truddy/XPProgressCard";
import { MessageSquare } from "lucide-react";

const ROOM_META = {
  level: { label: "Your Level", emoji: "📊", color: "rgba(104,155,251,0.9)" },
  issue: { label: "Shared Issues", emoji: "🤝", color: "rgba(220,100,100,0.9)" },
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
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="px-3 py-2.5 rounded-[12px] transition-all hover:bg-white/5">
      <div className="flex items-start gap-2.5">
        {/* Room badge */}
        <div className="w-6 h-6 rounded-full grid place-items-center flex-shrink-0 text-[13px] mt-0.5"
          style={{ background: roomMeta?.color?.replace("0.9", "0.12") || "rgba(104,155,251,0.12)" }}>
          {roomMeta?.emoji || "💬"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium opacity-70">
              {roomMeta?.label}
            </span>
            {isNewPost && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(104,155,251,0.25)", color: "rgba(104,155,251,1)" }}>
                NEW
              </span>
            )}
            <span className="text-[9px] opacity-40 ml-auto flex-shrink-0">{timeAgo(post.created_date)}</span>
          </div>
          <p className="text-xs leading-relaxed text-[rgba(var(--text),0.75)] line-clamp-2">{post.content}</p>
          {totalReactions > 0 && (
            <div className="flex items-center gap-2.5 mt-1.5">
              {(reactions.support || 0) > 0 && <span className="text-[9px] opacity-50 flex items-center gap-1"><Heart size={8} /> {reactions.support}</span>}
              {(reactions.relate || 0) > 0 && <span className="text-[9px] opacity-50 flex items-center gap-1"><RefreshCw size={8} /> {reactions.relate}</span>}
              {(reactions.helpful || 0) > 0 && <span className="text-[9px] opacity-50 flex items-center gap-1"><Lightbulb size={8} /> {reactions.helpful}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityWidget({ onNavigate }) {
  const [discordMessages, setDiscordMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('getDiscordMessages', {});
        setDiscordMessages((response.data || []).slice(0, 6));
      } catch (error) {
        console.error('Error fetching Discord messages:', error);
      }
      setLoading(false);
    }
    load();
  }, []);

  const newCount = discordMessages.filter(m => isNew(m.timestamp)).length;

  return (
    <div className="glass rounded-[24px] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 mb-3 text-zinc-800 dark:text-zinc-300" />
          <div>
            <h3 className="font-semibold text-sm">Community</h3>
            <p className="text-[11px] text-[rgba(var(--muted),0.5)]">Latest discussions</p>
          </div>
          {newCount > 0 && (
            <span className="ml-2 text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: "rgba(104,155,251,0.2)", color: "rgba(104,155,251,1)" }}>
              {newCount} new
            </span>
          )}
        </div>
        <motion.button onClick={() => onNavigate?.("community")} whileHover={{ scale: 1.08, x: 2 }} whileTap={{ scale: 0.96 }}
          className="cursor-pointer text-[11px] font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5">
          View All <ArrowRight size={12} />
        </motion.button>
      </div>

      {/* Discord Messages */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex items-start gap-2.5 px-3 py-2.5">
              <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-white/10 rounded-full w-1/3" />
                <div className="h-2 bg-white/10 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : discordMessages.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={28} className="mx-auto mb-2 opacity-20" />
          <p className="text-[12px] text-[rgba(var(--muted),0.5)] mb-3">No activity yet on Discord</p>
          <motion.button onClick={() => onNavigate?.("community")} whileTap={{ scale: 0.96 }}
            className="mx-auto px-4 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
            style={{ background: "rgba(104,155,251,0.15)", color: "rgba(104,155,251,0.9)" }}>
            Go to Community
          </motion.button>
        </div>
      ) : (
        <div className="space-y-0.5">
          {discordMessages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="px-3 py-2.5 rounded-[12px] transition-all hover:bg-white/5">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full grid place-items-center flex-shrink-0 text-[13px] mt-0.5"
                  style={{ background: "rgba(88,100,184,0.12)" }}>
                  <MessageSquare size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-medium opacity-70">{msg.channel}</span>
                    <span className="text-[9px] opacity-40 ml-auto flex-shrink-0">{timeAgo(msg.timestamp)}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[rgba(var(--text),0.75)] line-clamp-2">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}