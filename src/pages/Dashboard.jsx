import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { SidebarNav } from "@/components/sidebar-nav";
import { Bell, ChevronRight, Moon, Search, Settings, Sun, X, Brain, BookOpen, Shield, BarChart2, Sparkles, Home, ShieldCheck, MessageCircle, Radio, Users, MoreHorizontal } from "lucide-react";
import { cn } from "@/components/cn";
import { useTheme } from "@/components/theme";
import { Tooltip } from "@/components/tooltip";
import { CursorGlow } from "@/components/cursor-glow";
import { PremiumCursor } from "@/components/cursor";
import { MDiv } from "@/components/motion";

// Pages
import TruddyHome from "@/components/truddy/pages/TruddyHome";
import JournalPage from "@/components/truddy/pages/JournalPage";
import RulesPage from "@/components/truddy/pages/RulesPage";
import InsightsPage from "@/components/truddy/pages/InsightsPage";
import PreTradePage from "@/components/truddy/pages/PreTradePage";
import CoachPage from "@/components/truddy/pages/CoachPage";
import SessionPage from "@/components/truddy/pages/SessionPage";
import CommunityPage from "@/components/truddy/pages/CommunityPage";

const sidebar = [
  { key: "home",      label: "Home",           icon: <Home size={18} /> },
  { key: "pretrade",  label: "Pre-Trade Gate",  icon: <ShieldCheck size={18} /> },
  { key: "journal",   label: "Trade Journal",   icon: <BookOpen size={18} /> },
  { key: "rules",     label: "My Rules",        icon: <Shield size={18} /> },
  { key: "insights",  label: "Insights",        icon: <BarChart2 size={18} /> },
  { key: "session",   label: "Live Session",    icon: <Radio size={18} /> },
  { key: "community", label: "Community",       icon: <Users size={18} /> },
  { key: "coach",     label: "AI Coach",        icon: <MessageCircle size={18} /> },
  { key: "settings",  label: "Settings",        icon: <Settings size={18} /> },
];

// Primary tabs shown in the bottom tab bar (max 5 per Apple HIG)
const primaryTabs = [
  { key: "home",     label: "Home",     icon: Home },
  { key: "journal",  label: "Journal",  icon: BookOpen },
  { key: "pretrade", label: "Pre-Trade",icon: ShieldCheck },
  { key: "session",  label: "Session",  icon: Radio },
  { key: "__more__", label: "More",     icon: MoreHorizontal },
];

function BrandMark() {
  return (
    <div className="w-9 h-9 rounded-full grid place-items-center shadow-lg flex-shrink-0"
      style={{ background: "linear-gradient(135deg, rgba(104,155,251,1) 0%, rgba(121,113,249,1) 100%)" }}>
      <Brain size={16} className="text-white" />
    </div>
  );
}

function SearchModal({ isOpen, onClose }) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);
  React.useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className="glass-strong rounded-[28px] p-2 shadow-2xl">
            <div className="flex items-center gap-3 px-4">
              <Search size={20} className="text-[rgba(var(--muted),0.7)]" />
              <input ref={inputRef} type="text" placeholder="Search trades, emotions, rules..." className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-[rgba(var(--muted),0.5)]" />
              <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full bg-white/30 dark:bg-white/10 grid place-items-center cursor-pointer">
                <X size={16} />
              </motion.button>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-2 px-4 pb-4">
              <div className="text-xs text-[rgba(var(--muted),0.6)] mb-2">Quick actions</div>
              <div className="flex flex-wrap gap-2">
                {["Log a trade", "Check-in mood", "Review rules", "View insights"].map((action, i) =>
                  <motion.button key={action} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/40 dark:bg-white/10 border border-white/30 dark:border-white/15 cursor-pointer">
                    {action}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>
  );
}

// iOS-style "More" sheet — slides up from the bottom
function MoreSheet({ isOpen, onClose, active, onNavigate, theme, toggleTheme }) {
  const moreItems = sidebar.filter(s => !["home", "journal", "pretrade", "session"].includes(s.key));

  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black" onClick={onClose} />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 38, mass: 0.9 }}
          className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[28px] overflow-hidden"
          style={{
            background: "rgba(250,249,246,0.96)",
            backdropFilter: "blur(26px)",
            WebkitBackdropFilter: "blur(26px)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-black/20" />
          </div>

          <div className="px-4 pt-2 pb-4">
            <div className="text-[11px] font-semibold text-[rgba(0,0,0,0.35)] uppercase tracking-wider mb-3 px-1">More</div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => { onNavigate(item.key); onClose(); }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-left transition-all",
                    active === item.key ? "bg-black/8" : "bg-black/4"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-[10px] grid place-items-center flex-shrink-0",
                    active === item.key ? "bg-black text-white" : "bg-black/8"
                  )}>
                    {React.cloneElement(item.icon, { size: 16 })}
                  </div>
                  <span className="text-sm font-medium text-black/80">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Theme toggle in sheet */}
            <div className="mt-3 pt-3 border-t border-black/6 flex items-center justify-between px-1">
              <span className="text-sm text-black/50">Appearance</span>
              <motion.button onClick={toggleTheme} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-black/6">
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                <span className="text-xs font-medium">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>
  );
}

