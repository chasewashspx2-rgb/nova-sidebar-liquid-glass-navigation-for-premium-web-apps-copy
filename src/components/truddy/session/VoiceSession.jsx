import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Clock, Loader } from "lucide-react";
import { format } from "date-fns";

export default function VoiceSession({ session, onEndSession, isProcessing }) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.started_at]);

  const formatElapsed = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const handleEndSession = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    onEndSession(audioChunksRef.current);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Session Header */}
      <div className="flex items-center justify-between px-5 py-3 rounded-[18px]"
        style={{ background: "rgba(104,155,251,0.12)", border: "1px solid rgba(104,155,251,0.3)" }}>
        <div className="flex items-center gap-2.5">
          <motion.div className="w-2.5 h-2.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="font-semibold text-sm">{isRecording ? "Recording" : "Session Ready"}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm opacity-60">
          <Clock size={13} /> {formatElapsed(elapsed)}
        </div>
        <motion.button onClick={handleEndSession} disabled={isProcessing}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer disabled:opacity-40"
          style={{ background: "rgba(255,100,80,0.18)", border: "1px solid rgba(255,100,80,0.4)" }}>
          {isProcessing ? (
            <>
              <Loader size={12} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Square size={12} fill="currentColor" /> End & Analyze
            </>
          )}
        </motion.button>
      </div>

      {/* Recording Area */}
      <div className="flex flex-col items-center justify-center gap-6 py-16 rounded-[20px] px-4"
        style={{ background: "rgba(var(--glass),0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
        <motion.button
          onClick={toggleRecording}
          disabled={isProcessing}
          animate={isRecording ? { scale: [1, 1.15, 1], transition: { duration: 0.8, repeat: Infinity } } : {}}
          className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 transition-all"
          style={{
            background: isRecording ? "linear-gradient(135deg, rgba(255,100,80,0.3), rgba(255,80,100,0.3))" : "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.2))",
            border: `2px solid ${isRecording ? "rgba(255,100,80,0.6)" : "rgba(104,155,251,0.4)"}`,
          }}>
          <Mic size={40} className={isRecording ? "text-red-500" : "text-blue-500"} />
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500"
              animate={{ scale: [1, 1.3], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        <div className="text-center">
          <p className="text-lg font-semibold mb-2">
            {isRecording ? "🎙️ Recording..." : "Ready to Record"}
          </p>
          <p className="text-sm opacity-60">
            {isRecording ? "Speak freely about your trading thoughts and emotions" : "Hit the button to start recording your session"}
          </p>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,100,80,0.1)", border: "1px solid rgba(255,100,80,0.3)" }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium">Microphone active</span>
          </div>
        )}
      </div>

      <p className="text-xs text-center opacity-50">
        {isRecording ? "Click the button again to stop recording" : "Audio will be saved and analyzed after session ends"}
      </p>
    </div>
  );
}