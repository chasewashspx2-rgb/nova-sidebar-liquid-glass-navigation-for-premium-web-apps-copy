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
  { label: "Pre-Trade",    color: "rgba(104,155,251,1)",  bg: "rgba(104,155,251,0.13)", border: "rgba(104,155,251,0.32)" },
  { label: "Waiting",      color: "rgba(232,200,74,1)",   bg: "rgba(232,200,74,0.11)",  border: "rgba(232,200,74,0.32)" },
  { label: "Filled",       color: "rgba(80,220,160,1)",   bg: "rgba(80,220,160,0.11)",  border: "rgba(80,220,160,0.3)"  },
  { label: "In Trade",     color: "rgba(255,120,90,1)",   bg: "rgba(255,120,90,0.13)",  border: "rgba(255,120,90,0.35)" },
  { label: "Exit/Review",  color: "rgba(180,160,255,1)",  bg: "rgba(160,120,255,0.11)", border: "rgba(160,120,255,0.3)" },
];

// Accept whatever the browser natively supports — mp4 on iOS, webm on Android
function getBestMimeType() {
  // Prefer formats that are more universally decodable by AudioContext.
  // audio/mp4 is last resort — we'll always convert the final blob to WAV anyway.
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

// ── WAV conversion helpers ────────────────────────────────────────────────────

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function float32ToPCM16(float32Array) {
  const buf = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    buf[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return buf;
}

function interleaveChannels(left, right) {
  const out = new Float32Array(left.length + right.length);
  let idx = 0;
  for (let i = 0; i < left.length; i++) { out[idx++] = left[i]; out[idx++] = right[i]; }
  return out;
}

async function convertBlobToWav(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close();
  }

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const rawData = numChannels > 1
    ? interleaveChannels(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1))
    : audioBuffer.getChannelData(0);

  const pcm16 = float32ToPCM16(rawData);
  const dataLength = pcm16.byteLength;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);         // chunk size
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true);              // block align
  view.setUint16(34, 16, true);         // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  return new Blob([header, pcm16.buffer], { type: "audio/wav" });
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function LiveSessionRecorder({ onClose }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const elapsedRef = useRef(0);
  const timerRef = useRef(null);
  const promptTimerRef = useRef(null);

  const [phase, setPhase] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);

  // Post-recording states
  const [pendingBlob, setPendingBlob] = useState(null);
  const [pendingMime, setPendingMime] = useState("");
  const [pendingElapsed, setPendingElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [error, setError] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimers();
      stopStream();
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

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getBestMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.addEventListener("dataavailable", (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      });

      mediaRecorderRef.current = recorder;
      // timeslice=250ms is critical for iOS — without it dataavailable may never fire
      recorder.start(250);

      elapsedRef.current = 0;
      setElapsed(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed((p) => p + 1);
      }, 1000);
    } catch {
      setError("Microphone access denied. Please allow mic access in your browser settings.");
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;

    stopTimers();
    setIsRecording(false);

    const recorder = mediaRecorderRef.current;
    const capturedMime = recorder.mimeType || "audio/webm";

    recorder.addEventListener(
      "stop",
      () => {
        stopStream();
        if (!chunksRef.current.length) {
          setError("No audio was captured. Please try again.");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: capturedMime });
        setPendingBlob(blob);
        setPendingMime(capturedMime);
        setPendingElapsed(elapsedRef.current);
      },
      { once: true }
    );

    recorder.stop();
    mediaRecorderRef.current = null;
  }

  async function analyze() {
    if (!pendingBlob) return;
    setAnalyzing(true);
    setError("");

    try {
      // Step 1: Convert to WAV in-browser (works regardless of iOS .mp4 / .webm / etc.)
      setAnalyzeStep("Converting audio to WAV...");
      console.log(`[recorder] Original blob: type=${pendingMime}, size=${pendingBlob.size}`);

      let wavBlob;
      try {
        wavBlob = await convertBlobToWav(pendingBlob);
      } catch (convErr) {
        throw new Error(`Audio conversion failed (original format: ${pendingMime || "unknown"}). ${convErr.message}`);
      }

      const wavFile = new File([wavBlob], "session.wav", { type: "audio/wav" });
      console.log(`[recorder] WAV file ready: name=${wavFile.name}, size=${wavFile.size}, type=${wavFile.type}`);

      // Validate before upload
      if (wavFile.size < 1000) {
        throw new Error("Converted WAV file is too small — no audio was captured. Please try recording again.");
      }

      // Step 2: Upload via normalizeAudio (which now just uploads the WAV directly)
      setAnalyzeStep("Uploading audio...");
      const normalizeRes = await base44.functions.invoke("normalizeAudio", { audio: wavFile });
      if (normalizeRes.data?.error) throw new Error(normalizeRes.data.error);
      const { normalizedFileUrl } = normalizeRes.data;

      // Step 3: Transcribe
      setAnalyzeStep("Transcribing session...");
      const transcribeRes = await base44.functions.invoke("transcribeAudio", { normalizedFileUrl });
      if (transcribeRes.data?.error) throw new Error(transcribeRes.data.error);
      const { transcript } = transcribeRes.data;

      // Step 4: Analyze psychology + save session
      setAnalyzeStep("Analyzing psychology...");
      const analyzeRes = await base44.functions.invoke("analyzeSessionPsychology", {
        transcript,
        elapsed: String(pendingElapsed),
        sessionTitle: title.trim(),
        normalizedFileUrl,
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
  const hasPending = !!pendingBlob;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "rgba(12,12,14,0.97)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
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
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
          Where are you?
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PHASES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => !isRecording && setPhase(i)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
              style={{
                background: phase === i ? p.bg : "rgba(255,255,255,0.05)",
                border: `1px solid ${phase === i ? p.border : "rgba(255,255,255,0.08)"}`,
                color: phase === i ? p.color : "rgba(255,255,255,0.3)",
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
              style={{
                background: currentPhase.bg,
                border: `1px solid ${currentPhase.border}`,
                color: currentPhase.color,
              }}
            >
              {isRecording ? PROMPTS[promptIdx] : "Ready when you are — tap the mic to begin"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center — big record button */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
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

        {/* Mic Button */}
        {!hasPending && (
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
        )}

        <div className="text-xs text-white/25 text-center">
          {isRecording ? "Tap the square to stop" : hasPending ? "" : "Tap the mic to start"}
        </div>
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
            <div className="text-xs text-white/40 uppercase tracking-widest font-semibold text-center mb-1">
              Recording captured — {formatTime(pendingElapsed)}
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
                border: "1px solid rgba(104,155,251,0.4)",
                color: "rgba(140,190,255,1)",
              }}
            >
              {analyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {analyzeStep || "Processing..."}
                </>
              ) : (
                <>
                  Analyze Session
                  <ChevronRight size={15} />
                </>
              )}
            </button>

            <button
              onClick={() => { setPendingBlob(null); setError(""); }}
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