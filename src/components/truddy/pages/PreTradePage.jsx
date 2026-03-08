import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, XCircle, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";

const GATE_QUESTIONS = [
  {
    id: "setup_quality",
    category: "Setup",
    question: "Is this an A+ setup that meets ALL of my entry criteria?",
    yesLabel: "Yes, all criteria met",
    noLabel: "Not quite / forcing it",
    weight: 3,
    failWarning: "You're about to trade a B or C setup. Statistics say these lose money over time.",
  },
  {
    id: "not_fomo",
    category: "Emotion",
    question: "Am I entering because the setup is valid — NOT because I'm afraid of missing out?",
    yesLabel: "Setup-driven entry",
    noLabel: "I might be chasing",
    weight: 3,
    failWarning: "FOMO entries are almost always losers. The market will give you another chance.",
  },
  {
    id: "not_bored",
    category: "Emotion",
    question: "Am I trading because there's genuinely an opportunity — not out of boredom or restlessness?",
    yesLabel: "Genuine opportunity",
    noLabel: "I'm a bit bored / antsy",
    weight: 2,
    failWarning: "Boredom trading erodes accounts slowly. Close the platform and take a break.",
  },
  {
    id: "stop_defined",
    category: "Risk",
    question: "Do I know EXACTLY where my stop loss is before entering?",
    yesLabel: "Stop is defined",
    noLabel: "I'll figure it out",
    weight: 3,
    failWarning: "Never enter a trade without a predefined stop. This is non-negotiable.",
  },
  {
    id: "risk_acceptable",
    category: "Risk",
    question: "Is my position size within my max daily risk limit?",
    yesLabel: "Yes, within limits",
    noLabel: "I want to size up",
    weight: 2,
    failWarning: "Oversizing is how traders blow accounts. Stick to your rules.",
  },
  {
    id: "not_revenge",
    category: "Mental",
    question: "Am I in a calm, neutral state — NOT trying to recover a recent loss?",
    yesLabel: "Clear headspace",
    noLabel: "Still stinging from a loss",
    weight: 3,
    failWarning: "Revenge trading is the #1 account killer. Walk away and reset.",
  },
  {
    id: "target_defined",
    category: "Risk",
    question: "Do I have a clear target / exit plan for this trade?",
    yesLabel: "Exit plan is set",
    noLabel: "I'll see how it goes",
    weight: 1,
    failWarning: "Hope is not a strategy. Know your exit before your entry.",
  },
];

const categoryColors = {
  Setup: { bg: "rgba(104,155,251,0.15)", border: "rgba(104,155,251,0.35)", text: "rgb(104,155,251)" },
  Emotion: { bg: "rgba(130,100,220,0.15)", border: "rgba(130,100,220,0.35)", text: "rgb(160,130,255)" },
  Risk: { bg: "rgba(220,80,80,0.15)", border: "rgba(220,80,80,0.3)", text: "rgb(220,100,100)" },
  Mental: { bg: "rgba(72,199,142,0.15)", border: "rgba(72,199,142,0.35)", text: "rgb(72,199,142)" },
};

function ScoreGauge({ score, max }) {
  const pct = (score / max) * 100;
  const isGo = pct >= 85;
  const isCaution = pct >= 65 && pct < 85;
  const color = isGo ? "rgba(72,199,142,1)" : isCaution ? "rgba(255,180,50,1)" : "rgba(220,80,80,1)";
  const label = isGo ? "GO" : isCaution ? "CAUTION" : "NO-GO";
  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - pct / 100) }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div className="text-2xl font-bold" style={{ color }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.3 }}>
            {Math.round(pct)}%
          </motion.div>
        </div>
      </div>
      <motion.div className="text-xl font-bold tracking-widest" style={{ color }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {label}
      </motion.div>
    </div>
  );
}

