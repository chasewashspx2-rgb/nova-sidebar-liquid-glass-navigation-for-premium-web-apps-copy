import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Shield, AlertTriangle, CheckCircle2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader } from "@/components/truddy/SectionHeader";

const CATEGORIES = ["entry", "risk", "exit", "mental", "sizing"];
const categoryConfig = {
  entry: { label: "Entry", color: "rgba(104,155,251,0.25)", border: "rgba(104,155,251,0.45)", emoji: "🎯" },
  risk: { label: "Risk Mgmt", color: "rgba(220,80,80,0.2)", border: "rgba(220,80,80,0.4)", emoji: "🛡️" },
  exit: { label: "Exit", color: "rgba(72,199,142,0.2)", border: "rgba(72,199,142,0.4)", emoji: "🚪" },
  mental: { label: "Mental", color: "rgba(130,100,220,0.2)", border: "rgba(130,100,220,0.4)", emoji: "🧠" },
  sizing: { label: "Sizing", color: "rgba(255,180,50,0.2)", border: "rgba(255,180,50,0.4)", emoji: "📏" },
};

const defaultRules = [
  { title: "Only trade A+ setups", description: "If the setup doesn't meet all my criteria, I don't take it. Period.", category: "entry" },
  { title: "Max 2% risk per trade", description: "Never risk more than 2% of my account on any single trade.", category: "risk" },
  { title: "Honor all stop losses", description: "Once my stop is set, I never move it wider. I accept the loss.", category: "risk" },
  { title: "No trading after 2 losses", description: "If I have two consecutive losses, I close the platform and walk away.", category: "mental" },
  { title: "Scale out at first target", description: "Always take partial profits at the first target to reduce pressure.", category: "exit" },
  { title: "No revenge trading", description: "If I'm angry or frustrated, I step away. Markets will always be there.", category: "mental" },
];

function RuleForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: "", description: "", category: "entry" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="glass rounded-[20px] p-4 sm:p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-sm">Add New Rule</div>
        <button onClick={onCancel} className="w-7 h-7 rounded-full glass grid place-items-center cursor-pointer"><X size={13} /></button>
      </div>
      <div className="space-y-3">
        <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Rule title (short and memorable)" className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe this rule in detail — be specific." rows={2} className="w-full glass rounded-[14px] px-3 py-2.5 text-sm bg-transparent outline-none resize-none placeholder:text-[rgba(var(--muted),0.4)] focus:ring-2 focus:ring-[rgba(var(--accent),0.3)]" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const cfg = categoryConfig[c];
            return (
              <button key={c} onClick={() => set("category", c)} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border`}
                style={form.category === c ? { background: cfg.color, borderColor: cfg.border } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary cursor-pointer text-sm">Cancel</button>
          <motion.button onClick={() => onSubmit(form)} disabled={!form.title} whileHover={form.title ? { scale: 1.03 } : {}} whileTap={form.title ? { scale: 0.97 } : {}} className={`btn-primary cursor-pointer text-sm flex items-center gap-2 ${!form.title ? "opacity-50" : "shimmer"}`}>
            <Shield size={13} /> Add Rule
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [checkedRules, setCheckedRules] = useState({});

  const load = () => base44.entities.TradingRule.list().then((r) => { setRules(r); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleRuleCompliance = async (rule, followed) => {
    const newViolationCount = !followed ? (rule.violation_count || 0) + 1 : Math.max(0, (rule.violation_count || 0) - 1);
    await base44.entities.TradingRule.update(rule.id, { violation_count: newViolationCount });
    setCheckedRules(prev => ({ ...prev, [rule.id]: followed }));
    load();
  };

  const handleAdd = async (form) => {
    await base44.entities.TradingRule.create({ ...form, is_active: true, violation_count: 0 });
    setShowForm(false);
    load();
  };

  const handleToggle = async (rule) => {
    await base44.entities.TradingRule.update(rule.id, { is_active: !rule.is_active });
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.TradingRule.delete(id);
    load();
  };

  const handleSeedDefaults = async () => {
    await base44.entities.TradingRule.bulkCreate(defaultRules.map(r => ({ ...r, is_active: true, violation_count: 0 })));
    load();
  };

  const filtered = activeCategory === "all" ? rules : rules.filter((r) => r.category === activeCategory);
  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="My Trading Rules"
        subtitle="Your personal playbook — the laws you trade by"
        action={
          <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary shimmer cursor-pointer flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Rule
          </motion.button>
        }
      />

      <AnimatePresence>
        {showForm && <RuleForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-[18px] p-3 sm:p-4 text-center">
          <div className="text-[22px] font-bold text-[rgb(var(--accent))]">{rules.length}</div>
          <div className="text-xs text-[rgba(var(--muted),0.75)]">Total Rules</div>
        </div>
        <div className="glass rounded-[18px] p-3 sm:p-4 text-center">
          <div className="text-[22px] font-bold text-green-500">{activeRules.length}</div>
          <div className="text-xs text-[rgba(var(--muted),0.75)]">Active</div>
        </div>
        <div className="glass rounded-[18px] p-3 sm:p-4 text-center">
          <div className="text-[22px] font-bold text-red-400">{rules.reduce((s, r) => s + (r.violation_count || 0), 0)}</div>
          <div className="text-xs text-[rgba(var(--muted),0.75)]">Total Violations</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...CATEGORIES].map((c) => {
          const cfg = categoryConfig[c];
          return (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all capitalize border`}
              style={activeCategory === c ? { background: cfg?.color || "rgba(104,155,251,0.2)", borderColor: cfg?.border || "rgba(104,155,251,0.4)" } : { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
              {cfg ? `${cfg.emoji} ${cfg.label}` : "All Rules"}
            </button>
          );
        })}
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="text-center py-12 text-[rgba(var(--muted),0.5)] text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-[24px] p-8 text-center">
          <Shield size={40} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm text-[rgba(var(--muted),0.6)] mb-4">No rules yet. Add your first rule or start with our recommended set.</div>
          {rules.length === 0 && (
            <motion.button onClick={handleSeedDefaults} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary shimmer cursor-pointer text-sm">
              Load Recommended Rules
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((rule, idx) => {
            const cfg = categoryConfig[rule.category] || categoryConfig.entry;
            return (
              <motion.div key={rule.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className={`glass rounded-[18px] p-4 sm:p-5 transition-opacity ${!rule.is_active ? "opacity-50" : ""}`}>
                <div className="space-y-3">
                   <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3 flex-1">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 border`}
                         style={{ background: cfg.color, borderColor: cfg.border }}>
                         {cfg.emoji} {cfg.label}
                       </span>
                       <div className="flex-1">
                         <div className="font-semibold text-sm">{rule.title}</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 flex-shrink-0">
                       <button onClick={() => handleToggle(rule)} className={`w-8 h-8 rounded-full grid place-items-center cursor-pointer transition-all border ${rule.is_active ? "bg-green-400/20 border-green-400/40 text-green-500" : "glass"}`}>
                         <CheckCircle2 size={14} />
                       </button>
                       <button onClick={() => handleDelete(rule.id)} className="w-8 h-8 rounded-full glass grid place-items-center cursor-pointer text-[rgba(var(--muted),0.5)] hover:text-red-400 transition-colors">
                         <X size={13} />
                       </button>
                     </div>
                   </div>
                   <div className="text-xs text-[rgba(var(--muted),0.75)]">{rule.description}</div>
                   <div className="flex items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                     <div>
                       {(rule.violation_count || 0) > 0 && (
                         <div className="flex items-center gap-1.5">
                           <AlertTriangle size={11} className="text-red-400" />
                           <span className="text-xs text-red-400">{rule.violation_count} violation{rule.violation_count > 1 ? "s" : ""} logged</span>
                         </div>
                       )}
                     </div>
                     <div className="flex gap-2">
                       <motion.button 
                         onClick={() => handleRuleCompliance(rule, true)}
                         whileHover={{ scale: 1.08 }}
                         whileTap={{ scale: 0.92 }}
                         className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border ${checkedRules[rule.id] === true ? "bg-green-500/40 border-green-500/70 text-green-300" : "glass"}`}
                         title="Rule followed"
                       >
                         <Check size={14} /> Followed
                       </motion.button>
                       <motion.button 
                         onClick={() => handleRuleCompliance(rule, false)}
                         whileHover={{ scale: 1.08 }}
                         whileTap={{ scale: 0.92 }}
                         className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border ${checkedRules[rule.id] === false ? "bg-red-500/40 border-red-500/70 text-red-300" : "glass"}`}
                         title="Rule violated"
                       >
                         <X size={14} /> Violated
                       </motion.button>
                     </div>
                   </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}