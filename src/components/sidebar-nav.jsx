import * as React from "react";
import { LayoutGroup, motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/components/cn";

const M = motion;

export function SidebarNav({ items, active, onChange }) {
  const [prevActive, setPrevActive] = React.useState(active);
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, { stiffness: 400, damping: 15, mass: 0.8 });

  const activeIndex = items.findIndex(it => it.key === active);
  const prevIndex = items.findIndex(it => it.key === prevActive);
  const direction = activeIndex > prevIndex ? 1 : -1;

  React.useEffect(() => {
    if (active !== prevActive) {
      const sequence = async () => {
        await animate(scale, 0.85, { duration: 0.1, ease: [0.4, 0, 1, 1] });
        await animate(scale, 1.12, { duration: 0.15, ease: [0, 0, 0.2, 1] });
        animate(scale, 1, { type: "spring", stiffness: 500, damping: 12, mass: 0.6 });
      };
      sequence();
      setPrevActive(active);
    }
  }, [active, prevActive, scale]);

  return (
    <LayoutGroup id="sidebar-nav">
      <div className="relative mt-9 flex flex-col items-center gap-3">
        {items.map((it) => (
          <SidebarButton
            key={it.key}
            label={it.label}
            icon={it.icon}
            active={active === it.key}
            onClick={() => onChange(it.key)}
            smoothScale={smoothScale}
            direction={direction}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}

function SidebarButton({ label, icon, active, onClick, smoothScale, direction }) {
  const skewY = useTransform(smoothScale, [0.85, 1, 1.12], [direction * -8, 0, direction * 6]);
  const scaleX = useTransform(smoothScale, [0.85, 1, 1.12], [1.15, 1, 0.92]);
  const scaleY = useTransform(smoothScale, [0.85, 1, 1.12], [0.88, 1, 1.1]);

  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className={cn(
          "focus-ring pressable relative w-12 h-12 rounded-[18px] grid place-items-center cursor-pointer",
          "transition-[opacity] duration-200 ease-premium",
          active ? "opacity-100" : "opacity-70 hover:opacity-100"
        )}
        aria-label={label}
      >
        {active && (
          <>
            <M.div
              layoutId="sidebarActiveIndicator"
              className="absolute inset-0 rounded-[18px]"
              style={{
                scaleX,
                scaleY,
                skewY,
                background: "rgba(250, 249, 246, 0.9)",
                border: "1px solid rgba(250, 249, 246, 0.6)",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.4)",
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
                className="absolute inset-0 rounded-[18px] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%)",
                  }}
                />
              </M.div>
            </M.div>

            <M.div
              className="absolute inset-1 rounded-[14px]"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: [0, 0.4, 0], scale: [1.2, 1, 0.95] }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "linear-gradient(135deg, rgba(104,155,251,0.3) 0%, rgba(121,113,249,0.2) 100%)",
              }}
            />
          </>
        )}

        <M.span
          className="relative z-10"
          animate={active ? {
            scale: [1, 1.15, 0.95, 1.02, 1],
          } : { scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.2, 0.5, 0.8, 1]
          }}
        >
          {icon}
        </M.span>
      </button>
    </Tooltip>
  );
}