export default function PreTradePage() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState("gate"); // gate | result
  const [recentTrades, setRecentTrades] = useState([]);

  useEffect(() => {
    base44.entities.TradeJournal.list("-created_date", 5).then(setRecentTrades);
  }, []);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === GATE_QUESTIONS.length;

  const totalWeight = GATE_QUESTIONS.reduce((s, q) => s + q.weight, 0);
  const score = GATE_QUESTIONS.reduce((s, q) => s + (answers[q.id] === true ? q.weight : 0), 0);
  const pct = allAnswered ? Math.round((score / totalWeight) * 100) : 0;
  const isGo = pct >= 85;
  const isCaution = pct >= 65;
  const failedQuestions = GATE_QUESTIONS.filter((q) => answers[q.id] === false);

  // Recent loss streak
  const streak = (() => {
    let count = 0;
    for (const t of recentTrades) {
      if (t.outcome === "loss") count++;
      else break;
    }
    return count;
  })();

  const handleAnswer = (id, val) => {
    setAnswers((a) => ({ ...a, [id]: val }));
  };

  const handleReset = () => {
    setAnswers({});
    setStep("gate");
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Pre-Trade Gate"
        subtitle="Run this checklist before every single trade"
      />

      {/* Loss streak warning */}
      {streak >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[18px] p-4 border flex items-start gap-3"
          style={{ background: "rgba(220,80,80,0.15)", borderColor: "rgba(220,80,80,0.4)" }}
        >
          <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm text-red-400">⚠️ Circuit Breaker Active</div>
            <div className="text-xs text-[rgba(var(--muted),0.8)] mt-0.5">
              You have {streak} consecutive losses. Your rules say to stop trading. Close the platform, reset your mind, and come back tomorrow.
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "gate" ? (
          <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-[rgba(var(--muted),0.65)]">{answered} of {GATE_QUESTIONS.length} answered</div>
              <div className="h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, rgba(104,155,251,1), rgba(121,113,249,1))" }} animate={{ width: `${(answered / GATE_QUESTIONS.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>

            <div className="space-y-3">
              {GATE_QUESTIONS.map((q, idx) => {
                const ans = answers[q.id];
                const cfg = categoryColors[q.category];
                const isAnswered = ans !== undefined;
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`glass rounded-[18px] p-4 sm:p-5 transition-all ${isAnswered && ans === false ? "border-red-400/30" : isAnswered && ans === true ? "border-green-400/25" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 mt-0.5 border"
                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
                        {q.category}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium leading-snug mb-3">{q.question}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAnswer(q.id, true)}
                            className={`flex-1 py-2.5 rounded-[13px] text-xs font-semibold cursor-pointer transition-all border flex items-center justify-center gap-1.5`}
                            style={ans === true ? { background: "rgba(72,199,142,0.3)", borderColor: "rgba(72,199,142,0.6)", color: "rgb(72,199,142)" } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
                          >
                            <CheckCircle2 size={13} /> {q.yesLabel}
                          </button>
                          <button
                            onClick={() => handleAnswer(q.id, false)}
                            className={`flex-1 py-2.5 rounded-[13px] text-xs font-semibold cursor-pointer transition-all border flex items-center justify-center gap-1.5`}
                            style={ans === false ? { background: "rgba(220,80,80,0.25)", borderColor: "rgba(220,80,80,0.5)", color: "rgb(220,100,100)" } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
                          >
                            <XCircle size={13} /> {q.noLabel}
                          </button>
                        </div>
                        {ans === false && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-red-400 flex items-start gap-1.5">
                            <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
                            {q.failWarning}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {allAnswered && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <motion.button
                  onClick={() => setStep("result")}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-[18px] font-bold text-base shimmer cursor-pointer btn-primary flex items-center justify-center gap-2"
                >
                  See My Verdict <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass rounded-[24px] p-6 sm:p-8">
              <ScoreGauge score={score} max={totalWeight} />

              <div className="mt-6 text-center">
                {isGo ? (
                  <div>
                    <div className="font-bold text-lg mb-1 text-green-500">You're cleared to trade.</div>
                    <div className="text-sm text-[rgba(var(--muted),0.8)]">Your checklist looks solid. Stay disciplined, stick to your plan, and accept whatever outcome comes from good execution.</div>
                  </div>
                ) : isCaution ? (
                  <div>
                    <div className="font-bold text-lg mb-1 text-yellow-500">Proceed with caution.</div>
                    <div className="text-sm text-[rgba(var(--muted),0.8)]">Some flags were raised. Consider reducing your size or waiting for a cleaner setup before entering.</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-lg mb-1 text-red-400">Do not take this trade.</div>
                    <div className="text-sm text-[rgba(var(--muted),0.8)]">Multiple red flags detected. The professional move is to wait. Close the platform if needed.</div>
                  </div>
                )}
              </div>

              {failedQuestions.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  <div className="text-xs font-semibold text-[rgba(var(--muted),0.65)] mb-3 uppercase tracking-wider">Red Flags to Address</div>
                  <div className="space-y-2">
                    {failedQuestions.map((q) => (
                      <div key={q.id} className="flex items-start gap-2">
                        <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-[rgba(var(--muted),0.8)]">{q.failWarning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 w-full py-3 rounded-[14px] glass cursor-pointer flex items-center justify-center gap-2 text-sm font-medium"
              >
                <RotateCcw size={14} /> Run Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}