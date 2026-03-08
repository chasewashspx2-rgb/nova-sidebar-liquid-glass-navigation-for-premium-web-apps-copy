import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";

const PERSONALITIES = {
  yin: {
    name: "Yin",
    title: "The Motivator",
    emoji: "☯️",
    tagline: "Warm • Supportive • Rebuilding",
    color: "rgba(104,155,251,0.85)",
    gradFrom: "rgba(104,155,251,0.18)",
    gradTo: "rgba(121,113,249,0.12)",
    border: "rgba(104,155,251,0.35)",
    glow: "rgba(104,155,251,0.25)",
    bubbleBg: "rgba(104,155,251,0.15)",
    bubbleBorder: "rgba(104,155,251,0.3)",
    systemPrompt: `You are Yin, a warm and deeply empathetic trading psychology coach. Your role is to help traders rebuild confidence, reframe setbacks as learning opportunities, and reconnect with their purpose. 

Your style:
- Speak with warmth, compassion, and genuine care
- Acknowledge emotions first before offering perspective
- Reframe losses as data and growth opportunities
- Use gentle encouragement and positive reinforcement
- Help traders reconnect with their "why"
- Never shame or criticize — only build up
- Short, meaningful responses (2-4 sentences max unless they need more)
- Occasionally use metaphors from nature or philosophy

You are talking to an active trader who may be struggling with losses, fear, doubt, or emotional decisions. Meet them where they are.`,
  },
  yang: {
    name: "Yang",
    title: "The Critic",
    emoji: "⚡",
    tagline: "Direct • Honest • Accountable",
    color: "rgba(255,100,80,0.9)",
    gradFrom: "rgba(255,100,80,0.15)",
    gradTo: "rgba(220,60,60,0.08)",
    border: "rgba(255,100,80,0.35)",
    glow: "rgba(255,100,80,0.2)",
    bubbleBg: "rgba(255,100,80,0.12)",
    bubbleBorder: "rgba(255,100,80,0.28)",
    systemPrompt: `You are Yang, a direct and no-nonsense trading psychology coach. Your role is to cut through excuses, hold traders accountable, and push them to honest self-assessment.

Your style:
- Be blunt, direct, and clear — no sugarcoating
- Call out rationalizations and excuses immediately
- Ask sharp, uncomfortable questions that force self-reflection
- Push traders to take ownership of every decision
- Use tough love — you care, but you won't coddle
- Short, punchy responses (2-3 sentences max unless drilling deeper)
- Occasionally use challenging rhetoric: "Let me ask you something..."

You are talking to an active trader. Your job is not to make them feel good — it's to make them better. Hold the mirror up.`,
  },
};

function TypingIndicator({ color }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl w-fit" style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.2)" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}

