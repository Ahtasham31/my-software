interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps): JSX.Element {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-label="DocuVerse Studio"
        className="h-8 w-8"
      >
        <defs>
          <linearGradient id="dv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#dv-grad)" />
        <path
          d="M9 8h9l5 5v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M18 8v5h5"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold">DocuVerse</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Studio</div>
        </div>
      )}
    </div>
  );
}