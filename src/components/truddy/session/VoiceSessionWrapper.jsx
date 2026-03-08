import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VoiceSession from "./VoiceSession";

export default function VoiceSessionWrapper({ onNavigate }) {
  const [session, setSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      try {
        const newSession = await base44.entities.TradingSession.create({
          started_at: new Date().toISOString(),
          status: "active",
        });
        setSession(newSession);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    };
    initSession();
  }, []);

  const handleEndSession = async (audioChunks) => {
    if (!session) return;
    setIsProcessing(true);
    try {
      await base44.entities.TradingSession.update(session.id, {
        ended_at: new Date().toISOString(),
        status: "analyzing",
      });
      onNavigate("home");
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) return <div className="p-4 text-center opacity-50">Initializing session...</div>;

  return <VoiceSession session={session} onEndSession={handleEndSession} isProcessing={isProcessing} />;
}