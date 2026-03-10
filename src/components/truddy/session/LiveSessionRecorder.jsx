import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import PastSessionCard from "@/components/truddy/session/PastSessionCard";

const PROMPTS = [
  "What's going through your mind right now?",
  "Any urges you're feeling? Say them out loud.",
  "What does your gut say about this setup?",
  "Are you feeling any fear or hesitation?",
  "What would you regret NOT saying right now?",
  "Describe the market as you see it - no filter.",
  "Are you chasing? Be honest with yourself.",
  "What emotion is driving you most right now?",
  "Is this trade fear-of-missing-out, or conviction?",
  "Talk through your entry criteria out loud.",
  "What's your body telling you right now?",
  "If your best trading self could speak - what would they say?",
];

const PHASES = [
  { label: "Pre-Trade", color: "rgba(104,155,251,0.9)", bg: "rgba(104,155,251,0.12)", border: "rgba(104,155,251,0.3)" },
  { label: "Waiting Entry", color: "rgba(232,200,74,0.9)", bg: "rgba(232,200,74,0.1)", border: "rgba(232,200,74,0.3)" },
  { label: "Filled", color: "rgba(80,220,160,0.9)", bg: "rgba(80,220,160,0.1)", border: "rgba(80,220,160,0.3)" },
  { label: "In Trade", color: "rgba(255,120,90,0.9)", bg: "rgba(255,120,90,0.12)", border: "rgba(255,120,90,0.35)" },
  { label: "Exit / Review", color: "rgba(180,160,255,0.9)", bg: "rgba(160,120,255,0.1)", border: "rgba(160,120,255,0.3)" },
];

