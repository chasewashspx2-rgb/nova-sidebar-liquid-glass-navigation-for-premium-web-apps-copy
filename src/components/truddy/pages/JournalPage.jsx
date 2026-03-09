import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, TrendingUp, TrendingDown, Minus, BookOpen, Brain, PenLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MoodBadge, emotionConfig } from "@/components/truddy/MoodBadge";
import { SectionHeader } from "@/components/truddy/SectionHeader";

const EMOTIONS = ["focused", "confident", "anxious", "neutral", "fomo", "angry", "excited", "tired"];
const POST_EMOTIONS = [...EMOTIONS, "regret", "proud"];
const VIOLATIONS = ["Revenge traded", "Oversized position", "Ignored stop loss", "Chased entry", "Exited too early", "Traded news", "Over-traded", "FOMO entry"];

function TradeForm({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    symbol: "", direction: "long", outcome: "win", pnl: "", pre_emotion: "neutral", post_emotion: "neutral",
    followed_rules: "yes", violations: [], notes: "", lesson: "", discipline_score: 7,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleViolation = (v) => set("violations", form.violations.includes(v) ? form.violations.filter((x) => x !== v) : [...form.violations, v]);

  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className="glass rounded-[24px] p-5 sm:p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <div className="font-semibold text-base">Log a Trade</div>
        <button onClick={onCancel} className="w-8 h-8 rounded-full glass grid place-items-center cursor-pointer"><X size={15} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Symbol */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Symbol / Instrument</label>
          <input value={form.symbol} onChange={(e) => set("symbol", e.target.value.toUpperCase())} placeholder="e.g. NQ, AAPL, BTC" className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        </div>

        {/* Direction */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Direction</label>
          <div className="flex gap-2">
            {["long", "short"].map((d) => (
              <button key={d} onClick={() => set("direction", d)} className={`flex-1 py-2.5 rounded-[14px] text-sm font-medium cursor-pointer transition-all capitalize ${form.direction === d ? "text-white" : "glass"}`}
                style={form.direction === d ? { background: d === "long" ? "rgba(72,199,142,0.7)" : "rgba(220,80,80,0.7)", border: "1px solid rgba(255,255,255,0.3)" } : {}}>
                {d === "long" ? "▲ Long" : "▼ Short"}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Outcome</label>
          <div className="flex gap-2">
            {["win", "loss", "breakeven"].map((o) => (
              <button key={o} onClick={() => set("outcome", o)} className={`flex-1 py-2.5 rounded-[14px] text-xs font-medium cursor-pointer transition-all capitalize ${form.outcome === o ? "text-white" : "glass"}`}
                style={form.outcome === o ? { background: o === "win" ? "rgba(72,199,142,0.7)" : o === "loss" ? "rgba(220,80,80,0.7)" : "rgba(160,172,195,0.5)", border: "1px solid rgba(255,255,255,0.3)" } : {}}>
                {o === "win" ? "✓ Win" : o === "loss" ? "✗ Loss" : "= B/E"}
              </button>
            ))}
          </div>
        </div>

        {/* P&L */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">P&L ($)</label>
          <input type="number" value={form.pnl} onChange={(e) => set("pnl", e.target.value)} placeholder="e.g. 350 or -120" className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        </div>

        {/* Pre emotion */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Emotion Before</label>
          <select
            value={form.pre_emotion}
            onChange={(e) => set("pre_emotion", e.target.value)}
            className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "inherit" }}
          >
            {EMOTIONS.map((e) => {
              const cfg = emotionConfig[e];
              return <option key={e} value={e}>{cfg.emoji} {cfg.label}</option>;
            })}
          </select>
        </div>

        {/* Post emotion */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Emotion After</label>
          <select
            value={form.post_emotion}
            onChange={(e) => set("post_emotion", e.target.value)}
            className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "inherit" }}
          >
            {POST_EMOTIONS.map((e) => {
              const cfg = emotionConfig[e];
              return <option key={e} value={e}>{cfg.emoji} {cfg.label}</option>;
            })}
          </select>
        </div>

        {/* Followed rules */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Followed Your Rules?</label>
          <div className="flex gap-2">
            {["yes", "partially", "no"].map((r) => (
              <button key={r} onClick={() => set("followed_rules", r)} className={`flex-1 py-2.5 rounded-[14px] text-xs font-medium cursor-pointer capitalize transition-all ${form.followed_rules === r ? "text-white" : "glass"}`}
                style={form.followed_rules === r ? { background: r === "yes" ? "rgba(72,199,142,0.7)" : r === "partially" ? "rgba(255,180,50,0.7)" : "rgba(220,80,80,0.7)", border: "1px solid rgba(255,255,255,0.3)" } : {}}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Discipline score */}
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Discipline Score: {form.discipline_score}/10</label>
          <input type="range" min={1} max={10} value={form.discipline_score} onChange={(e) => set("discipline_score", Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
        </div>

        {/* Violations (shown if not fully followed) */}
        {form.followed_rules !== "yes" && (
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Rule Violations</label>
            <div className="flex flex-wrap gap-1.5">
              {VIOLATIONS.map((v) => (
                <button key={v} onClick={() => toggleViolation(v)} className={`px-2 py-1 rounded-full text-xs cursor-pointer transition-all border`}
                  style={form.violations.includes(v) ? { background: "rgba(220,80,80,0.25)", borderColor: "rgba(220,80,80,0.5)", color: "rgb(220,80,80)" } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes & Lesson */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Trade Notes</label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="What happened? What did you see?" rows={3} className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none resize-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        </div>
        <div>
          <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Key Lesson</label>
          <textarea value={form.lesson} onChange={(e) => set("lesson", e.target.value)} placeholder="What's the one thing you'll take away?" rows={3} className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none resize-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="btn-secondary cursor-pointer text-sm">Cancel</button>
        <motion.button onClick={() => onSubmit(form)} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="btn-primary shimmer cursor-pointer text-sm flex items-center gap-2">
          <BookOpen size={14} /> Log Trade
        </motion.button>
      </div>
    </motion.div>
  );
}

function MindJournalTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", emotion: "neutral" });
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.MindJournal.list("-created_date", 50).then((e) => { setEntries(e); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    await base44.entities.MindJournal.create(form);
    setForm({ title: "", content: "", emotion: "neutral" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary shimmer cursor-pointer flex items-center gap-2 text-sm">
          <PenLine size={15} /> New Entry
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }} className="glass rounded-[24px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-base">Psychology Entry</div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full glass grid place-items-center cursor-pointer"><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">Title (optional)</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Feeling the urge to revenge trade..." className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
              </div>
              <div>
                <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">How are you feeling right now?</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(emotionConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, emotion: key }))} className="px-2 py-1 rounded-full text-xs cursor-pointer transition-all border"
                      style={form.emotion === key ? { background: cfg.color, borderColor: cfg.border } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
                      {cfg.emoji} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[rgba(var(--muted),0.75)] mb-1 block">What's on your mind?</label>
                <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write freely — no trade required. What are you thinking, feeling, processing?" rows={5} className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none resize-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary cursor-pointer text-sm">Cancel</button>
              <motion.button onClick={handleSubmit} disabled={saving || !form.content.trim()} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="btn-primary shimmer cursor-pointer text-sm flex items-center gap-2 disabled:opacity-50">
                <Brain size={14} /> {saving ? "Saving..." : "Save Entry"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12 text-[rgba(var(--muted),0.5)] text-sm">Loading entries...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 glass rounded-[24px]">
          <Brain size={40} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm text-[rgba(var(--muted),0.6)]">No psychology entries yet. Write what's on your mind.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="glass rounded-[18px] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  {entry.title && <div className="font-semibold text-sm mb-0.5">{entry.title}</div>}
                  <div className="text-xs text-[rgba(var(--muted),0.55)]">{new Date(entry.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                {entry.emotion && <MoodBadge emotion={entry.emotion} />}
              </div>
              <p className="text-sm text-[rgba(var(--text),0.8)] leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const [tab, setTab] = useState("trades");
  const [trades, setTrades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => base44.entities.TradeJournal.list("-created_date", 50).then((t) => { setTrades(t); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (form) => {
    await base44.entities.TradeJournal.create({ ...form, pnl: form.pnl ? Number(form.pnl) : null });
    setShowForm(false);
    load();
  };

  const filtered = filter === "all" ? trades : trades.filter((t) => t.outcome === filter);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Trade Journal"
        subtitle="Log trades, track emotions, build self-awareness"
        action={tab === "trades" ? (
          <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary shimmer cursor-pointer flex items-center gap-2 text-sm">
            <Plus size={15} /> Log Trade
          </motion.button>
        ) : null}
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("trades")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${tab === "trades" ? "btn-primary" : "pill"}`}>
          <BookOpen size={14} /> Trades
        </button>
        <button onClick={() => setTab("mind")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${tab === "mind" ? "btn-primary" : "pill"}`}>
          <Brain size={14} /> My Mind
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "trades" ? (
          <motion.div key="trades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <AnimatePresence>
              {showForm && <TradeForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {["all", "win", "loss", "breakeven"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all capitalize ${filter === f ? "btn-primary" : "pill"}`}>
                  {f === "all" ? "All Trades" : f === "win" ? "✓ Wins" : f === "loss" ? "✗ Losses" : "= Breakeven"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-[rgba(var(--muted),0.5)] text-sm">Loading trades...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 glass rounded-[24px]">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <div className="text-sm text-[rgba(var(--muted),0.6)]">No trades yet. Click "Log Trade" to start building your journal.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((trade, idx) => (
                  <motion.div key={trade.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="glass rounded-[18px] p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[13px] grid place-items-center font-bold text-sm flex-shrink-0 ${trade.outcome === "win" ? "bg-green-400/20 text-green-500" : trade.outcome === "loss" ? "bg-red-400/20 text-red-400" : "bg-gray-400/15 text-gray-500"}`}>
                          {trade.outcome === "win" ? <TrendingUp size={18} /> : trade.outcome === "loss" ? <TrendingDown size={18} /> : <Minus size={18} />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{trade.symbol || "—"} <span className="text-xs font-normal text-[rgba(var(--muted),0.7)] ml-1 capitalize">{trade.direction}</span></div>
                          <div className="text-xs text-[rgba(var(--muted),0.65)] mt-0.5">{new Date(trade.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        {trade.pre_emotion && <MoodBadge emotion={trade.pre_emotion} />}
                        <div className={`font-semibold text-sm ${trade.pnl > 0 ? "text-green-500" : trade.pnl < 0 ? "text-red-400" : ""}`}>
                          {trade.pnl != null ? `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl}` : "—"}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trade.followed_rules === "yes" ? "bg-green-400/15 text-green-500" : trade.followed_rules === "no" ? "bg-red-400/15 text-red-400" : "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400"}`}>
                          {trade.followed_rules === "yes" ? "✓ Rules" : trade.followed_rules === "no" ? "✗ Broke rules" : "~ Partial"}
                        </span>
                        {trade.discipline_score && <span className="text-xs pill">{trade.discipline_score}/10</span>}
                      </div>
                    </div>
                    {(trade.notes || trade.lesson || (trade.violations && trade.violations.length > 0)) && (
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {trade.notes && <div className="text-xs text-[rgba(var(--muted),0.8)]"><span className="font-medium text-[rgba(var(--text),0.7)]">Notes:</span> {trade.notes}</div>}
                        {trade.lesson && <div className="text-xs text-[rgba(var(--muted),0.8)]"><span className="font-medium text-[rgba(var(--text),0.7)]">Lesson:</span> {trade.lesson}</div>}
                        {trade.violations && trade.violations.length > 0 && (
                          <div className="sm:col-span-2 flex flex-wrap gap-1.5">
                            {trade.violations.map((v) => <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/15 text-red-400 border border-red-400/25">{v}</span>)}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="mind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MindJournalTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}