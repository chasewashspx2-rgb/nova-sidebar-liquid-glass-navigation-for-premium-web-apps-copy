import React from "react";

const emotionConfig = {
  focused: { emoji: "🎯", label: "Focused", color: "rgba(104,155,251,0.25)", border: "rgba(104,155,251,0.45)" },
  confident: { emoji: "💪", label: "Confident", color: "rgba(72,199,142,0.25)", border: "rgba(72,199,142,0.45)" },
  anxious: { emoji: "😰", label: "Anxious", color: "rgba(255,180,80,0.25)", border: "rgba(255,180,80,0.45)" },
  neutral: { emoji: "😐", label: "Neutral", color: "rgba(160,172,195,0.2)", border: "rgba(160,172,195,0.35)" },
  fomo: { emoji: "🔥", label: "FOMO", color: "rgba(255,100,80,0.25)", border: "rgba(255,100,80,0.45)" },
  angry: { emoji: "😤", label: "Angry", color: "rgba(220,60,60,0.25)", border: "rgba(220,60,60,0.45)" },
  excited: { emoji: "⚡", label: "Excited", color: "rgba(250,210,60,0.25)", border: "rgba(250,210,60,0.45)" },
  tired: { emoji: "😴", label: "Tired", color: "rgba(130,100,220,0.25)", border: "rgba(130,100,220,0.45)" },
  regret: { emoji: "😞", label: "Regret", color: "rgba(180,80,80,0.2)", border: "rgba(180,80,80,0.35)" },
  proud: { emoji: "🌟", label: "Proud", color: "rgba(255,200,50,0.25)", border: "rgba(255,200,50,0.45)" },
};

export function MoodBadge({ emotion, size = "sm" }) {
  const cfg = emotionConfig[emotion] || emotionConfig.neutral;
  const padding = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{ background: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </span>
  );
}

export { emotionConfig };