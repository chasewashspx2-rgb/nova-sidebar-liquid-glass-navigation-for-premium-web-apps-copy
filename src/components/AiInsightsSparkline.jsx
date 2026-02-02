import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toSmoothPath(points) {
  if (points.length < 2) return "";
  const d = [];
  d.push(`M ${points[0].x} ${points[0].y}`);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function AiInsightsSparkline({
  title = "AI Insights",
  subtitle = "Portfolio momentum",
  value = "+12.4%",
  note = "YTD returns",
  insight = "AI detected a volatility dip — suggested rebalancing could reduce drawdown ~18%.",
}) {
  const W = 520;
  const H = 180;
  const PAD = 18;

  const data = React.useMemo(
    () => [38, 42, 41, 48, 46, 52, 50, 58, 62, 60, 67, 72, 70, 78],
    []
  );

  const min = Math.min(...data);
  const max = Math.max(...data);

  const points = data.map((v, i) => {
    const x = lerp(PAD, W - PAD, i / (data.length - 1));
    const y = lerp(H - PAD, PAD, (v - min) / (max - min || 1));
    return { x, y };
  });

  const path = toSmoothPath(points);

  const [hover, setHover] = React.useState(false);
  const [idx, setIdx] = React.useState(points.length - 1);

  const mx = useMotionValue(points[idx].x);
  const my = useMotionValue(points[idx].y);

  const sx = useSpring(mx, { stiffness: 380, damping: 32, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 380, damping: 32, mass: 0.8 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = clamp(e.clientX - r.left, PAD, W - PAD);
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setIdx(nearest);
    mx.set(points[nearest].x);
    my.set(points[nearest].y);
  };

  const cur = data[idx];
  const prev = data[Math.max(0, idx - 1)];
  const delta = cur - prev;
  const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`;

  return (
    <div
      className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] lg:rounded-[34px] p-4 sm:p-5 lg:p-6 border border-white/40 dark:border-white/10"
      style={{
        background:
          "radial-gradient(900px 320px at 25% 0%, rgba(104,155,251,0.86), rgba(121,113,249,0.26) 55%, rgba(255,255,255,0.10)), linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0.08))",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        boxShadow: "0 22px 72px rgba(104,155,251,0.14)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
    >
      <motion.div
        className="pointer-events-none absolute -top-16 left-[-40%] h-[220%] w-[46%] rotate-[18deg]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
        }}
        animate={{ x: ["0%", "220%"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
        aria-hidden
      />

      <div className="relative flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/95">
            <span className="inline-flex w-8 h-8 sm:w-9 sm:h-9 rounded-[16px] sm:rounded-[18px] bg-white/18 border border-white/25 items-center justify-center">
              <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
            </span>
            <div>
              <div className="text-sm sm:text-base font-semibold">{title}</div>
              <div className="text-xs sm:text-sm text-white/75">{subtitle}</div>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[32px] sm:text-[36px] lg:text-[42px] leading-none font-semibold text-white drop-shadow">
            {value}
          </div>
          <div className="text-xs sm:text-sm text-white/75">{note}</div>
        </div>
      </div>

      <div className="relative mt-4 sm:mt-5 lg:mt-6">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.55 0"
              />
            </filter>

            <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.78)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.98)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.72)" />
            </linearGradient>
          </defs>

          <motion.path
            d={`${path} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${
              H - PAD
            } Z`}
            fill="url(#area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          />

          <motion.path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.15, ease: [0.2, 0.8, 0.2, 1] }}
          />

          <motion.path
            d={path}
            fill="none"
            stroke="url(#line)"
            strokeWidth="3.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.15, ease: [0.2, 0.8, 0.2, 1] }}
          />

          <motion.g>
            <motion.circle
              cx={sx}
              cy={sy}
              r="7"
              fill="white"
              opacity={hover ? 1 : 0.9}
            />
            <motion.circle
              cx={sx}
              cy={sy}
              r="16"
              fill="rgba(255,255,255,0.14)"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
              opacity={hover ? 1 : 0.7}
            />
          </motion.g>

          <path
            d={`M ${PAD} ${H - PAD} L ${W - PAD} ${H - PAD}`}
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="1"
          />
        </svg>

        <motion.div
          className="pointer-events-none absolute"
          style={{
            left: sx,
            top: sy,
            transform: "translate(-50%, -120%)",
          }}
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 4 }}
          transition={{ duration: 0.18 }}
        >
          <div className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-black/35 border border-white/20 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            {cur.toFixed(1)} • {deltaLabel}
          </div>
        </motion.div>
      </div>

      <div className="relative mt-3 sm:mt-4 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 rounded-[18px] sm:rounded-[20px] lg:rounded-[22px] px-3 sm:px-4 py-2.5 sm:py-3 bg-white/14 border border-white/18 backdrop-blur-xl">
        <div className="flex items-start gap-2 text-white/90">
          <span className="mt-0.5 inline-flex w-7 h-7 sm:w-8 sm:h-8 rounded-[12px] sm:rounded-[14px] bg-white/16 border border-white/18 items-center justify-center flex-shrink-0">
            <TrendingUp size={14} className="sm:w-4 sm:h-4" />
          </span>
          <div>
            <div className="text-xs sm:text-sm font-semibold">Recommendation</div>
            <div className="text-xs sm:text-sm text-white/75">{insight}</div>
          </div>
        </div>
        <button
          className="shrink-0 rounded-full px-4 h-8 sm:h-9 font-semibold text-xs sm:text-sm text-white bg-white/18 border border-white/20 hover:bg-white/22 active:scale-[0.99] transition"
          type="button"
        >
          View
        </button>
      </div>

      <div className="relative mt-2 text-[10px] sm:text-xs text-white/60">
        Hover to scrub • Animated glow • AI insight callout
      </div>
    </div>
  );
}