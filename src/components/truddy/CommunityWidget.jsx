import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getStage } from "@/components/truddy/XPProgressCard";
import { MessageSquare } from "lucide-react";





export default function CommunityWidget({ onNavigate }) {
  return (
    <div className="glass rounded-[24px] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.492c-1.53-.742-3.17-1.297-4.93-1.58-.21-.037-.42.026-.583.249l-.391.77c-1.896-.289-3.773-.289-5.615 0l-.391-.77c-.163-.223-.383-.286-.583-.249-1.759.283-3.398.838-4.93 1.58-.163.097-.305.242-.373.417-2.267 3.431-2.887 6.771-2.592 10.065.039.556.588.577.748.577 1.442 0 2.84.325 4.12.93.19.11.408.044.556-.132.39-.534.777-1.098 1.125-1.681.246-.413.182-.927-.23-1.159-1.195-.65-2.322-1.44-3.297-2.388-.101-.092-.156-.23-.13-.362.005-.032.041-.064.098-.064.116 0 .228.044.312.117 2.516 2.081 5.251 3.159 8.046 3.159s5.53-1.078 8.046-3.159c.084-.073.196-.117.312-.117.057 0 .093.032.098.064.026.132-.029.27-.13.362-.975.948-2.102 1.738-3.297 2.388-.412.232-.476.746-.23 1.159.348.583.735 1.147 1.125 1.681.148.176.366.242.556.132 1.28-.605 2.678-.93 4.12-.93.16 0 .709-.021.748-.577.295-3.294-.325-6.634-2.592-10.065-.068-.175-.21-.32-.373-.417z"/>
          </svg>
          <div>
            <h3 className="font-semibold text-sm">Community</h3>
            <p className="text-[11px] text-[rgba(var(--muted),0.5)]">Join the discussion</p>
          </div>
        </div>
        <motion.button onClick={() => onNavigate?.("community")} whileHover={{ scale: 1.08, x: 2 }} whileTap={{ scale: 0.96 }}
          className="cursor-pointer text-[11px] font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5">
          Join <ArrowRight size={12} />
        </motion.button>
      </div>

      {/* Join Community CTA */}
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎯</div>
        <p className="text-[13px] font-medium mb-2">Join the Community</p>
        <p className="text-[12px] text-[rgba(var(--muted),0.5)] mb-4">Connect with traders, share insights, and grow together on Discord</p>
        <motion.button onClick={() => onNavigate?.("community")} whileTap={{ scale: 0.96 }}
          className="mx-auto px-4 py-2 rounded-lg text-[11px] font-medium cursor-pointer"
          style={{ background: "rgba(104,155,251,0.15)", color: "rgba(104,155,251,0.9)" }}>
          Go to Community
        </motion.button>
      </div>
    </div>
  );
}