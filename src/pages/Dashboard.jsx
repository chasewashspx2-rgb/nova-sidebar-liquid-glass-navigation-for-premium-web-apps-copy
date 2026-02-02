import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { SidebarNav } from "@/components/sidebar-nav";
import { Bell, ChevronRight, ChevronLeft, CreditCard, LayoutGrid, LineChart, Moon, Search, Settings, Sun, Users, ArrowUpRight, Sparkles, ArrowDownLeft, Wallet, Home, X, Plus } from "lucide-react";
import { cn } from "@/components/cn";
import { useTheme } from "@/components/theme";
import { Tooltip } from "@/components/tooltip";
import { CursorGlow } from "@/components/cursor-glow";
import { PremiumCursor } from "@/components/cursor";
import { MDiv, MPath, MCircle, MG } from "@/components/motion";

const transactions = [
  { id: "t1", name: "Spotify", date: "Jan 28", status: "Pending", amount: "-$14.99" },
  { id: "t2", name: "Alex Rivera", date: "Jan 27", status: "Done", amount: "-$340" },
  { id: "t3", name: "Freelance Pay", date: "Jan 25", status: "Done", amount: "+$2,850" },
  { id: "t4", name: "Amazon Order", date: "Jan 22", status: "Done", amount: "-$89" },
  { id: "t5", name: "Electric Bill", date: "Jan 20", status: "Done", amount: "-$142" },
  { id: "t6", name: "Transfer In", date: "Jan 18", status: "Done", amount: "+$500" },
];

