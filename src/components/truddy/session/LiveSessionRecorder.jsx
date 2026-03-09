import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Clock } from "lucide-react";
import PastSessionCard from "@/components/truddy/session/PastSessionCard";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

const PROMPTS = [
  "What's going through your mind right now?",
  "Any urges you're feeling? Say them out loud.",
  "What does your gut say about this setup?",
  "Are you feeling any fear or hesitation?",
  "What would you regret NOT saying right now?",
  "Describe the market as you see it — no filter.",
  "Are you chasing? Be honest with yourself.",
  "What emotion is driving you most right now?",
  "Is this trade fear-of-missing-out, or conviction?",
  "Talk through your entry criteria out loud.",
  "What's your body telling you right now?",
  "If your best trading self could speak — what would they say?",
];

const PHASES = [
  { label: "Pre-Trade", color: "rgba(104,155,251,0.9)", bg: "rgba(104,155,251,0.12)", border: "rgba(104,155,251,0.3)" },
  { label: "Waiting Entry", color: "rgba(232,200,74,0.9)", bg: "rgba(232,200,74,0.1)", border: "rgba(232,200,74,0.3)" },
  { label: "Filled", color: "rgba(80,220,160,0.9)", bg: "rgba(80,220,160,0.1)", border: "rgba(80,220,160,0.3)" },
  { label: "In Trade", color: "rgba(255,120,90,0.9)", bg: "rgba(255,120,90,0.12)", border: "rgba(255,120,90,0.35)" },
  { label: "Exit / Review", color: "rgba(180,160,255,0.9)", bg: "rgba(160,120,255,0.1)", border: "rgba(160,120,255,0.3)" },
];