function ChatBubble({ msg, personality }) {
  const isUser = msg.role === "user";
  const p = PERSONALITIES[personality];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full grid place-items-center text-base flex-shrink-0 mr-2 mt-0.5"
          style={{ background: p.gradFrom, border: `1px solid ${p.border}` }}>
          {p.emoji}
        </div>
      )}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed`}
        style={isUser
          ? { background: "rgba(var(--glass),0.45)", border: "1px solid rgba(255,255,255,0.4)" }
          : { background: p.bubbleBg, border: `1px solid ${p.bubbleBorder}` }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function CoachPage() {
  const [personality, setPersonality] = useState("yin");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const p = PERSONALITIES[personality];

  // Greet on personality switch
  useEffect(() => {
    const greetings = {
      yin: "Hey, I'm Yin. I'm here with you — no judgment, just support. What's on your mind today?",
      yang: "Yang here. Let's skip the small talk. What happened, and what are you going to do about it?",
    };
    setMessages([{ role: "assistant", content: greetings[personality] }]);
    window.speechSynthesis?.cancel();
  }, [personality]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text) => {
    if (!voiceOutput || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = personality === "yang" ? 1.05 : 0.92;
    utter.pitch = personality === "yang" ? 0.85 : 1.1;
    utter.volume = 1;
    // Try to pick a suitable voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      const preferred = voices.find(v => personality === "yin"
        ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("karen")
        : v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("daniel")
      ) || voices[0];
      utter.voice = preferred;
    }
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.slice(-8).map(m => `${m.role === "user" ? "Trader" : p.name}: ${m.content}`).join("\n");
    const prompt = `${p.systemPrompt}\n\nConversation so far:\n${history}\n\nRespond as ${p.name}:`;

    const reply = await base44.integrations.Core.InvokeLLM({ prompt });
    const assistantMsg = { role: "assistant", content: reply };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
    speak(reply);
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[860px]">
      <SectionHeader
        title="AI Coach"
        subtitle="Choose your coaching style"
      />

      {/* Personality Toggle */}
      <div className="flex gap-3 mb-4">
        {Object.entries(PERSONALITIES).map(([key, val]) => (
          <motion.button key={key} onClick={() => setPersonality(key)} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
            style={{
              background: personality === key ? `linear-gradient(135deg, ${val.gradFrom}, ${val.gradTo})` : "rgba(var(--glass),0.28)",
              border: `1px solid ${personality === key ? val.border : "rgba(255,255,255,0.25)"}`,
              boxShadow: personality === key ? `0 8px 32px ${val.glow}` : "none",
            }}>
            {key === "yin" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="black" stroke="black" strokeWidth="0.5"/>
                <circle cx="12" cy="7" r="3.5" fill="white"/>
                <circle cx="12" cy="17" r="3.5" fill="black"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="white" stroke="white" strokeWidth="0.5"/>
                <circle cx="12" cy="7" r="3.5" fill="white"/>
                <circle cx="12" cy="17" r="3.5" fill="black"/>
              </svg>
            )}
            <div>
              <div className="font-bold text-sm">{val.name} <span className="font-normal opacity-70">— {val.title}</span></div>
              <div className="text-[11px] opacity-60 mt-0.5">{val.tagline}</div>
            </div>
            {personality === key && (
              <motion.div layoutId="active-dot" className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: val.color }} />
            )}
          </motion.button>
        ))}
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-[rgba(var(--muted),0.6)] mr-1">Voice:</span>
        <motion.button onClick={() => setVoiceInput(v => !v)} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            background: voiceInput ? `${p.gradFrom}` : "rgba(var(--glass),0.3)",
            border: `1px solid ${voiceInput ? p.border : "rgba(255,255,255,0.25)"}`,
          }}>
          <Mic size={12} /> Input {voiceInput ? "On" : "Off"}
        </motion.button>
        <motion.button onClick={() => { setVoiceOutput(v => !v); if (voiceOutput) stopSpeaking(); }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            background: voiceOutput ? `${p.gradFrom}` : "rgba(var(--glass),0.3)",
            border: `1px solid ${voiceOutput ? p.border : "rgba(255,255,255,0.25)"}`,
          }}>
          <Volume2 size={12} /> Output {voiceOutput ? "On" : "Off"}
        </motion.button>
        {speaking && (
          <motion.button onClick={stopSpeaking} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
            style={{ background: "rgba(255,100,80,0.15)", border: "1px solid rgba(255,100,80,0.35)" }}>
            <VolumeX size={12} /> Stop
          </motion.button>
        )}
        <motion.button onClick={() => {
          const greetings = { yin: "Hey, I'm Yin. I'm here with you — no judgment, just support. What's on your mind today?", yang: "Yang here. Let's skip the small talk. What happened, and what are you going to do about it?" };
          setMessages([{ role: "assistant", content: greetings[personality] }]);
        }} whileTap={{ scale: 0.95 }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: "rgba(var(--glass),0.3)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <RotateCcw size={11} /> Reset
        </motion.button>
      </div>

      {/* Chat Window */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-[20px] p-4 space-y-3 mb-3"
        style={{ background: "rgba(var(--glass),0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} personality={personality} />
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="w-8 h-8 rounded-full grid place-items-center text-base flex-shrink-0 mr-2 mt-0.5"
              style={{ background: p.gradFrom, border: `1px solid ${p.border}` }}>
              {p.emoji}
            </div>
            <TypingIndicator color={p.color} />
          </motion.div>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {voiceInput && (
          <motion.button onClick={toggleListening} whileTap={{ scale: 0.92 }}
            className="w-11 h-11 rounded-full flex-shrink-0 grid place-items-center cursor-pointer transition-all"
            animate={listening ? { scale: [1, 1.12, 1], boxShadow: [`0 0 0 0 ${p.glow}`, `0 0 0 10px rgba(0,0,0,0)`, `0 0 0 0 ${p.glow}`] } : {}}
            transition={{ duration: 1.2, repeat: listening ? Infinity : 0 }}
            style={{
              background: listening ? p.gradFrom : "rgba(var(--glass),0.4)",
              border: `1px solid ${listening ? p.border : "rgba(255,255,255,0.3)"}`,
            }}>
            {listening ? <Mic size={18} style={{ color: p.color }} /> : <MicOff size={18} className="opacity-50" />}
          </motion.button>
        )}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full"
          style={{ background: "rgba(var(--glass),0.4)", border: "1px solid rgba(255,255,255,0.35)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={listening ? "🎤 Listening..." : personality === "yin" ? "Talk to Yin..." : "Talk to Yang..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
          />
        </div>
        <motion.button onClick={() => sendMessage()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full flex-shrink-0 grid place-items-center cursor-pointer disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color})`, boxShadow: `0 6px 20px ${p.glow}` }}>
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}