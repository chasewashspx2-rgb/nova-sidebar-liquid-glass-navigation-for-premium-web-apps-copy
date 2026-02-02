import * as React from "react";

export function PremiumCursor({ enabled = true }) {
  const ring = React.useRef(null);
  const dot = React.useRef(null);

  React.useEffect(() => {
    if (!enabled) return;
    const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (isCoarse || reduce) return;

    const r = ring.current;
    const d = dot.current;
    if (!r || !d) return;

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let dx = rx;
    let dy = ry;

    const onMove = (e) => {
      rx = e.clientX;
      ry = e.clientY;
      d.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };

    let raf = 0;
    const loop = () => {
      dx += (rx - dx) * 0.16;
      dy += (ry - dy) * 0.16;
      r.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "0 14px 40px rgba(15,23,42,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.10)",
          opacity: 0.95,
        }}
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 14px 30px rgba(104,155,251,0.18)",
          opacity: 0.95,
        }}
      />
    </>
  );
}