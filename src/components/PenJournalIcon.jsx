export default function PenJournalIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Journal/Book */}
      <path
        d="M 12 8 L 32 8 L 32 56 L 12 56 C 10 56 8 54 8 52 L 8 12 C 8 10 10 8 12 8 Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M 32 8 L 52 8 C 54 8 56 10 56 12 L 56 52 C 56 54 54 56 52 56 L 32 56 Z"
        fill="currentColor"
        opacity="0.5"
      />
      <line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" strokeWidth="1.5" />

      {/* Pen/Feather overlay */}
      <g transform="translate(18, 28)">
        <path
          d="M 2 8 L 8 2 L 10 4 L 4 10 Z"
          fill="currentColor"
        />
        <path
          d="M 8 2 L 12 -2 L 13.5 0.5 L 10 4 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <line
          x1="4"
          y1="10"
          x2="2"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}