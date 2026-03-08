import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { SidebarNav } from "@/components/sidebar-nav";
import { Bell, ChevronRight, LayoutGrid, Moon, Search, Settings, Sun, X, Brain, BookOpen, Shield, BarChart2, Sparkles, Home, ShieldCheck, MessageCircle } from "lucide-react";
import { cn } from "@/components/cn";
import { useTheme } from "@/components/theme";
import { Tooltip } from "@/components/tooltip";
import { CursorGlow } from "@/components/cursor-glow";
import { PremiumCursor } from "@/components/cursor";
import { MDiv } from "@/components/motion";

// Pages
import TruddyHome from "@/components/truddy/pages/TruddyHome";
import JournalPage from "@/components/truddy/pages/JournalPage";
import MoodPage from "@/components/truddy/pages/MoodPage";
import RulesPage from "@/components/truddy/pages/RulesPage";
import InsightsPage from "@/components/truddy/pages/InsightsPage";
import PreTradePage from "@/components/truddy/pages/PreTradePage";
import CoachPage from "@/components/truddy/pages/CoachPage";

const sidebar = [
  { key: "home", label: "Home", icon: <Home size={18} /> },
  { key: "pretrade", label: "Pre-Trade Gate", icon: <ShieldCheck size={18} /> },
  { key: "journal", label: "Trade Journal", icon: <BookOpen size={18} /> },
  { key: "mood", label: "Mood Check-In", icon: <Brain size={18} /> },
  { key: "rules", label: "My Rules", icon: <Shield size={18} /> },
  { key: "insights", label: "Insights", icon: <BarChart2 size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
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
      {isOpen && (
        <>
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
                  {["Log a trade", "Check-in mood", "Review rules", "View insights"].map((action, i) => (
                    <motion.button key={action} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/40 dark:bg-white/10 border border-white/30 dark:border-white/15 cursor-pointer">
                      {action}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const pageComponents = {
  home: TruddyHome,
  pretrade: PreTradePage,
  journal: JournalPage,
  mood: MoodPage,
  rules: RulesPage,
  insights: InsightsPage,
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const ActivePage = pageComponents[active] || pageComponents.home;

  return (
    <main className="min-h-screen p-3 sm:p-6 lg:p-10">
      <PremiumCursor />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu Button */}
      <motion.button onClick={() => setMobileMenuOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass-strong shadow-2xl grid place-items-center cursor-pointer" style={{ boxShadow: "0 12px 40px rgba(104,155,251,0.3)" }}>
        <LayoutGrid size={22} />
      </motion.button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="lg:hidden fixed left-0 top-0 bottom-0 z-[70] w-72 p-6" style={{ background: "linear-gradient(135deg, rgba(104,155,251,0.22) 0%, rgba(121,113,249,0.18) 100%)", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(26px)", WebkitBackdropFilter: "blur(26px)", boxShadow: "0 30px 92px rgba(15, 23, 42, 0.18)" }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BrandMark />
                  <div>
                    <div className="font-bold text-base">Truddy</div>
                    <div className="text-[10px] text-[rgba(var(--muted),0.75)]">Trading Psychology Co-Pilot</div>
                  </div>
                </div>
                <motion.button onClick={() => setMobileMenuOpen(false)} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full glass grid place-items-center cursor-pointer">
                  <X size={18} />
                </motion.button>
              </div>
              <div className="space-y-2">
                {sidebar.map((item) => (
                  <motion.button key={item.key} onClick={() => { setActive(item.key); setBottomActive(null); setMobileMenuOpen(false); }} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer", active === item.key && !bottomActive ? "glass-strong font-semibold" : "hover:glass")}>
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <motion.button onClick={() => { setBottomActive("notifications"); setMobileMenuOpen(false); }} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all", bottomActive === "notifications" ? "glass-strong font-semibold" : "hover:glass")}>
                  <Bell size={18} /><span className="text-sm">Notifications</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MDiv initial={{ opacity: 0, y: 12, scale: 0.995 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative mx-auto max-w-[1280px] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] glass-strong overflow-hidden grain">
        <CursorGlow />
        <div className="relative grid grid-cols-1 lg:grid-cols-[98px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block relative z-10 px-4 py-6 lg:px-5 lg:py-8">
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
                    {bottomActive === "notifications" && (
                      <motion.div layoutId="bottomActiveIndicator" className="absolute inset-0 rounded-[16px]" style={{ scaleX: bottomScaleX, scaleY: bottomScaleY, skewY: bottomSkewY, background: "linear-gradient(135deg, rgba(104,155,251,0.55) 0%, rgba(121,113,249,0.45) 100%)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 6px 24px rgba(104,155,251,0.30), inset 0 1px 0 rgba(255,255,255,0.25)" }} transition={{ type: "spring", stiffness: 350, damping: 22, mass: 0.8 }} />
                    )}
                    <motion.span className="relative z-10" animate={bottomActive === "notifications" ? { scale: [1, 1.15, 0.95, 1.02, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
                      <Bell size={18} />
                    </motion.span>
                  </button>
                </Tooltip>
                <Tooltip label="Toggle theme">
                  <motion.button onClick={toggle} whileHover={{ scale: 1.08, rotate: 15 }} whileTap={{ scale: 0.92, rotate: -15 }} className="icon-tile focus-ring cursor-pointer opacity-70 hover:opacity-100">
                    <AnimatePresence mode="wait" initial={false}>
                      {theme === "dark" ? (
                        <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun size={18} /></motion.span>
                      ) : (
                        <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={18} /></motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </Tooltip>
              </div>
            </LayoutGroup>
          </aside>

          {/* Main Content */}
          <section className="p-4 sm:p-5 lg:p-7 min-h-[calc(100vh-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <ActivePage onNavigate={(page) => { setActive(page); setBottomActive(null); }} />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </MDiv>
    </main>
  );
}