const sidebar = [
  { key: "overview", label: "Overview", icon: <Home size={18} /> },
  { key: "analytics", label: "Analytics", icon: <LineChart size={18} /> },
  { key: "cards", label: "Cards", icon: <CreditCard size={18} /> },
  { key: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
  { key: "apps", label: "Apps", icon: <LayoutGrid size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
];

function BrandMark() {
  return (
    <div className="w-9 h-9 rounded-full bg-[rgb(var(--text))] dark:bg-white grid place-items-center shadow-lg">
      <div className="w-4 h-4 rounded-full border-2 border-white dark:border-[#689BFB]" />
    </div>
  );
}

function StatusPill({ status }) {
  const pending = status === "Pending";
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", pending ? "bg-[rgba(var(--accent),0.15)] border border-[rgba(var(--accent),0.25)] text-[rgb(var(--accent))]" : "bg-transparent text-[rgba(var(--muted),0.75)]")}>
      {status}
    </span>
  );
}

const M = motion;

function PillToggle({ options, active, onChange }) {
  return (
    <LayoutGroup id="pill-toggle">
      <div className="flex items-center gap-1 p-1 rounded-full glass">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className="relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer"
          >
            {active === option && (
              <M.div
                layoutId="pillIndicator"
                className="absolute inset-0 rounded-full bg-white dark:bg-white/20 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <span className={cn("relative z-10 transition-colors", active === option ? "text-[rgb(var(--text))]" : "text-[rgba(var(--muted),0.8)]")}>
              {option}
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function SearchModal({ isOpen, onClose }) {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <M.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md"
            onClick={onClose}
          />
          <M.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="glass-strong rounded-[28px] p-2 shadow-2xl">
              <div className="flex items-center gap-3 px-4">
                <M.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                >
                  <Search size={20} className="text-[rgba(var(--muted),0.7)]" />
                </M.div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search transactions, contacts, or actions..."
                  className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-[rgba(var(--muted),0.5)]"
                />
                <M.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white/30 dark:bg-white/10 grid place-items-center cursor-pointer"
                >
                  <X size={16} />
                </M.button>
              </div>
              <M.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-2 px-4 pb-4"
              >
                <div className="text-xs text-[rgba(var(--muted),0.6)] mb-2">Quick actions</div>
                <div className="flex flex-wrap gap-2">
                  {["Send money", "View statements", "Add contact", "Export data"].map((action, i) => (
                    <M.button
                      key={action}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/40 dark:bg-white/10 border border-white/30 dark:border-white/15 cursor-pointer"
                    >
                      {action}
                    </M.button>
                  ))}
                </div>
              </M.div>
            </div>
          </M.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PlusButton({ onClick }) {
  return (
    <M.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="focus-ring w-11 h-11 rounded-full glass cursor-pointer grid place-items-center flex-shrink-0"
    >
      <Plus size={18} />
    </M.button>
  );
}

function ArrowButton({ direction, onClick }) {
  return (
    <M.button
      onClick={onClick}
      whileHover={{ scale: 1.1, x: direction === "right" ? 2 : -2 }}
      whileTap={{ scale: 0.9 }}
      className="w-9 h-9 rounded-full glass grid place-items-center focus-ring cursor-pointer flex-shrink-0"
    >
      {direction === "right" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </M.button>
  );
}

export default function Dashboard() {
  const { theme, toggle } = useTheme();
  const [active, setActive] = React.useState("analytics");
  const [bottomActive, setBottomActive] = React.useState(null);
  const [prevBottomActive, setPrevBottomActive] = React.useState(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sendMoneyTab, setSendMoneyTab] = React.useState("Recent");

  const bottomScale = useMotionValue(1);
  const smoothBottomScale = useSpring(bottomScale, { stiffness: 400, damping: 15, mass: 0.8 });

  const bottomItems = ["notifications", "profile"];
  const bottomActiveIndex = bottomActive ? bottomItems.indexOf(bottomActive) : -1;
  const prevBottomIndex = prevBottomActive ? bottomItems.indexOf(prevBottomActive) : -1;
  const bottomDirection = bottomActiveIndex > prevBottomIndex ? 1 : -1;

  const bottomSkewY = useTransform(smoothBottomScale, [0.85, 1, 1.12], [bottomDirection * -8, 0, bottomDirection * 6]);
  const bottomScaleX = useTransform(smoothBottomScale, [0.85, 1, 1.12], [1.15, 1, 0.92]);
  const bottomScaleY = useTransform(smoothBottomScale, [0.85, 1, 1.12], [0.88, 1, 1.1]);

  React.useEffect(() => {
    if (bottomActive !== prevBottomActive && bottomActive !== null) {
      const sequence = async () => {
        await animate(bottomScale, 0.85, { duration: 0.1, ease: [0.4, 0, 1, 1] });
        await animate(bottomScale, 1.12, { duration: 0.15, ease: [0, 0, 0.2, 1] });
        animate(bottomScale, 1, { type: "spring", stiffness: 500, damping: 12, mass: 0.6 });
      };
      sequence();
    }
    setPrevBottomActive(bottomActive);
  }, [bottomActive, prevBottomActive, bottomScale]);

  return (
    <main className="min-h-screen p-6 lg:p-10">
      <PremiumCursor />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <MDiv initial={{ opacity: 0, y: 12, scale: 0.995 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative mx-auto max-w-[1280px] rounded-[40px] glass-strong overflow-hidden grain">
        <CursorGlow />

        <div className="relative grid grid-cols-[88px_1fr] lg:grid-cols-[98px_1fr]">
          <aside className="relative z-10 px-4 py-6 lg:px-5 lg:py-8">
            <div className="flex items-center justify-center">
              <BrandMark />
            </div>

            <SidebarNav
              items={sidebar}
              active={bottomActive ? "" : active}
              onChange={(key) => {
                setActive(key);
                setBottomActive(null);
              }}
            />

            <LayoutGroup id="bottom-nav">
              <div className="mt-auto pt-16 flex flex-col items-center gap-3">
                <Tooltip label="Notifications">
                  <button
                    onClick={() => {
                      if (bottomActive === "notifications") {
                        setBottomActive(null);
                        setActive("analytics");
                      } else {
                        setBottomActive("notifications");
                      }
                    }}
                    className={cn(
                      "relative focus-ring pressable cursor-pointer w-11 h-11 rounded-[16px] grid place-items-center",
                      "transition-[opacity] duration-200 ease-premium",
                      bottomActive === "notifications" ? "opacity-100" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    {bottomActive === "notifications" && (
                      <>
                        <M.div
                          layoutId="bottomActiveIndicator"
                          className="absolute inset-0 rounded-[16px]"
                          style={{
                            scaleX: bottomScaleX,
                            scaleY: bottomScaleY,
                            skewY: bottomSkewY,
                            background: "linear-gradient(135deg, rgba(104,155,251,0.55) 0%, rgba(121,113,249,0.45) 100%)",
                            border: "1px solid rgba(255,255,255,0.45)",
                            boxShadow: "0 6px 24px rgba(104,155,251,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 22,
                            mass: 0.8,
                            layout: {
                              type: "spring",
                              stiffness: 300,
                              damping: 18,
                              mass: 1,
                            }
                          }}
                        >
                          <M.div
                            className="absolute inset-0 rounded-[16px] overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            <div
                              className="absolute inset-0"
                              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%)" }}
                            />
                          </M.div>
                        </M.div>
                        <M.div
                          className="absolute inset-1 rounded-[12px]"
                          initial={{ opacity: 0, scale: 1.2 }}
                          animate={{ opacity: [0, 0.4, 0], scale: [1.2, 1, 0.95] }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.3) 0%, rgba(121,113,249,0.2) 100%)" }}
                        />
                      </>
                    )}
                    <M.span
                      className="relative z-10"
                      animate={bottomActive === "notifications" ? { scale: [1, 1.15, 0.95, 1.02, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], times: [0, 0.2, 0.5, 0.8, 1] }}
                    >
                      <Bell size={18} />
                    </M.span>
                  </button>
                </Tooltip>

                <Tooltip label="Profile">
                  <button
                    onClick={() => {
                      if (bottomActive === "profile") {
                        setBottomActive(null);
                        setActive("analytics");
                      } else {
                        setBottomActive("profile");
                      }
                    }}
                    className={cn(
                      "relative focus-ring pressable w-11 h-11 rounded-full cursor-pointer grid place-items-center",
                      "transition-[opacity] duration-200 ease-premium",
                      bottomActive === "profile" ? "opacity-100" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    {bottomActive === "profile" && (
                      <>
                        <M.div
                          layoutId="bottomActiveIndicator"
                          className="absolute inset-0 rounded-full"
                          style={{
                            scaleX: bottomScaleX,
                            scaleY: bottomScaleY,
                            skewY: bottomSkewY,
                            background: "linear-gradient(135deg, rgba(104,155,251,0.55) 0%, rgba(121,113,249,0.45) 100%)",
                            border: "1px solid rgba(255,255,255,0.45)",
                            boxShadow: "0 6px 24px rgba(104,155,251,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 22,
                            mass: 0.8,
                            layout: {
                              type: "spring",
                              stiffness: 300,
                              damping: 18,
                              mass: 1,
                            }
                          }}
                        >
                          <M.div
                            className="absolute inset-0 rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            <div
                              className="absolute inset-0"
                              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%)" }}
                            />
                          </M.div>
                        </M.div>
                        <M.div
                          className="absolute inset-1 rounded-full"
                          initial={{ opacity: 0, scale: 1.2 }}
                          animate={{ opacity: [0, 0.4, 0], scale: [1.2, 1, 0.95] }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.3) 0%, rgba(121,113,249,0.2) 100%)" }}
                        />
                      </>
                    )}
                    <M.div
                      className="relative z-10"
                      animate={bottomActive === "profile" ? { scale: [1, 1.1, 0.95, 1.02, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], times: [0, 0.2, 0.5, 0.8, 1] }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/40"
                      />
                    </M.div>
                  </button>
                </Tooltip>
              </div>
            </LayoutGroup>
          </aside>

          <section className="p-5 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[28px] font-bold tracking-tight">Nova</div>
                    <div className="text-base font-medium text-[rgba(var(--muted),0.85)]">Your personal wealth dashboard</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="glass rounded-[18px] px-4 py-3 flex items-center gap-3 text-sm">
                      <span className="font-semibold tracking-widest">**** 7291</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70 dark:bg-white/35" />
                      <span className="text-[rgba(var(--muted),0.95)]">08/27</span>
                    </div>

                    <M.button
                      onClick={toggle}
                      whileHover={{ scale: 1.08, rotate: 15 }}
                      whileTap={{ scale: 0.92, rotate: -15 }}
                      className="icon-tile focus-ring cursor-pointer"
                      aria-label="Toggle theme"
                      title="Toggle theme"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {theme === "dark" ? (
                          <M.span
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Sun size={18} />
                          </M.span>
                        ) : (
                          <M.span
                            key="moon"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Moon size={18} />
                          </M.span>
                        )}
                      </AnimatePresence>
                    </M.button>
                  </div>
                </div>

                <div className="glass rounded-[32px] p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                  <div className="pointer-events-none absolute -left-10 top-12 w-[560px] h-[260px] rounded-full blur-3xl opacity-70 animate-floaty" style={{ background: "radial-gradient(circle at 30% 30%, rgba(121,113,249,0.55), rgba(104,155,251,0.35) 55%, transparent 72%)" }} />

                  <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-[rgba(var(--muted),0.95)]">Net worth</div>
                          <div className="mt-1 text-[28px] sm:text-[36px] lg:text-[40px] leading-none font-semibold tracking-tight">$128,450</div>
                        </div>
                        <div className="flex gap-2 lg:hidden">
                          <M.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="focus-ring shimmer rounded-full w-10 h-10 flex items-center justify-center bg-white/70 dark:bg-white/20 border border-white/60 dark:border-white/30 shadow-sm cursor-pointer"
                          >
                            <ArrowDownLeft size={16} />
                          </M.button>
                          <M.button
                            whileHover={{ scale: 1.1, boxShadow: "0 8px 24px rgba(104,155,251,0.5)" }}
                            whileTap={{ scale: 0.9 }}
                            className="focus-ring shimmer rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer"
                            style={{ background: "linear-gradient(135deg, rgba(104,155,251,1) 0%, rgba(121,113,249,1) 100%)", border: "1px solid rgba(255,255,255,0.3)" }}
                          >
                            <ArrowUpRight size={16} />
                          </M.button>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                        <M.button
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          className="focus-ring glass rounded-[20px] sm:rounded-[28px] p-3 sm:p-4 text-center cursor-pointer"
                        >
                          <div className="text-[14px] sm:text-[18px] font-semibold">$24.1k</div>
                          <div className="text-[10px] sm:text-xs text-[rgba(var(--muted),0.95)]">Checking</div>
                        </M.button>

                        <M.button
                          whileHover={{ scale: 1.03, y: -4, boxShadow: "0 20px 56px rgba(104,155,251,0.35)" }}
                          whileTap={{ scale: 0.97 }}
                          className="focus-ring relative rounded-[20px] sm:rounded-[28px] p-3 sm:p-4 text-center cursor-pointer overflow-hidden"
                          style={{ border: "1px solid rgba(255,255,255,0.30)", background: "radial-gradient(160px 160px at 30% 30%, rgba(121,113,249,0.85), rgba(104,155,251,0.65) 60%, rgba(255,255,255,0.22))", boxShadow: "0 16px 48px rgba(104,155,251,0.20)" }}
                        >
                          <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),transparent_60%)]" />
                          <div className="relative text-[14px] sm:text-[18px] font-semibold text-white drop-shadow">$67.8k</div>
                          <div className="relative text-[10px] sm:text-xs text-white/85">Invest</div>
                        </M.button>

                        <M.button
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          className="focus-ring glass rounded-[20px] sm:rounded-[28px] p-3 sm:p-4 text-center cursor-pointer"
                        >
                          <div className="text-[14px] sm:text-[18px] font-semibold">$36.4k</div>
                          <div className="text-[10px] sm:text-xs text-[rgba(var(--muted),0.95)]">Savings</div>
                        </M.button>
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-1 items-center justify-between gap-6">
                      <div className="relative w-full max-w-[200px] h-[170px] rounded-[28px] overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.35) 0%, rgba(121,113,249,0.25) 100%)", border: "1px solid rgba(255,255,255,0.3)" }}>
                        <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "radial-gradient(160px 140px at 40% 40%, rgba(255,255,255,0.25), transparent 65%)" }} />
                        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 200 170" fill="none" preserveAspectRatio="none">
                          <path d="M0 140 Q 35 90, 70 110 T 140 80 L200 70 L200 170 L0 170 Z" fill="rgba(255,255,255,0.15)" />
                          <path d="M0 140 Q 35 90, 70 110 T 140 80 L200 70" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>

                      <div className="flex flex-col gap-3 ml-auto relative z-10">
                        <M.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="focus-ring shimmer rounded-full px-5 h-10 flex items-center gap-2 font-semibold text-sm bg-white/70 dark:bg-white/20 border border-white/60 dark:border-white/30 shadow-sm cursor-pointer"
                        >
                          <M.span whileHover={{ x: -2 }}>
                            <ArrowDownLeft size={16} />
                          </M.span>
                          <span>Receive</span>
                        </M.button>
                        <M.button
                          whileHover={{ scale: 1.05, y: -2, boxShadow: "0 12px 32px rgba(104,155,251,0.5)" }}
                          whileTap={{ scale: 0.95 }}
                          className="focus-ring shimmer rounded-full px-5 h-10 flex items-center gap-2 font-semibold text-sm text-white cursor-pointer"
                          style={{ background: "linear-gradient(135deg, rgba(104,155,251,1) 0%, rgba(121,113,249,1) 100%)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 24px rgba(104,155,251,0.35)" }}
                        >
                          <M.span whileHover={{ x: 2, y: -2 }}>
                            <ArrowUpRight size={16} />
                          </M.span>
                          <span>Send</span>
                        </M.button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass rounded-[32px] p-6">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Monthly spending</div>
                      <span className="pill">2025</span>
                    </div>

                    <div className="mt-12 flex items-end gap-4 h-36">
                      {[
                        { m: "SEP", h: 52, amt: "$3.2k" },
                        { m: "OCT", h: 68, amt: "$4.1k" },
                        { m: "NOV", h: 88, amt: "$5.4k", tag: true },
                        { m: "DEC", h: 74, amt: "$4.5k" },
                        { m: "JAN", h: 62, amt: "$3.8k" },
                      ].map((b, idx) => (
                        <div key={b.m} className="group flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full">
                            <div className="w-full h-28 rounded-[22px] bg-white/32 dark:bg-white/6 border border-white/35 dark:border-white/10" />
                            <MDiv className="absolute bottom-0 left-0 right-0 rounded-[22px] shadow-glow cursor-pointer transition-all group-hover:brightness-110" initial={{ height: 0 }} animate={{ height: `${b.h}%` }} transition={{ duration: 0.75, delay: 0.12 + idx * 0.06, ease: [0.2, 0.8, 0.2, 1] }} style={{ background: "linear-gradient(180deg, rgba(104,155,251,0.88), rgba(121,113,249,0.55))" }} />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-[rgb(var(--text))] text-white dark:bg-[#1a2850] dark:text-white shadow-lg whitespace-nowrap">{b.amt}</span>
                            </div>
                            {b.tag ? <span className="absolute -top-3 right-1 pill bg-white text-[rgb(var(--text))] border border-[rgba(0,0,0,0.12)] dark:bg-[#1a2850] dark:text-white dark:border-white/20 text-[10px] px-2 shadow-md">{b.amt}</span> : null}
                          </div>
                          <div className="text-xs text-[rgba(var(--muted),0.95)]">{b.m}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <M.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative rounded-[32px] p-6 overflow-hidden cursor-pointer"
                    style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.45) 0%, rgba(121,113,249,0.35) 100%)", border: "1px solid rgba(255,255,255,0.35)" }}
                  >
                    <div className="absolute inset-0 backdrop-blur-[18px]" style={{ background: "radial-gradient(400px 300px at 30% 20%, rgba(255,255,255,0.25), transparent 70%)" }} />
                    <div className="relative flex items-center justify-between">
                      <div className="font-semibold text-[rgb(var(--text))]">Portfolio growth</div>
                      <M.button
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                        className="icon-tile focus-ring cursor-pointer bg-white/30 dark:bg-white/20 border-white/40 dark:border-white/25"
                      >
                        <ChevronRight size={18} className="text-[rgb(var(--text))]" />
                      </M.button>
                    </div>

                    <div className="relative mt-6">
                      <div className="text-4xl font-semibold text-[rgb(var(--text))]">+12.4%</div>
                      <div className="text-sm text-[rgba(var(--text),0.7)]">year to date returns</div>
                    </div>

                    <div className="relative mt-5 h-28">
                      <svg className="w-full h-full" viewBox="0 0 360 130" fill="none" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(104,155,251,0.35)" />
                            <stop offset="100%" stopColor="rgba(104,155,251,0)" />
                          </linearGradient>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(104,155,251,0.6)" />
                            <stop offset="100%" stopColor="rgba(104,155,251,1)" />
                          </linearGradient>
                        </defs>

                        <line x1="0" y1="40" x2="360" y2="40" stroke="rgba(var(--text),0.1)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(var(--text),0.1)" strokeWidth="1" strokeDasharray="4 4" />

                        <MPath
                          d="M0 105 Q 40 95, 80 75 T 160 60 T 240 45 T 320 30 L360 28 L360 130 L0 130 Z"
                          fill="url(#healthGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />

                        <MPath
                          d="M0 105 Q 40 95, 80 75 T 160 60 T 240 45 T 320 30 L360 28"
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                        />

                        {[
                          { x: 80, y: 75 },
                          { x: 160, y: 60 },
                          { x: 240, y: 45 },
                        ].map((point, i) => (
                          <MCircle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="rgba(104,155,251,0.9)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                          />
                        ))}

                        <MG
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 15 }}
                          style={{ transformOrigin: "320px 30px" }}
                        >
                          <circle cx="320" cy="30" r="10" fill="rgba(104,155,251,0.2)" className="animate-pulse" />
                          <circle cx="320" cy="30" r="5" fill="rgb(104,155,251)" />
                        </MG>

                        <MG initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                          <text x="320" y="20" fontSize="11" fontWeight="600" fill="rgb(var(--text))" textAnchor="middle">$68.2k</text>
                        </MG>
                        <text x="8" y="122" fontSize="10" fill="rgba(var(--text),0.5)">Feb</text>
                        <text x="170" y="122" fontSize="10" fill="rgba(var(--text),0.5)">Jul</text>
                        <text x="340" y="122" fontSize="10" fill="rgba(var(--text),0.5)">Jan</text>
                      </svg>
                    </div>
                  </M.div>
                </div>

                <div className="glass rounded-[32px] p-6">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Scheduled bills</div>
                    <M.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="pill focus-ring cursor-pointer"
                    >
                      View All
                    </M.button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { left: "Rent Payment", rightTitle: "Monthly", amt: "$2,400", badge: "Due Today", icon: "R" },
                      { left: "Car Insurance", rightTitle: "Quarterly", amt: "$380", sub: "Feb 15", icon: "C" },
                      { left: "Gym Membership", rightTitle: "Annual", amt: "$49", sub: "Feb 28", icon: "G" },
                    ].map((p) => (
                      <M.button
                        key={p.left}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        className="focus-ring w-full text-left flex items-center justify-between rounded-[18px] glass px-4 py-3.5 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-[16px] bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/15 grid place-items-center font-semibold text-base">
                            {p.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{p.left}</div>
                            <div className="text-xs text-[rgba(var(--muted),0.75)] mt-0.5">
                              {p.badge ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(104,155,251,0.15)", border: "1px solid rgba(104,155,251,0.25)", color: "rgb(var(--accent))" }}>
                                  <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                  {p.badge}
                                </span>
                              ) : p.sub}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden md:block text-xs text-[rgba(var(--muted),0.70)]">{p.rightTitle}</div>
                          <div className="w-20 font-semibold text-sm text-right">{p.amt}</div>
                        </div>
                      </M.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[32px] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[20px] font-semibold tracking-tight">Activity</div>
                      <div className="text-sm text-[rgba(var(--muted),0.95)]">Recent transactions</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <M.button
                        onClick={() => setSearchOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="icon-tile focus-ring cursor-pointer"
                        aria-label="Search"
                      >
                        <Search size={18} />
                      </M.button>
                      <M.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn-primary focus-ring text-xs h-9 px-4 cursor-pointer"
                      >
                        View All
                      </M.button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {transactions.map((tx, idx) => (
                      <M.button
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        className="focus-ring w-full text-left flex items-center justify-between rounded-[18px] px-4 py-3 glass cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/30 dark:bg-white/10 grid place-items-center">
                            <ArrowUpRight size={14} />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{tx.name}</div>
                            <div className="text-xs text-[rgba(var(--muted),0.75)]">{tx.date}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusPill status={tx.status} />
                          <div className="w-16 text-right font-semibold text-sm">{tx.amount}</div>
                        </div>
                      </M.button>
                    ))}
                  </div>

                  <M.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="mt-5 rounded-[18px] px-4 py-4 glass relative overflow-hidden cursor-pointer"
                  >
                    <M.div
                      className="absolute right-4 top-4 text-[rgb(var(--accent))]"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles size={18} />
                    </M.div>
                    <div className="font-semibold">Maximize your returns with AI</div>
                    <div className="mt-1 text-sm text-[rgba(var(--muted),0.95)]">Get personalized investment recommendations.</div>
                    <M.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-2 text-sm font-semibold underline underline-offset-4 focus-ring cursor-pointer"
                    >
                      Explore insights
                    </M.button>
                  </M.div>
                </div>

                <div className="glass rounded-[32px] p-6 pb-8 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Send money</div>
                    <PillToggle
                      options={["Recent", "Favorites"]}
                      active={sendMoneyTab}
                      onChange={setSendMoneyTab}
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <PlusButton onClick={() => {}} />

                    {[
                      { name: "Maya", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=face" },
                      { name: "David", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face" },
                      { name: "Sophie", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=face" },
                      { name: "Lucas", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=face" },
                    ].map((a) => (
                      <M.button
                        key={a.name}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className="focus-ring flex flex-col items-center gap-1.5 rounded-xl p-1.5 cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/20 shadow-md">
                          <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-[11px] font-medium text-[rgba(var(--muted),0.95)]">{a.name}</div>
                      </M.button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div className="text-[40px] leading-none font-semibold tracking-tight">$250.00</div>
                    <M.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary focus-ring px-10 shimmer cursor-pointer"
                    >
                      Transfer
                    </M.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-3" />
          </section>
        </div>
      </MDiv>

    </main>
  );
}