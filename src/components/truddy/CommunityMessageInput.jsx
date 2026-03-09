import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CommunityMessageInput({ mode, selectedIssue, userLevel, onMessageSent }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSendMessage() {
    if (!content.trim()) return;
    
    setSending(true);
    try {
      const roomKey = mode === "level" ? "level" : "issue";
      const issueType = mode === "level" ? null : selectedIssue;
      
      await base44.entities.CommunityPost.create({
        room_key: roomKey,
        issue_type: issueType,
        content: content.trim(),
      });
      
      setContent("");
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Could not send message. Please try again.");
    }
    setSending(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[16px] p-4"
    >
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts with the community..."
          className="flex-1 bg-transparent text-sm border border-white/20 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:border-white/40 resize-none"
          rows="3"
        />
        <motion.button
          onClick={handleSendMessage}
          disabled={sending || !content.trim()}
          whileTap={{ scale: 0.96 }}
          className="btn-primary text-sm flex-shrink-0 self-end"
        >
          <Send size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}