function getFriendlyErrorMessage(error) {
  const rawMessage = error?.data?.error || error?.message || "Unable to process the session.";
  const stage = error?.data?.stage;

  if (stage === "auth") {
    return "The session could not be processed because the Base44 user session was not available.";
  }

  if (stage === "upload") {
    return "The recording finished, but the audio upload failed. Try again in a moment.";
  }

  if (stage === "transcription") {
    return "The audio uploaded, but transcription failed. Try again with a shorter recording.";
  }

  if (stage === "analysis") {
    return "The transcript came through, but the coaching analysis failed. Try the session again.";
  }

  if (stage === "save") {
    return "The analysis finished, but saving the session failed. Try again in a moment.";
  }

  if (typeof rawMessage === "string" && rawMessage.toLowerCase().includes("unauthorized")) {
    return "The session could not be processed because the Base44 user session was not available.";
  }

  return rawMessage;
}

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
  const [activePhase, setActivePhase] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [pendingRecording, setPendingRecording] = useState(null);
  const [processingError, setProcessingError] = useState("");

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

  const handleDeleteSession = async (sessionId) => {
    await base44.entities.TradingSession.delete(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (expandedId === sessionId) {
      setExpandedId(null);
    }
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const getSupportedMimeType = () => {
    const types = ["audio/mp4", "audio/ogg;codecs=opus", "audio/ogg", "audio/webm;codecs=opus", "audio/webm"];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const resetDraftState = () => {
    setPendingRecording(null);
    setSessionTitle("");
    setShowTitleInput(false);
    setProcessingError("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current = recorder;
      recorder.start();

      setIsRecording(true);
      setIsPaused(false);
      setElapsed(0);
      setTranscript("");
      resetDraftState();
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

  const finalizeRecorderOutput = () => new Promise((resolve, reject) => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      reject(new Error("No active recording was found."));
      return;
    }

    const mimeType = recorder.mimeType || "audio/webm";
    const stream = recorder.stream;

    const cleanup = () => {
      recorder.removeEventListener("stop", handleStop);
      recorder.removeEventListener("error", handleError);
      stream?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    };

    const handleError = (event) => {
      cleanup();
      reject(event?.error || new Error("Recording failed while stopping."));
    };

    const handleStop = () => {
      cleanup();
      if (!audioChunksRef.current.length) {
        reject(new Error("No audio data was captured. Please try again."));
        return;
      }

      resolve({
        audioBlob: new Blob(audioChunksRef.current, { type: mimeType }),
        mimeType,
      });
    };

    recorder.addEventListener("stop", handleStop, { once: true });
    recorder.addEventListener("error", handleError, { once: true });

    try {
      recorder.stop();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return;
    }

    setProcessingError("");
    setIsRecording(false);
    setIsPaused(false);

    try {
      const { audioBlob, mimeType } = await finalizeRecorderOutput();
      setPendingRecording({
        audioBlob,
        mimeType,
        elapsedSeconds: elapsed,
        phaseLabel: PHASES[activePhase].label,
      });
      setShowTitleInput(true);
    } catch (error) {
      setProcessingError(getFriendlyErrorMessage(error));
      alert(getFriendlyErrorMessage(error));
    }
  };

  const processRecording = async () => {
    if (!pendingRecording) {
      return;
    }

    setIsTranscribing(true);
    setProcessingError("");

    try {
      const { audioBlob, mimeType, elapsedSeconds, phaseLabel } = pendingRecording;
      const extension = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
      const file = new File([audioBlob], `session.${extension}`, { type: mimeType });
      const payload = {
        audio: file,
        elapsed: elapsedSeconds.toString(),
        sessionTitle: sessionTitle.trim(),
        phase: phaseLabel,
      };

      const response = await base44.functions.invoke("transcribeAudio", payload);
      const newSession = response?.data || response;

      setSessions((prev) => [newSession, ...prev]);
      setExpandedId(newSession.id);
      setIsTranscribing(false);
      resetDraftState();
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      console.error("Error processing recording:", error);
      setIsTranscribing(false);
      setProcessingError(friendlyMessage);
      alert(friendlyMessage);
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
        <div
          className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <div className="text-sm font-semibold text-[#faf9f6]">Live Trading Analyzer</div>
            <div className="text-[11px] text-[#faf9f6] mt-0.5 font-light tracking-wide opacity-60">
              Speak freely - no filter, no judgment
            </div>
          </div>
          <button onClick={onClose} className="text-2xl opacity-40 hover:opacity-80 transition-opacity leading-none">
            x
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="text-[11px] text-[#faf9f6] font-light uppercase tracking-wider opacity-70">
              Where are you in the trade?
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PHASES.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => setActivePhase(index)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: activePhase === index ? item.bg : "rgba(var(--glass),0.2)",
                    border: `1px solid ${activePhase === index ? item.border : "rgba(255,255,255,0.1)"}`,
                    color: activePhase === index ? item.color : "rgba(200,200,200,0.4)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

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
                {isRecording ? ` ${PROMPTS[promptIdx]}` : ` Ready when you are - tap the mic to begin`}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showTitleInput && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <div className="text-[11px] text-[#faf9f6] opacity-50 uppercase tracking-wider">Name this session (optional)</div>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(event) => setSessionTitle(event.target.value)}
                    placeholder={`e.g. NQ Pre-Market ${format(new Date(), "MMM d")}`}
                    className="w-full rounded-[12px] px-3 py-2 text-sm text-[#faf9f6] outline-none placeholder:opacity-30"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={processRecording}
                    disabled={isTranscribing || !pendingRecording}
                    className="flex-1 rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(104,155,251,0.22), rgba(121,113,249,0.18))",
                      border: "1px solid rgba(104,155,251,0.35)",
                      color: "#faf9f6",
                    }}
                  >
                    {isTranscribing ? "Analyzing session..." : "Analyze session"}
                  </button>
                  <button
                    onClick={resetDraftState}
                    disabled={isTranscribing}
                    className="rounded-[12px] px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(250,249,246,0.72)" }}
                  >
                    Cancel
                  </button>
                </div>

                {processingError && (
                  <div className="rounded-[12px] px-3 py-2 text-xs leading-relaxed" style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.24)", color: "rgba(255,190,190,0.92)" }}>
                    {processingError}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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

            {!isRecording && !isTranscribing && !transcript && !showTitleInput && (
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

          {sessions.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#faf9f6] font-light uppercase tracking-wider opacity-50">
                Past Sessions
              </div>
              <div className="grid grid-cols-1 gap-2">
                {sessions.map((session) => (
                  <PastSessionCard
                    key={session.id}
                    session={session}
                    isExpanded={expandedId === session.id}
                    onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
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