// Floating Glass Nav Bar
function BottomTabBar({ active, onChange, onMoreOpen }) {
  return (
    <div
      className="lg:hidden fixed left-0 right-0 z-50 flex justify-center px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
        className="flex items-center gap-1 px-3 py-2.5 rounded-[30px]"
        style={{
          background: "rgba(180,200,255,0.45)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1.5px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.25) inset",
        }}
      >
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key !== "__more__" && active === tab.key;
          const isMore = tab.key === "__more__";

          return (
            <motion.button
              key={tab.key}
              onClick={() => isMore ? onMoreOpen() : onChange(tab.key)}
              whileTap={{ scale: 0.84 }}
              className="relative flex flex-col items-center justify-center cursor-pointer rounded-[22px] transition-all"
              style={{
                minWidth: isActive ? 80 : 48,
                height: 48,
                background: "transparent",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="float-tab-bg"
                  className="absolute inset-0 rounded-[22px]"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative flex items-center gap-1.5 px-3">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)" }}
                />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.22 }}
                      className="text-[11px] font-semibold overflow-hidden whitespace-nowrap"
                      style={{ color: "rgba(0,0,0,0.85)" }}
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

const pageComponents = {
  home:      TruddyHome,
  pretrade:  PreTradePage,
  journal:   JournalPage,
  rules:     RulesPage,
  insights:  InsightsPage,
  session:   SessionPage,
  community: CommunityPage,
  coach:     CoachPage,
  settings: () => (
    <div className="flex items-center justify-center h-64 text-[rgba(var(--muted),0.6)] text-sm">
      Settings coming soon
    </div>
  ),
};

export default function Dashboard() {
  const { theme, toggle } = useTheme();
  const [active, setActive] = React.useState("home");
  const [bottomActive, setBottomActive] = React.useState(null);
  const [prevBottomActive, setPrevBottomActive] = React.useState(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

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

  const handleNavigate = (page) => {
    setActive(page);
    setBottomActive(null);
  };

  const ActivePage = pageComponents[active] || pageComponents.home;

  return (
    <main className="min-h-screen p-3 sm:p-6 lg:p-10">
      <PremiumCursor />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* iOS Bottom Tab Bar */}
      <BottomTabBar
        active={active}
        onChange={handleNavigate}
        onMoreOpen={() => setMoreOpen(true)}
      />

      {/* More Sheet */}
      <MoreSheet
        isOpen={moreOpen}
        onClose={() => setMoreOpen(false)}
        active={active}
        onNavigate={handleNavigate}
        theme={theme}
        toggleTheme={toggle}
      />

      <MDiv initial={{ opacity: 0, y: 12, scale: 0.995 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative mx-auto max-w-[1280px] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] glass-strong overflow-hidden grain">
        <CursorGlow />
        <div className="relative grid grid-cols-1 lg:grid-cols-[98px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block relative z-10 px-4 py-6 lg:px-5 lg:py-8" style={{ background: "rgba(250, 249, 246, 0.8)", backdropFilter: "blur(8px)" }}>
            <div className="flex items-center justify-center">
              <BrandMark />
            </div>
            <SidebarNav
              items={sidebar}
              active={bottomActive ? "" : active}
              onChange={(key) => { setActive(key); setBottomActive(null); }}
            />

            <LayoutGroup id="bottom-nav">
              <div className="mt-auto pt-16 flex flex-col items-center gap-3">
                <Tooltip label="Search">
                  <button onClick={() => setSearchOpen(true)} className="relative focus-ring pressable cursor-pointer w-11 h-11 rounded-[16px] grid place-items-center opacity-70 hover:opacity-100 transition-[opacity] duration-200">
                    <Search size={18} />
                  </button>
                </Tooltip>
                <Tooltip label="Notifications">
                  <button onClick={() => { bottomActive === "notifications" ? (setBottomActive(null), setActive("home")) : setBottomActive("notifications"); }} className={cn("relative focus-ring pressable cursor-pointer w-11 h-11 rounded-[16px] grid place-items-center", "transition-[opacity] duration-200 ease-premium", bottomActive === "notifications" ? "opacity-100" : "opacity-70 hover:opacity-100")}>
                    {bottomActive === "notifications" &&
                      <motion.div layoutId="bottomActiveIndicator" className="absolute inset-0 rounded-[16px]" style={{ scaleX: bottomScaleX, scaleY: bottomScaleY, skewY: bottomSkewY, background: "linear-gradient(135deg, rgba(104,155,251,0.55) 0%, rgba(121,113,249,0.45) 100%)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 6px 24px rgba(104,155,251,0.30), inset 0 1px 0 rgba(255,255,255,0.25)" }} transition={{ type: "spring", stiffness: 350, damping: 22, mass: 0.8 }} />
                    }
                    <motion.span className="relative z-10" animate={bottomActive === "notifications" ? { scale: [1, 1.15, 0.95, 1.02, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
                      <Bell size={18} />
                    </motion.span>
                  </button>
                </Tooltip>
                <Tooltip label="Toggle theme">
                  <motion.button onClick={toggle} whileHover={{ scale: 1.08, rotate: 15 }} whileTap={{ scale: 0.92, rotate: -15 }} className="icon-tile focus-ring cursor-pointer opacity-70 hover:opacity-100">
                    <AnimatePresence mode="wait" initial={false}>
                      {theme === "dark" ?
                        <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun size={18} /></motion.span> :
                        <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={18} /></motion.span>
                      }
                    </AnimatePresence>
                  </motion.button>
                </Tooltip>
              </div>
            </LayoutGroup>
          </aside>

          {/* Main Content */}
          <section
            className="bg-[#faf9f6] p-4 sm:p-5 lg:p-7"
            style={{ minHeight: "calc(100vh - 80px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <ActivePage onNavigate={handleNavigate} />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </MDiv>
    </main>
  );
}