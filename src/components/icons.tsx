export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="#ccff00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 34 20 6l12 28" />
      <path d="M13 24c5-3 9-3 14 0" />
    </svg>
  );
}
