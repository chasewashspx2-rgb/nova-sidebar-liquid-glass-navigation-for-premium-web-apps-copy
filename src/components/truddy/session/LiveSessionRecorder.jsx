import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Clock, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LiveSessionRecorder({ onClose }) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
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
      setElapsed(0);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Create audio blob and upload
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await transcribeAudio(audioBlob);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      // Upload audio file
      const file = new File([audioBlob], "session.webm", { type: "audio/webm" });
      const uploadRes = await base44.integrations.Core.UploadFile({ file });

      // Transcribe using LLM
      const llmRes = await base44.integrations.Core.InvokeLLM({
        prompt: "Transcribe the following audio file. Return only the transcribed text, nothing else.",
        file_urls: [uploadRes.file_url],
        model: "gemini_3_flash"
      });

      setTranscript(llmRes);

      // Save recording to database
      const newRecording = {
        timestamp: new Date().toISOString(),
        duration: elapsed,
        transcript: llmRes,
        audio_url: uploadRes.file_url
      };

      setRecordings(prev => [newRecording, ...prev]);
    } catch (err) {
      console.error("Transcription failed:", err);
      setTranscript("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-[24px] max-w-2xl w-full p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Session Recorder</h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-2xl opacity-50 hover:opacity-100"
          >
            ×
          </motion.button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-[16px]" style={{ background: "rgba(255,100,80,0.12)", border: "1px solid rgba(255,100,80,0.3)" }}>
            <motion.div className="w-3 h-3 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-sm font-medium">{isPaused ? "Paused" : "Recording"}</span>
            <div className="ml-auto flex items-center gap-2 font-mono text-sm opacity-60">
              <Clock size={14} />
              {formatTime(elapsed)}
            </div>
          </div>
        )}

        {/* Recorder Interface */}
        <div className="flex flex-col items-center gap-6 py-8">
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            animate={isRecording ? { scale: [1, 1.12, 1], transition: { duration: 0.8, repeat: Infinity } } : {}}
            className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 transition-all"
            style={{
              background: isRecording ? "linear-gradient(135deg, rgba(255,100,80,0.3), rgba(255,80,100,0.3))" : "linear-gradient(135deg, rgba(104,155,251,0.2), rgba(121,113,249,0.2))",
              border: `2px solid ${isRecording ? "rgba(255,100,80,0.6)" : "rgba(104,155,251,0.4)"}`,
            }}
          >
            {isRecording ? <Square size={32} className="text-red-500" /> : <Mic size={32} className="text-blue-500" />}
          </motion.button>

          {/* Pause/Resume Controls */}
          {isRecording && (
            <div className="flex gap-3">
              {!isPaused ? (
                <motion.button
                  onClick={pauseRecording}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-sm"
                >
                  Pause
                </motion.button>
              ) : (
                <motion.button
                  onClick={resumeRecording}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-sm"
                >
                  Resume
                </motion.button>
              )}
            </div>
          )}

          <p className="text-sm text-center opacity-60">
            {isTranscribing ? "Transcribing audio..." : isRecording ? (isPaused ? "Recording paused" : "Recording in progress") : "Click to start recording"}
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Transcript</div>
            <div className="rounded-[16px] p-4 bg-[rgba(var(--glass),0.2)] border border-[rgba(255,255,255,0.2)] max-h-40 overflow-y-auto">
              <p className="text-sm leading-relaxed text-[rgba(var(--text),0.85)]">{transcript}</p>
            </div>
            <motion.button
              onClick={downloadTranscript}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 btn-primary text-sm"
            >
              <Download size={14} />
              Download Transcript
            </motion.button>
          </div>
        )}

        {/* Previous Recordings */}
        {recordings.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            <div className="text-sm font-medium">Previous Recordings ({recordings.length})</div>
            {recordings.map((rec, idx) => (
              <div key={idx} className="rounded-[12px] p-3 bg-[rgba(var(--glass),0.2)] border border-[rgba(255,255,255,0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-60">{new Date(rec.timestamp).toLocaleString()}</span>
                  <span className="text-xs opacity-60">{formatTime(rec.duration)}</span>
                </div>
                <p className="text-xs leading-relaxed text-[rgba(var(--text),0.75)] line-clamp-2">{rec.transcript}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}