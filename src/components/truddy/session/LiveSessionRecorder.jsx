import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square, X, Loader2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const PROMPTS = [
  "What's going through your mind right now?",
  "Any urges you're feeling? Say them out loud.",
  "What does your gut say about this setup?",
  "Are you feeling any fear or hesitation?",
  "What would you regret NOT saying right now?",
  "Describe the market as you see it — no filter.",
  "Are you chasing? Be honest with yourself.",
  "What emotion is driving you most right now?",
  "Is this trade FOMO, or conviction?",
  "Talk through your entry criteria out loud.",
  "What's your body telling you right now?",
  "If your best trading self could speak — what would they say?",
];

const PHASES = [
  { label: "Pre-Trade",   color: "rgba(104,155,251,1)", bg: "rgba(104,155,251,0.13)", border: "rgba(104,155,251,0.32)" },
  { label: "Waiting",     color: "rgba(232,200,74,1)",  bg: "rgba(232,200,74,0.11)",  border: "rgba(232,200,74,0.32)"  },
  { label: "Filled",      color: "rgba(80,220,160,1)",  bg: "rgba(80,220,160,0.11)",  border: "rgba(80,220,160,0.3)"   },
  { label: "In Trade",    color: "rgba(255,120,90,1)",  bg: "rgba(255,120,90,0.13)",  border: "rgba(255,120,90,0.35)"  },
  { label: "Exit/Review", color: "rgba(180,160,255,1)", bg: "rgba(160,120,255,0.11)", border: "rgba(160,120,255,0.3)"  },
];

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── Speech Recognition factory (works on iOS Safari via webkit prefix) ─────
function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const sr = new SR();
  sr.continuous = true;
  sr.interimResults = true;
  sr.lang = "en-US";
  return sr;
}