export default function LiveSessionRecorder({ onClose }) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const promptTimerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const handleDeleteSession = async (sessionId) => {
    await base44.entities.TradingSession.delete(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (expandedId === sessionId) setExpandedId(null);
  };
  const [activePhase, setActivePhase] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);

  useEffect(() => {
    base44.entities.TradingSession.list("-created_date", 20).then(setSessions);
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      promptTimerRef.current = setInterval(() => {
        setPromptVisible(false);
        setTimeout(() => {
          setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
          setPromptVisible(true);
        }, 400);
      }, 8000);
    }
    return () => clearInterval(promptTimerRef.current);
  }, [isRecording, isPaused]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getSupportedMimeType = () => {
    const types = ["audio/mp4", "audio/ogg;codecs=opus", "audio/ogg", "audio/webm;codecs=opus", "audio/webm"];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => stream.getTracks().forEach((t) => t.stop());
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setElapsed(0);
      setTranscript("");
    } catch {
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setIsPaused(false);
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      const mimeType = mediaRecorderRef.current.mimeType || "audio/webm";
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setShowTitleInput(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      await processRecording(audioBlob, mimeType);
    }
  };

  const processRecording = async (audioBlob, mimeType = "audio/webm") => {
    setIsTranscribing(true);
    
    try {
      const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("ogg") ? "ogg" : "webm";
      const file = new File([audioBlob], `session.${ext}`, { type: mimeType });

      const transcriptText = await base44.integrations.Core.InvokeLLM({
        prompt: "Transcribe the following audio file. Return only the transcribed text, nothing else.",
        file_urls: [file],
        model: "gemini_3_flash",
      });

      setTranscript(transcriptText);

      // Send to backend function for analysis and session creation
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('transcript', transcriptText);
      formData.append('elapsed', elapsed.toString());
      formData.append('sessionTitle', sessionTitle);

      const response = await base44.functions.invoke('transcribeAudio', {
        audio: file,
        transcript: transcriptText,
        elapsed,
        sessionTitle,
      });

      const newSession = response.data;
      setSessions((prev) => [newSession, ...prev]);
      setExpandedId(newSession.id);
      setIsTranscribing(false);
      setShowTitleInput(false);
    } catch (error) {
      console.error('Error processing recording:', error);
      setIsTranscribing(false);
      alert('Error processing recording. Please try again.');
    }
  };

  const phase = PHASES[activePhase];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-strong rounded-[28px] max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Top bar */}
        <div
          className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <div className="text-sm font-semibold text-[#faf9f6]">Live Trading Analyzer</div>
            <div className="text-[11px] text-[#faf9f6] mt-0.5 font-light tracking-wide opacity-60">
              Speak freely — no filter, no judgment
            </div>
          </div>
          <button onClick={onClose} className="text-2xl opacity-40 hover:opacity-80 transition-opacity leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Phase selector */}
          <div className="space-y-2">
            <div className="text-[11px] text-[#faf9f6] font-light uppercase tracking-wider opacity-70">
              Where are you in the trade?
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PHASES.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setActivePhase(i)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: activePhase === i ? p.bg : "rgba(var(--glass),0.2)",
                    border: `1px solid ${activePhase === i ? p.border : "rgba(255,255,255,0.1)"}`,
                    color: activePhase === i ? p.color : "rgba(200,200,200,0.4)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <AnimatePresence mode="wait">
            {promptVisible && (
              <motion.div
                key={promptIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="rounded-[16px] px-4 py-3 text-sm font-medium leading-snug"
                style={{ background: phase.bg, border: `1px solid ${phase.border}`, color: phase.color }}
              >
                {isRecording ? `💬 ${PROMPTS[promptIdx]}` : `🎙 Ready when you are — tap the mic to begin`}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title input (after recording stops, before saving) */}
          <AnimatePresence>
            {showTitleInput && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <div className="text-[11px] text-[#faf9f6] opacity-50 uppercase tracking-wider">Name this session (optional)</div>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder={`e.g. NQ Pre-Market ${format(new Date(), "MMM d")}`}
                  className="w-full rounded-[12px] px-3 py-2 text-sm text-[#faf9f6] outline-none placeholder:opacity-30"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main mic area */}
          <div className="flex flex-col items-center gap-4 py-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-sm font-mono">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: isPaused ? "rgba(255,200,50,0.8)" : "rgba(255,80,80,0.9)" }}
                  animate={!isPaused ? { opacity: [1, 0.2, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="opacity-70">{isPaused ? "Paused" : "Recording"}</span>
                <span className="font-bold opacity-90">{formatTime(elapsed)}</span>
              </div>
            )}

            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              whileTap={{ scale: 0.93 }}
              animate={
                isRecording && !isPaused
                  ? { boxShadow: ["0 0 0px rgba(255,80,80,0)", "0 0 32px rgba(255,80,80,0.4)", "0 0 0px rgba(255,80,80,0)"] }
                  : {}
              }
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-40 transition-all"
              style={{
                background: isRecording
                  ? "linear-gradient(135deg, rgba(255,80,80,0.25), rgba(255,120,90,0.25))"
                  : `linear-gradient(135deg, ${phase.bg}, rgba(var(--glass),0.2))`,
                border: `2px solid ${isRecording ? "rgba(255,80,80,0.6)" : phase.border}`,
              }}
            >
              {isRecording ? <Square size={34} className="text-red-400" /> : <Mic size={34} style={{ color: phase.color }} />}
            </motion.button>

            {isRecording && (
              <motion.button
                onClick={isPaused ? resumeRecording : pauseRecording}
                whileTap={{ scale: 0.95 }}
                className="text-xs px-4 py-1.5 rounded-full font-medium transition-all"
                style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {isPaused ? "Resume" : "Pause"}
              </motion.button>
            )}

            {!isRecording && !isTranscribing && !transcript && (
              <div className="text-center space-y-1 max-w-xs">
                <div className="text-xs text-[rgba(200,200,200,0.4)] leading-relaxed">
                  Talk through your setup, your emotions, your doubts.<br />
                  Everything you say is analyzed to help you grow.
                </div>
              </div>
            )}

            {isTranscribing && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs text-[rgba(200,200,200,0.5)]"
              >
                Analyzing your session...
              </motion.div>
            )}
          </div>

          {/* Past Sessions */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#faf9f6] font-light uppercase tracking-wider opacity-50">
                Past Sessions
              </div>
              <div className="grid grid-cols-1 gap-2">
                {sessions.map((s) => (
                  <PastSessionCard
                    key={s.id}
                    session={s}
                    isExpanded={expandedId === s.id}
                    onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}