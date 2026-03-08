import React from "react";
import { motion } from "framer-motion";

export function StatCard({ label, value, sub, accent, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-[rgba(var(--muted),0.85)] font-medium">{label}</div>
        {icon && (
          <div className="w-8 h-8 rounded-[12px] grid place-items-center flex-shrink-0"
            style={{ background: "rgba(104,155,251,0.15)", border: "1px solid rgba(104,155,251,0.25)" }}>
            {icon}
          </div>
        )}
      </div>
      <div className={`mt-2 text-[26px] sm:text-[30px] leading-none font-semibold tracking-tight ${accent ? "text-[rgb(var(--accent))]" : ""}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-[rgba(var(--muted),0.75)]">{sub}</div>}
    </motion.div>
  );
}