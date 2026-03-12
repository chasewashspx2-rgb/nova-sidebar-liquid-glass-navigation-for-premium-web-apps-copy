import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square, X, Loader2, ArrowRight, RotateCcw } from "lucide-react";
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
  { label: "Pre-Trade",   color: "#6B9BFB", glow: "rgba(107,155,251,0.35)" },
  { label: "Waiting",     color: "#E8C84A", glow: "rgba(232,200,74,0.3)"   },
  { label: "Filled",      color: "#50DCA0", glow: "rgba(80,220,160,0.3)"   },
  { label: "In Trade",    color: "#FF7A5A", glow: "rgba(255,122,90,0.35)"  },
  { label: "Exit/Review", color: "#B4A0FF", glow: "rgba(180,160,255,0.3)"  },
];

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

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
  const srRef          = useRef(null);
  const timerRef       = useRef(null);
  const promptTimerRef = useRef(null);
  const elapsedRef     = useRef(0);
  const finalTextRef   = useRef("");
  const isRecordingRef = useRef(false);

  const [phase, setPhase]               = useState(0);
  const [isRecording, setIsRecording]   = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [promptIdx, setPromptIdx]       = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const [interimText, setInterimText]   = useState("");
  const [pendingTranscript, setPendingTranscript] = useState(null);
  const [pendingElapsed, setPendingElapsed]       = useState(0);
  const [title, setTitle]               = useState("");
  const [analyzing, setAnalyzing]       = useState(false);
  const [analyzeStep, setAnalyzeStep]   = useState("");
  const [error, setError]               = useState("");

  const speechAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => () => { stopTimers(); srRef.current?.stop(); }, []);

  useEffect(() => {
    if (isRecording) {
      promptTimerRef.current = setInterval(() => {
        setPromptVisible(false);
        setTimeout(() => { setPromptIdx((p) => (p + 1) % PROMPTS.length); setPromptVisible(true); }, 350);
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
      setError("Speech recognition isn't available on this browser. Try Safari on iOS or Chrome on desktop.");
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
        if (e.results[i].isFinal) finalTextRef.current += text + " ";
        else interim += text;
      }
      setInterimText(interim);
    };
    sr.onend = () => { if (isRecordingRef.current) try { srRef.current?.start(); } catch {} };
    sr.onerror = (e) => { if (e.error === "no-speech" && isRecordingRef.current) try { srRef.current?.start(); } catch {} };
    sr.start();

    elapsedRef.current = 0;
    setElapsed(0);
    setIsRecording(true);
    isRecordingRef.current = true;
    timerRef.current = setInterval(() => { elapsedRef.current += 1; setElapsed((p) => p + 1); }, 1000);
  }

  function stopRecording() {
    isRecordingRef.current = false;
    stopTimers();
    setIsRecording(false);
    srRef.current?.stop();
    srRef.current = null;
    const captured = finalTextRef.current.trim();
    const capturedElapsed = elapsedRef.current;
    if (!captured) {
      setError("No speech detected. Please speak clearly and try again.");
      return;
    }
    setPendingTranscript(captured);
    setPendingElapsed(capturedElapsed);
    setInterimText("");
  }

  async function analyze() {
    if (!pendingTranscript) return;
    setAnalyzing(true);
    setError("");
    try {
      setAnalyzeStep("Analyzing psychology...");
      const res = await base44.functions.invoke("analyzeSessionPsychology", {
        transcript: pendingTranscript,
        elapsed: String(pendingElapsed),
        sessionTitle: title.trim(),
        normalizedFileUrl: "",
      });
      if (res.data?.error) throw new Error(res.data.error);
      onClose(res?.data || res);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.data?.error || err?.message || "Analysis failed. Please try again.";
      setError(msg);
      setAnalyzing(false);
      setAnalyzeStep("");
    }
  }

  const cp       = PHASES[phase];
  const hasPending = pendingTranscript !== null;
  const liveText   = finalTextRef.current + interimText;

  const BG = "linear-gradient(160deg, #0c0c10 0%, #111116 60%, #0e0e14 100%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: BG, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* ── Top bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-6 rounded-full"
            style={{ background: cp.color, boxShadow: `0 0 12px ${cp.glow}` }}
          />
          <div>
            <div className="text-[15px] font-semibold text-white tracking-tight">Live Session</div>
            <div className="text-[11px] text-white/30 mt-0.5 font-light">No filter. No judgment.</div>
          </div>
        </div>
        <button
          onClick={() => !analyzing && onClose(null)}
          className="w-8 h-8 rounded-full grid place-items-center transition-all hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>

      {/* ── Phase selector ─────────────────────────────── */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {PHASES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => !isRecording && setPhase(i)}
              className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all"
              style={
                phase === i
                  ? { background: "rgba(255,255,255,0.09)", color: p.color, boxShadow: `0 0 14px ${p.glow}` }
                  : { color: "rgba(255,255,255,0.22)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Rotating prompt ────────────────────────────── */}
      <div className="px-6 flex-shrink-0" style={{ minHeight: 58 }}>
        <AnimatePresence mode="wait">
          {promptVisible && (
            <motion.p
              key={`${promptIdx}-${isRecording}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.28 }}
              className="text-[13px] leading-snug font-medium"
              style={{ color: isRecording ? cp.color : "rgba(255,255,255,0.28)" }}
            >
              {isRecording ? `"${PROMPTS[promptIdx]}"` : "Ready when you are."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Centre stage ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        {!hasPending && (
          <>
            <AnimatePresence>
              {isRecording && liveText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full mb-8 rounded-2xl px-5 py-4 text-sm leading-relaxed text-white/55 overflow-y-auto max-h-40"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {liveText}
                  <span className="inline-block w-[3px] h-[14px] ml-0.5 bg-white/30 animate-pulse rounded-sm align-middle" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-6 text-xs font-mono"
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-white/35">REC</span>
                  <span className="text-white font-bold tabular-nums">{formatTime(elapsed)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onTouchEnd={(e) => { e.preventDefault(); isRecording ? stopRecording() : startRecording(); }}
              onClick={() => isRecording ? stopRecording() : startRecording()}
              whileTap={{ scale: 0.93 }}
              animate={isRecording ? { boxShadow: [`0 0 0px ${cp.glow}`, `0 0 60px ${cp.glow}`, `0 0 0px ${cp.glow}`] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: isRecording
                  ? "radial-gradient(circle, rgba(255,80,80,0.18) 0%, rgba(255,50,50,0.06) 100%)"
                  : `radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1.5px solid ${isRecording ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.12)"}`,
              }}
            >
              {isRecording
                ? <Square size={28} className="text-red-400" fill="rgba(255,100,100,0.2)" />
                : <Mic size={28} style={{ color: cp.color }} />
              }
            </motion.button>

            <div className="mt-5 text-[11px] text-white/20 font-light tracking-wide">
              {isRecording ? "tap to stop" : "tap to begin"}
            </div>

            {isRecording && liveText && (
              <button
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                onClick={stopRecording}
                className="mt-5 px-4 py-1.5 rounded-full text-xs text-red-300/70 transition-all hover:text-red-300"
                style={{ border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.05)" }}
              >
                Stop Recording
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Post-recording full-screen overlay ─────────── */}
      <AnimatePresence>
        {hasPending && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute inset-0 z-10 flex flex-col"
            style={{ background: BG, paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-7 pb-6 flex-shrink-0">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-1.5">Session complete</div>
                <div className="text-2xl font-bold text-white tracking-tight leading-tight">Review &<br/>Analyze</div>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold tabular-nums mt-1"
                style={{ background: "rgba(80,220,160,0.1)", border: "1px solid rgba(80,220,160,0.25)", color: "rgba(80,220,160,0.9)" }}
              >
                {formatTime(pendingElapsed)} recorded
              </div>
            </div>

            {/* Transcript block */}
            <div className="px-6 flex-shrink-0">
              <div className="text-[10px] uppercase tracking-widest text-white/20 font-semibold mb-2">What you said</div>
              <div
                className="rounded-2xl px-5 py-4 text-[13px] leading-relaxed text-white/40 max-h-40 overflow-y-auto"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {pendingTranscript}
              </div>
            </div>

            <div className="mx-6 my-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

            {/* Title */}
            <div className="px-6 flex-shrink-0">
              <div className="text-[10px] uppercase tracking-widest text-white/20 font-semibold mb-2">Give it a title</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. NQ Pre-Market — ${format(new Date(), "MMM d")}`}
                className="w-full rounded-2xl px-5 py-4 text-sm text-white bg-transparent outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <style>{`input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3 flex-shrink-0">
              {error && (
                <div
                  className="rounded-2xl px-4 py-3 text-xs leading-relaxed"
                  style={{ background: "rgba(255,70,70,0.08)", border: "1px solid rgba(255,70,70,0.2)", color: "rgba(255,160,150,0.9)" }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={analyzing}
                className="w-full rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all"
                style={{
                  background: analyzing
                    ? "rgba(107,155,251,0.1)"
                    : "linear-gradient(135deg, rgba(107,155,251,0.22), rgba(121,113,249,0.16))",
                  border:    "1px solid rgba(107,155,251,0.35)",
                  color:     "#8BBEFF",
                  boxShadow: analyzing ? "none" : "0 8px 32px rgba(107,155,251,0.15)",
                }}
              >
                {analyzing
                  ? <><Loader2 size={15} className="animate-spin" />{analyzeStep || "Analyzing..."}</>
                  : <>Analyze My Psychology<ArrowRight size={15} /></>
                }
              </button>

              <button
                onClick={() => { setPendingTranscript(null); setError(""); }}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-white/25 hover:text-white/50 transition-colors disabled:opacity-30"
              >
                <RotateCcw size={11} />
                Discard & record again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error (recording stage) ─────────────────────── */}
      <AnimatePresence>
        {error && !hasPending && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mb-4 rounded-2xl px-4 py-3 text-xs leading-relaxed flex-shrink-0"
            style={{ background: "rgba(255,70,70,0.08)", border: "1px solid rgba(255,70,70,0.2)", color: "rgba(255,160,150,0.9)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}