import React from "react";
import { motion } from "framer-motion";

export function SectionHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6"
    >
      <div>
        <div className="text-[22px] sm:text-[26px] font-bold tracking-tight">{title}</div>
        {subtitle && <div className="text-sm text-[rgba(var(--muted),0.85)] mt-0.5">{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}