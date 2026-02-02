import * as React from "react";

export function CursorGlow() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(520px 400px at var(--mx, 50%) var(--my, 30%), rgba(104,155,251,0.14), transparent 60%), radial-gradient(520px 400px at calc(var(--mx, 50%) + 140px) calc(var(--my, 30%) - 90px), rgba(154,126,255,0.10), transparent 65%)",
        opacity: 1,
      }}
    />
  );
}