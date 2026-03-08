import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";
import LiveSessionRecorder from "@/components/truddy/session/LiveSessionRecorder";
import { format, formatDistanceStrict } from "date-fns";

const emotionScore = { confident: 9, focused: 8, excited: 7, neutral: 5, tired: 4, anxious: 3, fomo: 2, angry: 1 };

function ScorePill({ score }) {
  const color = score >= 7 ? "rgba(72,199,142,0.9)" : score >= 5 ? "rgba(255,180,80,0.9)" : "rgba(255,100,80,0.9)";
  const bg = score >= 7 ? "rgba(72,199,142,0.12)" : score >= 5 ? "rgba(255,180,80,0.12)" : "rgba(255,100,80,0.12)";
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color, background: bg, border: `1px solid ${color}` }}>
      {score.toFixed(1)} / 10
    </span>
  );
}

export default function SessionPage() {
  const [view, setView] = useState("idle"); // idle | active | report | generating
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await base44.entities.TradingSession.list("-created_date", 20);
    setSessions(data);
    const active = data.find(s => s.status === "active");
    if (active) { setCurrentSession(active); setView("active"); }
    setLoading(false);
  };

  const startSession = async () => {
    const session = await base44.entities.TradingSession.create({
      started_at: new Date().toISOString(),
      status: "active",
      entries: [],
    });
    setCurrentSession(session);
    setSessions(prev => [session, ...prev]);
    setView("active");
  };

  const addEntry = async (text) => {
    setLoadingEntry(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A trader just said during a live session: "${text}". 
Detect their emotion and provide a short 1-2 sentence coaching response.
Return JSON with: emotion (one of: focused, confident, anxious, neutral, fomo, angry, excited, tired) and ai_response.`,
      response_json_schema: {
        type: "object",
        properties: {
          emotion: { type: "string" },
          ai_response: { type: "string" }
        }
      }
    });

    const newEntry = {
      timestamp: new Date().toISOString(),
      text,
      emotion: result.emotion || "neutral",
      ai_response: result.ai_response || "",
      annotation: ""
    };

    const updatedEntries = [...(currentSession.entries || []), newEntry];
    await base44.entities.TradingSession.update(currentSession.id, { entries: updatedEntries });
    const updated = { ...currentSession, entries: updatedEntries };
    setCurrentSession(updated);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updated : s));
    setLoadingEntry(false);
  };

  const endSession = async () => {
    setView("generating");
    const entries = currentSession.entries || [];

    let summary = "Session completed with no entries.", patterns = [], recommendations = [], overall_score = 5;

    if (entries.length > 0) {
      const transcript = entries.map(e =>
        `[${format(new Date(e.timestamp), "HH:mm:ss")}] ${e.emotion?.toUpperCase()}: "${e.text}"`
      ).join("\n");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this live trading session transcript for psychological performance.

Transcript:
${transcript}

Return JSON with:
- summary: 2-3 sentences describing the emotional arc and overall psychological state
- patterns: 2-4 behavioral patterns observed (e.g. "Rising anxiety after drawdown periods")
- recommendations: 2-4 specific, actionable improvements for next session
- overall_score: integer 1-10 for psychological discipline`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            overall_score: { type: "number" }
          }
        }
      });

      summary = result.summary || summary;
      patterns = result.patterns || [];
      recommendations = result.recommendations || [];
      overall_score = result.overall_score || 5;
    }

    const updates = { ended_at: new Date().toISOString(), status: "completed", summary, patterns, recommendations, overall_score };
    await base44.entities.TradingSession.update(currentSession.id, updates);
    const updated = { ...currentSession, ...updates };
    setCurrentSession(updated);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updated : s));
    setView("report");
  };

  const updateAnnotation = async (entryIndex, annotation) => {
    const updatedEntries = (currentSession.entries || []).map((e, i) =>
      i === entryIndex ? { ...e, annotation } : e
    );
    await base44.entities.TradingSession.update(currentSession.id, { entries: updatedEntries });
    const updated = { ...currentSession, entries: updatedEntries };
    setCurrentSession(updated);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updated : s));
  };

  const viewSession = (session) => {
    setCurrentSession(session);
    setView(session.status === "active" ? "active" : "report");
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
      {(view === "active" || view === "report" || view === "generating") && (
        <div className="flex items-center gap-3">
          <motion.button onClick={() => { setView("idle"); setCurrentSession(null); }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <ArrowLeft size={15} /> Sessions
          </motion.button>
          {currentSession?.started_at && (
            <span className="text-xs opacity-40">
              {format(new Date(currentSession.started_at), "MMM d, yyyy · HH:mm")}
            </span>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <SectionHeader title="Live Session Tracker" subtitle="Record your thoughts in real-time. AI analyzes emotion, detects patterns, and coaches you live." />

            {/* Start Button */}
            <motion.button onClick={startSession} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-6 py-5 rounded-[22px] mb-6 cursor-pointer"
              style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.15))", border: "1px solid rgba(104,155,251,0.4)", boxShadow: "0 8px 32px rgba(104,155,251,0.18)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg, rgba(104,155,251,1), rgba(121,113,249,1))", boxShadow: "0 6px 20px rgba(104,155,251,0.4)" }}>
                  <Play size={20} className="text-white" fill="white" />
                </div>
                <div>
                  <div className="font-bold text-base">Start New Session</div>
                  <div className="text-sm opacity-55">Voice or text — live emotion tracking & AI coaching</div>
                </div>
              </div>
              <ChevronRight size={20} className="opacity-40" />
            </motion.button>

            {/* Past Sessions */}
            {completedSessions.length > 0 && (
              <div>
                <div className="text-xs font-semibold opacity-45 uppercase tracking-wide mb-3">Past Sessions</div>
                <div className="flex flex-col gap-2">
                  {completedSessions.map((s, i) => (
                    <motion.button key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => viewSession(s)} whileHover={{ x: 3 }} whileTap={{ scale: 0.99 }}
                      className="flex items-center justify-between px-5 py-4 rounded-[18px] cursor-pointer text-left w-full"
                      style={{ background: "rgba(var(--glass),0.32)", border: "1px solid rgba(255,255,255,0.28)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full grid place-items-center text-sm" style={{ background: "rgba(var(--glass),0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>
                          🧠
                        </div>
                        <div>
                          <div className="text-sm font-medium">{format(new Date(s.started_at), "MMM d, yyyy")}</div>
                          <div className="text-xs opacity-45 mt-0.5">
                            {s.entries?.length || 0} entries ·{" "}
                            {s.ended_at ? formatDistanceStrict(new Date(s.started_at), new Date(s.ended_at)) : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.overall_score > 0 && <ScorePill score={s.overall_score} />}
                        <ChevronRight size={15} className="opacity-30" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {completedSessions.length === 0 && (
              <div className="text-center py-12 opacity-35 text-sm">No sessions yet. Start your first one above.</div>
            )}
          </motion.div>
        )}

        {view === "active" && currentSession && (
          <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ActiveSession session={currentSession} onAddEntry={addEntry} onEndSession={endSession} loadingEntry={loadingEntry} />
          </motion.div>
        )}

        {view === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-t-transparent" style={{ borderColor: "rgba(104,155,251,0.6)", borderTopColor: "transparent" }} />
            <div className="text-sm opacity-60 text-center">
              <div className="font-semibold mb-1">Analyzing your session...</div>
              <div className="opacity-70">Detecting patterns, generating insights & recommendations</div>
            </div>
          </motion.div>
        )}

        {view === "report" && currentSession && (
          <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <SessionReport session={currentSession} onUpdateAnnotation={updateAnnotation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}