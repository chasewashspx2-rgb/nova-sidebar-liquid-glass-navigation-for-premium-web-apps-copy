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
        content: content.trim()
      });

      setContent("");
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Could not send message. Please try again.");
    }
    setSending(false);
  }

  return null;
























}