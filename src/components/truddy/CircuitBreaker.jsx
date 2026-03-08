import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ShieldOff } from "lucide-react";

export function CircuitBreaker({ trades, maxLosses = 2, onDismiss }) {
  // Count consecutive losses from most recent
  let streak = 0;
  for (const t of trades) {
    if (t.outcome === "loss") streak++;
    else break;
  }

  if (streak < maxLosses) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="rounded-[20px] p-4 sm:p-5 border relative overflow-hidden"
        style={{ background: "rgba(220,60,60,0.18)", borderColor: "rgba(220,60,60,0.45)" }}
      >
        {/* Subtle pulse background */}
        <motion.div
          className="absolute inset-0 rounded-[20px]"
          animate={{ opacity: [0, 0.12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 20% 50%, rgba(220,60,60,0.4), transparent 60%)" }}
        />
        <div className="relative flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ShieldOff size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          </motion.div>
          <div className="flex-1">
            <div className="font-bold text-sm text-red-400 mb-0.5">
              Circuit Breaker — {streak} Consecutive Losses
            </div>
            <div className="text-xs text-[rgba(var(--muted),0.85)] leading-relaxed">
              Your rules require you to stop trading now. Revenge trading after a losing streak is statistically devastating.
              Close the platform, take a walk, and come back with a clear head.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Take a 30-min break", "Review what went wrong", "Come back tomorrow"].map((a, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full border font-medium" style={{ background: "rgba(220,60,60,0.15)", borderColor: "rgba(220,60,60,0.35)", color: "rgb(220,100,100)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="w-7 h-7 rounded-full glass grid place-items-center cursor-pointer flex-shrink-0 text-[rgba(var(--muted),0.5)]">
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}