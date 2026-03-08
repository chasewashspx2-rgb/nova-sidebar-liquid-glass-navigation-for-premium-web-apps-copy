import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Square, Clock } from "lucide-react";
import { MoodBadge } from "@/components/truddy/MoodBadge";
import { format } from "date-fns";

export default function ActiveSession({ session, onAddEntry, onEndSession, loadingEntry }) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const feedRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.started_at]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [session.entries]);

  const formatElapsed = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSend = () => {
    if (!input.trim() || loadingEntry) return;
    onAddEntry(input.trim());
    setInput("");
  };

  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const entries = session.entries || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Session Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-[18px]"
        style={{ background: "rgba(104,155,251,0.12)", border: "1px solid rgba(104,155,251,0.3)" }}>
        <div className="flex items-center gap-2.5">
          <motion.div className="w-2.5 h-2.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="font-semibold text-sm">Recording</span>
          <span className="text-xs opacity-50">{entries.length} entries</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm opacity-60">
          <Clock size={13} /> {formatElapsed(elapsed)}
        </div>
        <motion.button onClick={onEndSession} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
          style={{ background: "rgba(255,100,80,0.18)", border: "1px solid rgba(255,100,80,0.4)" }}>
          <Square size={12} fill="currentColor" /> End Session
        </motion.button>
      </div>

      {/* Live Feed */}
      <div ref={feedRef} className="flex flex-col gap-3 overflow-y-auto rounded-[20px] p-4"
        style={{ minHeight: 260, maxHeight: 420, background: "rgba(var(--glass),0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 opacity-40">
            <div className="text-2xl">🎙️</div>
            <div className="text-sm text-center">Speak or type your thoughts. Every entry is analyzed in real-time.</div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="flex flex-col gap-2 p-3.5 rounded-[16px]"
              style={{ background: "rgba(var(--glass),0.38)", border: "1px solid rgba(255,255,255,0.28)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono opacity-45">{format(new Date(entry.timestamp), "HH:mm:ss")}</span>
                {entry.emotion && <MoodBadge emotion={entry.emotion} />}
              </div>
              <p className="text-sm leading-relaxed">{entry.text}</p>
              {entry.ai_response && (
                <div className="flex gap-2 p-2.5 rounded-[12px] text-xs leading-relaxed"
                  style={{ background: "rgba(104,155,251,0.1)", border: "1px solid rgba(104,155,251,0.2)" }}>
                  <span className="text-[rgba(104,155,251,1)] flex-shrink-0">✦</span>
                  <span className="opacity-80">{entry.ai_response}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loadingEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs opacity-50 px-1">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-current border-t-transparent rounded-full" />
            Analyzing emotion & generating response...
          </motion.div>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <motion.button onClick={toggleListen} whileTap={{ scale: 0.92 }}
          animate={listening ? { scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity } } : {}}
          className="w-11 h-11 rounded-full flex-shrink-0 grid place-items-center cursor-pointer"
          style={{
            background: listening ? "rgba(104,155,251,0.25)" : "rgba(var(--glass),0.4)",
            border: `1px solid ${listening ? "rgba(104,155,251,0.5)" : "rgba(255,255,255,0.3)"}`,
            boxShadow: listening ? "0 0 0 4px rgba(104,155,251,0.15)" : "none"
          }}>
          {listening ? <Mic size={18} style={{ color: "rgba(104,155,251,1)" }} /> : <MicOff size={18} className="opacity-50" />}
        </motion.button>
        <div className="flex-1 flex items-center px-4 py-3 rounded-full"
          style={{ background: "rgba(var(--glass),0.42)", border: "1px solid rgba(255,255,255,0.35)" }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={listening ? "🎤 Listening..." : "Type your thoughts, doubts, observations..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40" />
        </div>
        <motion.button onClick={handleSend} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
          disabled={!input.trim() || loadingEntry}
          className="w-11 h-11 rounded-full flex-shrink-0 grid place-items-center cursor-pointer disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, rgba(104,155,251,1), rgba(121,113,249,1))", boxShadow: "0 6px 20px rgba(104,155,251,0.3)" }}>
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}