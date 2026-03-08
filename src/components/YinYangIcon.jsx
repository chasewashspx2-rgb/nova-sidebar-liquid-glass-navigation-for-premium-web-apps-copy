export default function YinYangIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
      <path
        d="M 32 2 A 30 30 0 0 1 32 62 A 15 15 0 0 1 32 32 A 15 15 0 0 0 32 2 Z"
        fill="currentColor"
      />
      <circle cx="32" cy="16" r="3" fill="currentColor" />
      <circle cx="32" cy="48" r="3" fill="white" />
    </svg>
  );
}