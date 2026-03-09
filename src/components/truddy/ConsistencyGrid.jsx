import React from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, isToday } from "date-fns";

export default function ConsistencyGrid({ trades = [], sessions = [] }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start: Monday=0 offset
  const startPad = (getDay(monthStart) + 6) % 7; // Mon-based

  const getActivity = (date) => {
    const key = format(date, "yyyy-MM-dd");
    const hasTrade   = trades.some(t => (t.date || t.created_date || "").startsWith(key));
    const hasSession = sessions.some(s => (s.started_at || "").startsWith(key));
    return { hasTrade, hasSession, count: [hasTrade, hasSession].filter(Boolean).length };
  };

  const activeDays  = days.filter(d => getActivity(d).count > 0).length;
  const perfectDays = days.filter(d => getActivity(d).count === 2).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="glass rounded-[20px] sm:rounded-[24px] p-4 sm:p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-sm">Consistency Tracker</div>
          <div className="text-[11px] text-[rgba(var(--muted),0.55)] mt-0.5">{format(today, "MMMM yyyy")}</div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-center">
            <div className="font-bold text-[rgb(var(--text))]">{activeDays}</div>
            <div className="text-[10px] text-[rgba(var(--muted),0.5)]">active</div>
          </div>
          <div className="w-px h-6 bg-[rgba(var(--muted),0.15)]" />
          <div className="text-center">
            <div className="font-bold" style={{ color: "rgba(104,155,251,0.9)" }}>{perfectDays}</div>
            <div className="text-[10px] text-[rgba(var(--muted),0.5)]">perfect</div>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="text-[10px] text-center text-[rgba(var(--muted),0.4)] font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty pads */}
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}

        {/* Day cells */}
        {days.map((day, i) => {
          const { hasTrade, hasSession, count } = getActivity(day);
          const todayDay = isToday(day);

          const bgStyle = count === 2
            ? { background: "linear-gradient(135deg, rgba(104,155,251,0.3) 0%, rgba(121,113,249,0.18) 100%)", border: "1px solid rgba(104,155,251,0.4)" }
            : count === 1
            ? { background: "rgba(104,155,251,0.12)", border: "1px solid rgba(104,155,251,0.2)" }
            : { background: "rgba(var(--glass),0.18)", border: "1px solid rgba(255,255,255,0.1)" };

          return (
            <motion.div key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008 }}
              className="relative rounded-[10px] aspect-square flex flex-col items-center justify-center gap-0.5 group cursor-default"
              style={bgStyle}>

              {/* Date number */}
              <div className={`text-[11px] font-semibold leading-none ${todayDay ? "text-[rgb(104,155,251)]" : count > 0 ? "text-[rgb(var(--text))]" : "text-[rgba(var(--muted),0.45)]"}`}>
                {format(day, "d")}
              </div>

              {/* Activity dots */}
              {count > 0 && (
                <div className="flex items-center gap-[3px]">
                  {hasTrade   && <div className="w-1 h-1 rounded-full" style={{ background: "rgba(104,155,251,0.9)" }} />}
                  {hasSession && <div className="w-1 h-1 rounded-full" style={{ background: "rgba(121,113,249,0.9)" }} />}
                </div>
              )}

              {/* Today ring */}
              {todayDay && <div className="absolute inset-0 rounded-[10px] ring-1 ring-[rgba(104,155,251,0.6)]" />}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-[12px] text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                style={{ background: "linear-gradient(135deg, rgba(30,25,55,0.97) 0%, rgba(20,30,60,0.97) 100%)", border: "1px solid rgba(104,155,251,0.35)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                <div className="font-bold text-white mb-1.5">{format(day, "EEEE, MMM d")}</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasTrade ? "bg-[rgba(104,155,251,1)]" : "bg-[rgba(255,255,255,0.15)]"}`} />
                    <span className={hasTrade ? "text-[rgba(104,155,251,0.95)]" : "text-[rgba(255,255,255,0.3)]"}>Trade Journal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasSession ? "bg-[rgba(121,113,249,1)]" : "bg-[rgba(255,255,255,0.15)]"}`} />
                    <span className={hasSession ? "text-[rgba(180,165,255,0.95)]" : "text-[rgba(255,255,255,0.3)]"}>Live Session</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-end">
        {[
          { label: "No activity", bg: "rgba(var(--glass),0.3)", border: "rgba(255,255,255,0.12)" },
          { label: "1 activity",  bg: "rgba(104,155,251,0.2)",  border: "rgba(104,155,251,0.25)" },
          { label: "Both",        bg: "rgba(104,155,251,0.45)", border: "rgba(104,155,251,0.5)"  },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-[3px]" style={{ background: l.bg, border: `1px solid ${l.border}` }} />
            <span className="text-[9px] text-[rgba(var(--muted),0.45)]">{l.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}