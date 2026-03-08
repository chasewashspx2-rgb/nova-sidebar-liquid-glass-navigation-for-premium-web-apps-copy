import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "The market rewards discipline, not brilliance.",
  "Process over profits — every single day.",
  "Your edge means nothing without consistency.",
  "Protect your capital. Protect your mind.",
  "Patience is the most underrated trading skill.",
  "Trade the plan. Plan the trade.",
  "Emotions are data, not directions.",
  "Small losses are tuition. Big losses are disasters.",
  "The best traders are the best losers.",
  "Confidence comes from preparation, not prediction.",
  "One bad trade can't hurt you. One bad habit can.",
  "Mastery is built in the boring sessions.",
];

export default function RotatingQuote() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-5 overflow-hidden relative mt-0.5">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-sm font-medium text-[rgba(var(--muted),0.75)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]"
        >
          {QUOTES[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}