import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Clock, Brain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";
import LiveSessionRecorder from "@/components/truddy/session/LiveSessionRecorder";
import PastSessionCard from "@/components/truddy/session/PastSessionCard";
import { formatDistanceToNow } from "date-fns";

export default function SessionPage() {
  const [showRecorder, setShowRecorder] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
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

  const handleDeleteSession = async (sessionId) => {
    await base44.entities.TradingSession.delete(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 opacity-40">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading sessions...</span>
      </div>
    );
  }

  const completedSessions = sessions.filter(s => s.status === "completed");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Live Trading Analyzer"
        subtitle="Speak freely — your emotions, urges, and thoughts. All of it matters."
      />

      {/* Hero Start Button */}
      <motion.button
        onClick={() => setShowRecorder(true)}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full relative overflow-hidden rounded-[24px] px-6 py-7 flex items-center gap-5 text-left"
        style={{
          background: "linear-gradient(135deg, rgba(104,155,251,0.18) 0%, rgba(121,113,249,0.12) 100%)",
          border: "1px solid rgba(104,155,251,0.35)",
          boxShadow: "0 12px 40px rgba(104,155,251,0.14)",
        }}
      >
        {/* Glowing mic icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(104,155,251,1), rgba(121,113,249,1))",
            boxShadow: "0 8px 28px rgba(104,155,251,0.45)",
          }}
        >
          <Mic size={24} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-base tracking-tight" style={{ color: "rgb(var(--text))" }}>
            Start Live Analysis
          </div>
          <div className="text-sm mt-0.5 opacity-50 leading-snug">
            Talk through your setup, emotions, and doubts in real time
          </div>
        </div>

        {/* Decorative pulse rings */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(104,155,251,0.15)", border: "1px solid rgba(104,155,251,0.3)" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-1 rounded-full"
            style={{ background: "rgba(104,155,251,0.25)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </motion.button>

      {/* Stats row */}
      {completedSessions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Sessions count */}
          <div
            className="rounded-2xl px-4 py-4 flex flex-col gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(104,155,251,0.12) 0%, rgba(121,113,249,0.08) 100%)",
              border: "1px solid rgba(104,155,251,0.25)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl grid place-items-center"
              style={{ background: "rgba(104,155,251,0.18)", border: "1px solid rgba(104,155,251,0.3)" }}
            >
              <Brain size={15} style={{ color: "rgba(104,155,251,1)" }} />
            </div>
            <div>
              <div className="font-black text-2xl leading-none tracking-tight" style={{ color: "rgba(104,155,251,1)" }}>
                {completedSessions.length}
              </div>
              <div className="text-[11px] font-medium text-gray-400 mt-1">Sessions analyzed</div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full" style={{ background: "rgba(104,155,251,0.08)" }} />
          </div>

          {/* Avg score */}
          {(() => {
            const scored = completedSessions.filter(s => s.overall_score != null);
            const avg = scored.length ? Math.round(scored.reduce((acc, s) => acc + Number(s.overall_score), 0) / scored.length) : null;
            const avgColor = avg === null ? "#888" : avg >= 7 ? "rgba(26,158,100,1)" : avg >= 4 ? "rgba(176,138,0,1)" : "rgba(200,60,40,1)";
            const avgBg    = avg === null ? "rgba(120,120,120,0.08)" : avg >= 7 ? "rgba(26,158,100,0.1)" : avg >= 4 ? "rgba(176,138,0,0.1)" : "rgba(200,60,40,0.1)";
            const avgBorder= avg === null ? "rgba(120,120,120,0.18)" : avg >= 7 ? "rgba(26,158,100,0.22)" : avg >= 4 ? "rgba(176,138,0,0.22)" : "rgba(200,60,40,0.22)";
            return (
              <div
                className="rounded-2xl px-4 py-4 flex flex-col gap-2 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${avgBg} 0%, transparent 100%)`, border: `1px solid ${avgBorder}` }}
              >
                <div className="w-8 h-8 rounded-xl grid place-items-center" style={{ background: avgBg, border: `1px solid ${avgBorder}` }}>
                  <Brain size={15} style={{ color: avgColor }} />
                </div>
                <div>
                  <div className="font-black text-2xl leading-none tracking-tight" style={{ color: avgColor }}>
                    {avg ?? "—"}<span className="text-sm font-semibold opacity-50">/10</span>
                  </div>
                  <div className="text-[11px] font-medium text-gray-400 mt-1">Avg psych score</div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full" style={{ background: avgBg }} />
              </div>
            );
          })()}
        </div>
      )}

      {/* Past Sessions */}
      {completedSessions.length > 0 ? (
        <div>
          <div className="text-[11px] font-semibold opacity-40 uppercase tracking-widest mb-3 px-1">
            Past Recordings
          </div>
          <div className="flex flex-col gap-2">
            {completedSessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PastSessionCard
                  session={s}
                  isExpanded={expandedId === s.id}
                  onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  onDelete={handleDeleteSession}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14 flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl grid place-items-center opacity-20"
            style={{ background: "rgba(var(--glass),0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Mic size={22} />
          </div>
          <div className="text-sm opacity-35">No recordings yet.<br />Start your first session above.</div>
        </motion.div>
      )}

      <AnimatePresence>
        {showRecorder && (
          <LiveSessionRecorder
            onClose={(newSession) => {
              setShowRecorder(false);
              if (newSession) {
                setSessions((prev) => [newSession, ...prev]);
                setExpandedId(newSession.id);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}