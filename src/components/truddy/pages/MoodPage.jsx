import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { emotionConfig } from "@/components/truddy/MoodBadge";
import { SectionHeader } from "@/components/truddy/SectionHeader";

const EMOTIONS = ["focused", "confident", "anxious", "neutral", "fomo", "angry", "excited", "tired"];

const moodPrompts = {
  focused: ["I have a clear plan for today.", "I will only take A+ setups.", "Patience is my edge today."],
  confident: ["I'll stick to my position sizing no matter what.", "Confidence is built on execution, not outcomes.", "I won't let confidence become overconfidence."],
  anxious: ["I will reduce my size today due to anxiety.", "If I feel overwhelmed, I step away.", "Slow is smooth, smooth is fast."],
  neutral: ["I observe the market without forcing trades.", "I show up consistently regardless of mood.", "Neutral is a great state to trade from."],
  fomo: ["FOMO is a signal to step back, not forward.", "The market will always have opportunities.", "I only trade what I've planned."],
  angry: ["I will not trade today until this passes.", "Anger leads to revenge trading. I pause.", "One bad trade doesn't define me."],
  excited: ["Excitement is energy — I'll channel it into discipline.", "I won't overtrade because I'm feeling good.", "I trade my plan, not my excitement."],
  tired: ["Fatigue is a reason to size down today.", "I won't trade if I can't think clearly.", "Rest is part of a winning trading routine."],
};

const tradingClearances = [
  { id: "slept", label: "I got enough sleep last night" },
  { id: "news", label: "I've reviewed major news / economic events" },
  { id: "plan", label: "I have a clear plan and key levels" },
  { id: "rules", label: "I've reviewed my trading rules" },
  { id: "risk", label: "I know my max risk for today" },
  { id: "calm", label: "I'm emotionally ready to trade" },
];

