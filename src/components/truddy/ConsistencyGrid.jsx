import React from "react";
import { motion } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";

// 28-day habit grid — colored cells per activity logged that day
export default function ConsistencyGrid({ trades = [], moodChecks = [], sessions = [] }) {
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = subDays(new Date(), 27 - i);
    const key = format(date, "yyyy-MM-dd");
    const hasTrade   = trades.some(t => (t.date || t.created_date || "").startsWith(key));
    const hasMood    = moodChecks.some(m => (m.date || "").startsWith(key));
    const hasSession = sessions.some(s => (s.started_at || "").startsWith(key));
    const count = [hasTrade, hasMood, hasSession].filter(Boolean).length;
    return { key, date, count, hasTrade, hasMood, hasSession, label: format(date, "MMM d") };
  });

  const cellColor = (count) => {
    if (count === 3) return { bg: "rgba(104,155,251,0.85)", border: "rgba(104,155,251,0.6)" };
    if (count === 2) return { bg: "rgba(104,155,251,0.45)", border: "rgba(104,155,251,0.35)" };
    if (count === 1) return { bg: "rgba(104,155,251,0.18)", border: "rgba(104,155,251,0.2)" };
    return { bg: "rgba(var(--glass),0.2)", border: "rgba(255,255,255,0.12)" };
  };

  const activeDays = days.filter(d => d.count > 0).length;
  const perfectDays = days.filter(d => d.count === 3).length;

  return (
    <div className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-sm">Consistency Tracker</div>
          <div className="text-[11px] text-[rgba(var(--muted),0.6)] mt-0.5">Last 28 days · Journal · Mood · Session</div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[rgba(var(--muted),0.6)]"><span className="font-bold text-[rgb(var(--text))]">{activeDays}</span> active</span>
          <span className="text-[rgba(var(--muted),0.6)]"><span className="font-bold text-[rgba(104,155,251,0.9)]">{perfectDays}</span> perfect</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-[10px] text-center text-[rgba(var(--muted),0.4)] font-medium pb-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const { bg, border } = cellColor(day.count);
          return (
            <motion.div key={day.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.012 }}
              title={`${day.label}: ${day.count}/3 activities`}
              className="aspect-square rounded-[6px] cursor-default relative group"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-[10px] text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                style={{ background: "rgba(15,20,35,0.92)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="font-semibold">{day.label}</div>
                <div className="text-[rgba(255,255,255,0.6)] mt-0.5">
                  {day.hasTrade ? "✓" : "·"} Trade  {day.hasMood ? "✓" : "·"} Mood  {day.hasSession ? "✓" : "·"} Session
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 justify-end">
        {[
          { label: "None",   bg: "rgba(var(--glass),0.3)", border: "rgba(255,255,255,0.15)" },
          { label: "1",      bg: "rgba(104,155,251,0.18)", border: "rgba(104,155,251,0.2)" },
          { label: "2",      bg: "rgba(104,155,251,0.45)", border: "rgba(104,155,251,0.35)" },
          { label: "All 3",  bg: "rgba(104,155,251,0.85)", border: "rgba(104,155,251,0.6)" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-[3px]" style={{ background: l.bg, border: `1px solid ${l.border}` }} />
            <span className="text-[9px] text-[rgba(var(--muted),0.45)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}