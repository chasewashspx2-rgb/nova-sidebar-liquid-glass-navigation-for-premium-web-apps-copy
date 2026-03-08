import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Award } from "lucide-react";

export default function SessionAnalysis({ session }) {
  if (!session.summary) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4">

      {/* Summary */}
      <motion.div variants={itemVariants} className="rounded-[20px] p-5"
        style={{ background: "rgba(var(--glass),0.28)", border: "1px solid rgba(255,255,255,0.25)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-blue-500" />
          <h3 className="font-semibold text-sm">Session Summary</h3>
        </div>
        <p className="text-sm leading-relaxed opacity-85">{session.summary}</p>
      </motion.div>

      {/* Overall Score */}
      {session.overall_score && (
        <motion.div variants={itemVariants} className="rounded-[20px] p-5"
          style={{ background: "rgba(var(--glass),0.28)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h3 className="font-semibold text-sm">Discipline Score</h3>
            </div>
            <span className="text-2xl font-bold text-amber-500">{session.overall_score.toFixed(1)}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${(session.overall_score / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Patterns */}
      {session.patterns && session.patterns.length > 0 && (
        <motion.div variants={itemVariants} className="rounded-[20px] p-5"
          style={{ background: "rgba(var(--glass),0.28)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-purple-500" />
            <h3 className="font-semibold text-sm">Detected Patterns</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {session.patterns.map((pattern, i) => (
              <motion.li key={i} variants={itemVariants}
                className="flex items-start gap-2 text-sm opacity-85">
                <span className="text-purple-500 flex-shrink-0 mt-1">•</span>
                <span>{pattern}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {session.recommendations && session.recommendations.length > 0 && (
        <motion.div variants={itemVariants} className="rounded-[20px] p-5"
          style={{ background: "rgba(var(--glass),0.28)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-green-500" />
            <h3 className="font-semibold text-sm">Recommendations</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {session.recommendations.map((rec, i) => (
              <motion.li key={i} variants={itemVariants}
                className="flex items-start gap-2 text-sm opacity-85">
                <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                <span>{rec}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}