import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";
import LiveSessionRecorder from "@/components/truddy/session/LiveSessionRecorder";
import { format, formatDistanceStrict } from "date-fns";



export default function SessionPage() {
  const [showRecorder, setShowRecorder] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await base44.entities.TradingSession.list("-created_date", 20);
    setSessions(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 opacity-50">
        <Loader2 size={18} className="animate-spin" /> Loading sessions...
      </div>
    );
  }

  const completedSessions = sessions.filter(s => s.status === "completed");

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Live Session Recorder" subtitle="Record and transcribe your voice sessions instantly with AI-powered transcription." />

      {/* Start Button */}
      <motion.button
        onClick={() => setShowRecorder(true)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-between px-6 py-5 rounded-[22px] mb-6 cursor-pointer"
        style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.15))", border: "1px solid rgba(104,155,251,0.4)", boxShadow: "0 8px 32px rgba(104,155,251,0.18)" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg, rgba(104,155,251,1), rgba(121,113,249,1))", boxShadow: "0 6px 20px rgba(104,155,251,0.4)" }}>
            <Play size={20} className="text-white" fill="white" />
          </div>
          <div>
            <div className="font-bold text-base">Start New Recording</div>
            <div className="text-sm opacity-55">Record audio and get instant transcription</div>
          </div>
        </div>
        <ChevronRight size={20} className="opacity-40" />
      </motion.button>

      {/* Past Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <div className="text-xs font-semibold opacity-45 uppercase tracking-wide mb-3">Past Recordings</div>
          <div className="flex flex-col gap-2">
            {completedSessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start justify-between px-5 py-4 rounded-[18px] text-left w-full"
                style={{ background: "rgba(var(--glass),0.32)", border: "1px solid rgba(255,255,255,0.28)" }}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full grid place-items-center text-sm flex-shrink-0" style={{ background: "rgba(var(--glass),0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    🎙️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{format(new Date(s.started_at), "MMM d, yyyy")}</div>
                    {s.full_transcript && (
                      <p className="text-xs opacity-60 mt-1 line-clamp-2">{s.full_transcript}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {completedSessions.length === 0 && (
        <div className="text-center py-12 opacity-35 text-sm">No recordings yet. Start your first one above.</div>
      )}

      <AnimatePresence>
        {showRecorder && (
          <LiveSessionRecorder onClose={() => setShowRecorder(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}