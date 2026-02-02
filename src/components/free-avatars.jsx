import * as React from "react";

function AvatarSvg({ seed }) {
  const a = (seed * 37) % 360;
  const b = (a + 40) % 360;
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id={`g${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${a} 80% 70%)`} />
          <stop offset="1" stopColor={`hsl(${b} 85% 60%)`} />
        </linearGradient>
        <filter id={`f${seed}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.65 0" />
        </filter>
      </defs>
      <rect width="64" height="64" rx="32" fill={`url(#g${seed})`} />
      <circle cx="26" cy="24" r="14" fill="rgba(255,255,255,0.28)" filter={`url(#f${seed})`} />
      <circle cx="44" cy="42" r="18" fill="rgba(255,255,255,0.18)" filter={`url(#f${seed})`} />
      <path d="M16 46 C 24 36, 40 36, 48 46" stroke="rgba(255,255,255,0.72)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function AvatarImage({ seed }) {
  return (
    <div className="w-full h-full rounded-full overflow-hidden">
      <AvatarSvg seed={seed} />
    </div>
  );
}