export default function LiveSessionRecorder({ onClose }) {
  const srRef        = useRef(null);
  const timerRef     = useRef(null);
  const promptTimerRef = useRef(null);
  const elapsedRef   = useRef(0);
  const finalTextRef = useRef(""); // accumulates final segments between restarts

  const [phase, setPhase] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);

  // Live transcript shown during recording
  const [interimText, setInterimText] = useState("");

  // Post-recording states
  const [pendingTranscript, setPendingTranscript] = useState(null);
  const [pendingElapsed, setPendingElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [error, setError] = useState("");

  const speechAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      stopTimers();
      srRef.current?.stop();
    };
  }, []);

  // Prompt rotation while recording
  useEffect(() => {
    if (isRecording) {
      promptTimerRef.current = setInterval(() => {
        setPromptVisible(false);
        setTimeout(() => {
          setPromptIdx((p) => (p + 1) % PROMPTS.length);
          setPromptVisible(true);
        }, 350);
      }, 8000);
    }
    return () => clearInterval(promptTimerRef.current);
  }, [isRecording]);

  function stopTimers() {
    clearInterval(timerRef.current);
    clearInterval(promptTimerRef.current);
  }

  function startRecording() {
    if (!speechAvailable) {
      setError("Speech recognition is not supported on this browser. Please use Safari on iOS or Chrome on Android/Desktop.");
      return;
    }

    setError("");
    finalTextRef.current = "";
    setInterimText("");

    const sr = getSpeechRecognition();
    srRef.current = sr;

    sr.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTextRef.current += text + " ";
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
    };

    // iOS stops recognition after silence — restart automatically while recording
    sr.onend = () => {
      if (isRecordingRef.current) {
        try { srRef.current?.start(); } catch {}
      }
    };

    sr.onerror = (e) => {
      // "no-speech" is normal, just restart
      if (e.error === "no-speech" && isRecordingRef.current) {
        try { srRef.current?.start(); } catch {}
      }
    };

    sr.start();

    elapsedRef.current = 0;
    setElapsed(0);
    setIsRecording(true);
    isRecordingRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed((p) => p + 1);
    }, 1000);
  }

  // We need a ref to track recording state inside sr.onend closure
  const isRecordingRef = useRef(false);

  function stopRecording() {
    isRecordingRef.current = false;
    stopTimers();
    setIsRecording(false);
    srRef.current?.stop();
    srRef.current = null;

    const capturedTranscript = finalTextRef.current.trim();
    const capturedElapsed    = elapsedRef.current;

    if (!capturedTranscript) {
      setError("No speech was detected. Please try again and speak clearly into your microphone.");
      return;
    }

    setPendingTranscript(capturedTranscript);
    setPendingElapsed(capturedElapsed);
    setInterimText("");
  }

  async function analyze() {
    if (!pendingTranscript) return;
    setAnalyzing(true);
    setError("");

    try {
      setAnalyzeStep("Analyzing psychology...");
      const analyzeRes = await base44.functions.invoke("analyzeSessionPsychology", {
        transcript: pendingTranscript,
        elapsed: String(pendingElapsed),
        sessionTitle: title.trim(),
        normalizedFileUrl: "",
      });
      if (analyzeRes.data?.error) throw new Error(analyzeRes.data.error);
      onClose(analyzeRes?.data || analyzeRes);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.data?.error || err?.message || "Analysis failed. Please try again.";
      setError(msg);
      setAnalyzing(false);
      setAnalyzeStep("");
    }
  }

  const currentPhase = PHASES[phase];
  const hasPending   = pendingTranscript !== null;
  const liveText     = finalTextRef.current + interimText;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(12,12,14,0.97)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <div className="text-base font-bold text-white">Live Session</div>
          <div className="text-[11px] text-white/40 mt-0.5">Speak freely — no filter, no judgment</div>
        </div>
        <button
          onClick={() => !analyzing && onClose(null)}
          className="w-9 h-9 rounded-full grid place-items-center bg-white/8 hover:bg-white/15 transition-colors"
        >
          <X size={16} className="text-white/60" />
        </button>
      </div>

      {/* Phase Selector */}
      <div className="px-5 pb-4 flex-shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">Where are you?</div>
        <div className="flex gap-1.5 flex-wrap">
          {PHASES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => !isRecording && setPhase(i)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
              style={{
                background:  phase === i ? p.bg  : "rgba(255,255,255,0.05)",
                border:      `1px solid ${phase === i ? p.border : "rgba(255,255,255,0.08)"}`,
                color:       phase === i ? p.color : "rgba(255,255,255,0.3)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="px-5 flex-shrink-0 min-h-[60px]">
        <AnimatePresence mode="wait">
          {promptVisible && (
            <motion.div
              key={promptIdx + (isRecording ? "r" : "i")}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="rounded-[14px] px-4 py-3 text-sm font-medium leading-snug"
              style={{ background: currentPhase.bg, border: `1px solid ${currentPhase.border}`, color: currentPhase.color }}
            >
              {isRecording ? PROMPTS[promptIdx] : "Ready when you are — tap the mic to begin"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live transcript */}
      <div className="flex-1 px-5 pt-3 overflow-y-auto">
        {isRecording && liveText ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[14px] px-4 py-3 text-sm leading-relaxed text-white/60"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {liveText}
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-white/40 animate-pulse rounded-sm" />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full">
            {!hasPending && (
              <div className="flex flex-col items-center gap-5">
                {/* Timer */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-sm font-mono"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-red-400"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <span className="text-white/50">Recording</span>
                      <span className="text-white font-bold">{formatTime(elapsed)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mic button */}
                <motion.button
                  onTouchEnd={(e) => { e.preventDefault(); isRecording ? stopRecording() : startRecording(); }}
                  onClick={() => { isRecording ? stopRecording() : startRecording(); }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    isRecording
                      ? { boxShadow: ["0 0 0px rgba(255,80,80,0)", "0 0 48px rgba(255,80,80,0.5)", "0 0 0px rgba(255,80,80,0)"] }
                      : {}
                  }
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: isRecording
                      ? "linear-gradient(135deg, rgba(255,80,80,0.22), rgba(255,120,90,0.22))"
                      : `linear-gradient(135deg, ${currentPhase.bg}, rgba(255,255,255,0.04))`,
                    border: `2px solid ${isRecording ? "rgba(255,80,80,0.6)" : currentPhase.border}`,
                  }}
                >
                  {isRecording
                    ? <Square size={36} className="text-red-400" />
                    : <Mic size={36} style={{ color: currentPhase.color }} />
                  }
                </motion.button>

                <div className="text-xs text-white/25 text-center">
                  {isRecording ? "Tap the square to stop" : "Tap the mic to start"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timer overlay when live transcript is showing */}
        {isRecording && liveText && (
          <div className="flex items-center gap-2 mt-3 text-xs font-mono justify-center">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-400"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-white/40">{formatTime(elapsed)}</span>
            <button
              onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
              onClick={stopRecording}
              className="ml-2 px-3 py-1 rounded-full text-xs text-red-300 border border-red-400/30 bg-red-400/10"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Post-recording: title + analyze */}
      <AnimatePresence>
        {hasPending && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="px-5 pb-6 space-y-3 flex-shrink-0"
          >
            {/* Transcript preview */}
            <div
              className="rounded-[14px] px-4 py-3 text-xs leading-relaxed text-white/50 max-h-24 overflow-y-auto"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {pendingTranscript}
            </div>

            <div className="text-xs text-white/40 uppercase tracking-widest font-semibold text-center">
              {formatTime(pendingElapsed)} captured
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. NQ Pre-Market ${format(new Date(), "MMM d")}`}
              className="w-full rounded-[14px] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />

            <button
              onClick={analyze}
              disabled={analyzing}
              className="w-full rounded-[14px] py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(104,155,251,0.25), rgba(121,113,249,0.2))",
                border:     "1px solid rgba(104,155,251,0.4)",
                color:      "rgba(140,190,255,1)",
              }}
            >
              {analyzing ? (
                <><Loader2 size={15} className="animate-spin" />{analyzeStep || "Processing..."}</>
              ) : (
                <>Analyze Session<ChevronRight size={15} /></>
              )}
            </button>

            <button
              onClick={() => { setPendingTranscript(null); setError(""); }}
              disabled={analyzing}
              className="w-full rounded-[14px] py-2.5 text-sm text-white/35 hover:text-white/60 transition-colors disabled:opacity-30"
            >
              Discard & Record Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-5 mb-4 rounded-[12px] px-4 py-3 text-xs leading-relaxed flex-shrink-0"
            style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", color: "rgba(255,160,150,1)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}