export default function MoodPage() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("form"); // form | done
  const [form, setForm] = useState({
    emotion: "",
    energy_level: 7,
    focus_level: 7,
    intentions: "",
    clearances: {},
  });

  const today = new Date().toISOString().split("T")[0];

  const load = () =>
    base44.entities.MoodCheck.list("-created_date", 14).then((c) => {
      setChecks(c);
      setLoading(false);
      if (c.find((x) => x.date === today)) setStep("done");
    });

  useEffect(() => { load(); }, []);

  const todayCheck = checks.find((c) => c.date === today);
  const allClear = Object.values(form.clearances).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.emotion) return;
    await base44.entities.MoodCheck.create({
      date: today,
      emotion: form.emotion,
      energy_level: form.energy_level,
      focus_level: form.focus_level,
      intentions: form.intentions,
      completed: true,
    });
    setStep("done");
    load();
  };

  const handleNewCheckIn = () => {
    setForm({ emotion: "", energy_level: 7, focus_level: 7, intentions: "", clearances: {} });
    setStep("form");
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Mood Check-In"
        subtitle="Start every session with emotional awareness"
      />

      <AnimatePresence mode="wait">
        {step === "done" && todayCheck ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="glass rounded-[24px] p-6 sm:p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }} className="w-16 h-16 rounded-full mx-auto mb-4 grid place-items-center text-3xl"
              style={{ background: "rgba(72,199,142,0.2)", border: "2px solid rgba(72,199,142,0.4)" }}>
              ✓
            </motion.div>
            <div className="font-bold text-xl mb-2">Today's Check-In Complete</div>
            <div className="text-[rgba(var(--muted),0.8)] text-sm mb-4">
              You're trading as: <strong>{emotionConfig[todayCheck.emotion]?.emoji} {emotionConfig[todayCheck.emotion]?.label}</strong>
            </div>
            {todayCheck.intentions && (
              <div className="glass rounded-[16px] p-4 mb-5 text-sm text-[rgba(var(--muted),0.85)] italic">
                "{todayCheck.intentions}"
              </div>
            )}
            {moodPrompts[todayCheck.emotion] && (
              <div className="text-left mb-5">
                <div className="text-xs font-semibold text-[rgba(var(--muted),0.6)] mb-2 uppercase tracking-wider">Affirmations for today</div>
                <div className="space-y-2">
                  {moodPrompts[todayCheck.emotion].map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{p}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleNewCheckIn} className="pill cursor-pointer text-xs">Update Check-In</button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-5">
              {/* Left: Form */}
              <div className="space-y-4">
                {/* Emotion Picker */}
                <div className="glass rounded-[20px] p-4 sm:p-5">
                  <div className="font-semibold text-sm mb-3">How are you feeling right now?</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EMOTIONS.map((e) => {
                      const cfg = emotionConfig[e];
                      const isActive = form.emotion === e;
                      return (
                        <motion.button key={e} onClick={() => setForm(f => ({ ...f, emotion: e }))} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="py-3 rounded-[16px] text-center cursor-pointer transition-all border"
                          style={isActive ? { background: cfg.color, borderColor: cfg.border, boxShadow: `0 6px 20px ${cfg.color}` } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
                          <div className="text-xl mb-1">{cfg.emoji}</div>
                          <div className="text-xs font-medium">{cfg.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Levels */}
                <div className="glass rounded-[20px] p-4 sm:p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Energy Level</label>
                      <span className="text-sm font-bold text-[rgb(var(--accent))]">{form.energy_level}/10</span>
                    </div>
                    <input type="range" min={1} max={10} value={form.energy_level} onChange={(e) => setForm(f => ({ ...f, energy_level: Number(e.target.value) }))} className="w-full accent-[rgb(var(--accent))]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Focus Level</label>
                      <span className="text-sm font-bold text-[rgb(var(--accent))]">{form.focus_level}/10</span>
                    </div>
                    <input type="range" min={1} max={10} value={form.focus_level} onChange={(e) => setForm(f => ({ ...f, focus_level: Number(e.target.value) }))} className="w-full accent-[rgb(var(--accent))]" />
                  </div>
                </div>

                {/* Intentions */}
                <div className="glass rounded-[20px] p-4 sm:p-5">
                  <label className="text-sm font-medium block mb-2">Set Your Intention for Today</label>
                  <textarea value={form.intentions} onChange={(e) => setForm(f => ({ ...f, intentions: e.target.value }))} placeholder="e.g. I will only take setups that meet all 5 of my criteria, and I will accept whatever outcome comes from disciplined execution." rows={3} className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-[rgba(var(--muted),0.4)]" />
                </div>

                <motion.button onClick={handleSubmit} disabled={!form.emotion} whileHover={form.emotion ? { scale: 1.03, y: -2 } : {}} whileTap={form.emotion ? { scale: 0.97 } : {}} className={`w-full py-3.5 rounded-[16px] font-semibold text-sm shimmer transition-all ${form.emotion ? "btn-primary cursor-pointer" : "glass opacity-50 cursor-not-allowed"}`}>
                  <Brain size={15} className="inline mr-2" />
                  Complete Check-In
                </motion.button>
              </div>

              {/* Right: Pre-session clearance */}
              <div className="glass rounded-[20px] p-4 sm:p-5">
                <div className="font-semibold text-sm mb-1">Pre-Session Clearance</div>
                <div className="text-xs text-[rgba(var(--muted),0.75)] mb-4">Check each box before you open a chart.</div>
                <div className="space-y-2.5">
                  {tradingClearances.map((c, i) => {
                    const checked = form.clearances[c.id];
                    return (
                      <motion.button key={c.id} onClick={() => setForm(f => ({ ...f, clearances: { ...f.clearances, [c.id]: !checked } }))} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="w-full flex items-center gap-3 text-left p-3 rounded-[14px] cursor-pointer transition-all"
                        style={checked ? { background: "rgba(72,199,142,0.15)", border: "1px solid rgba(72,199,142,0.35)" } : { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 grid place-items-center border-2 transition-all ${checked ? "bg-green-500 border-green-500" : "border-white/30"}`}>
                          {checked && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className="text-sm">{c.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-[rgba(var(--muted),0.65)] mb-2">{allClear}/{tradingClearances.length} cleared</div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, rgba(104,155,251,1), rgba(121,113,249,1))" }} initial={{ width: 0 }} animate={{ width: `${(allClear / tradingClearances.length) * 100}%` }} transition={{ duration: 0.4 }} />
                  </div>
                  {allClear === tradingClearances.length && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-green-500 font-medium">✓ You're cleared to trade!</motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {checks.length > 0 && (
        <div className="glass rounded-[20px] p-4 sm:p-5">
          <div className="font-semibold text-sm mb-3">Recent Check-Ins</div>
          <div className="space-y-2">
            {checks.slice(0, 7).map((c, i) => {
              const cfg = emotionConfig[c.emotion];
              return (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between rounded-[14px] px-3 py-2.5 glass">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cfg?.emoji || "😐"}</span>
                    <div>
                      <div className="text-sm font-medium">{cfg?.label || c.emotion}</div>
                      <div className="text-xs text-[rgba(var(--muted),0.65)]">{c.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[rgba(var(--muted),0.65)]">⚡ {c.energy_level}/10</span>
                    <span className="text-xs text-[rgba(var(--muted),0.65)]">🎯 {c.focus_level}/10</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}