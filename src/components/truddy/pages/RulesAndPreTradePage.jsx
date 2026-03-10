import React, { useState } from "react";
import { motion } from "framer-motion";
import RulesPage from "./RulesPage";
import PreTradePage from "./PreTradePage";

export default function RulesAndPreTradePage({ onNavigate }) {
  const [tab, setTab] = useState("rules");

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-[16px] mb-5 w-fit"
        style={{ background: "rgba(0,0,0,0.06)" }}>
        {[
          { key: "rules", label: "My Rules" },
          { key: "pretrade", label: "Pre-Trade Gate" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-4 py-1.5 rounded-[12px] text-sm font-medium transition-colors cursor-pointer"
            style={{ color: tab === t.key ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)" }}
          >
            {tab === t.key && (
              <motion.div
                layoutId="rules-pretrade-tab"
                className="absolute inset-0 rounded-[12px] bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "rules" ? (
        <RulesPage onNavigate={onNavigate} />
      ) : (
        <PreTradePage onNavigate={onNavigate} />
      )}
    </div>
  );
}