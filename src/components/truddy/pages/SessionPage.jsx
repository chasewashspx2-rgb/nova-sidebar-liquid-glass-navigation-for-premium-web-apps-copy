import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Brain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";
import LiveSessionRecorder from "@/components/truddy/session/LiveSessionRecorder";
import PastSessionCard from "@/components/truddy/session/PastSessionCard";


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
        whileHover={{ scale: 1.012, y: -3 }}
        whileTap={{ scale: 0.975 }}
        className="w-full relative overflow-hidden rounded-[28px] text-left"
        style={{
          background: "linear-gradient(145deg, #0d0d14 0%, #111120 60%, #0e0e1c 100%)",
          border: "1px solid rgba(104,155,251,0.28)",
          boxShadow: "0 20px 60px rgba(104,155,251,0.18), 0 0 0 1px rgba(104,155,251,0.08) inset",
        }}
      >
        {/* Background glow blob */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(121,113,249,0.22) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(104,155,251,0.14) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 px-6 pt-6 pb-5 flex flex-col gap-5">
          {/* Top row: label + pulse */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: "rgba(104,155,251,0.12)", color: "rgba(104,155,251,0.8)", border: "1px solid rgba(104,155,251,0.22)" }}
            >
              Live Session
            </span>
            {/* Animated pulse indicator */}
            <div className="flex items-center gap-1.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-red-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="text-[10px] text-white/25 font-medium">Ready</span>
            </div>
          </div>

          {/* Mic icon + title */}
          <div className="flex items-center gap-4">
            {/* Mic orb with ripple */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(104,155,251,0.2)" }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(121,113,249,0.18)" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 0.5 }}
              />
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(104,155,251,1) 0%, rgba(121,113,249,1) 100%)",
                  boxShadow: "0 8px 32px rgba(104,155,251,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset",
                }}
              >
                <Mic size={26} className="text-white" />
              </div>
            </div>

            <div>
              <div className="font-black text-[22px] text-white leading-tight tracking-tight">
                Start Live<br />Analysis
              </div>
              <div className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                Talk through your setup, emotions &amp; doubts
              </div>
            </div>
          </div>

          {/* Bottom CTA bar */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(104,155,251,0.08)", border: "1px solid rgba(104,155,251,0.16)" }}
          >
            <span className="text-[11px] text-white/30">Tap to begin recording</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: "rgba(104,155,251,0.7)", fontSize: 16, fontWeight: 700 }}
            >
              →
            </motion.div>
          </div>
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