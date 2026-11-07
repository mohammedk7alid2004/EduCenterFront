interface AuthLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AuthLogo({
  variant = 'dark',
  size = 'md',
  className = '',
}: AuthLogoProps): JSX.Element {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  }[size];

  const textColor = variant === 'light' ? 'text-card' : 'text-primary';

  return (
    <div
      className={`inline-flex select-none items-center font-bold tracking-tight ${sizeClasses} ${className}`}
      aria-label="3M2A"
    >
      <div className="relative inline-flex items-center">
        {/* Leading golden dot */}
        <span
          className="me-2 inline-block rounded-full bg-accent"
          style={{ width: '0.3em', height: '0.3em' }}
          aria-hidden="true"
        />

        {/* 3M2A wordmark */}
        <span
          className={`font-black tracking-widest ${textColor}`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          3M2A
        </span>

        {/* Trailing upper golden dot */}
        <span
          className="absolute -top-1 -end-3 inline-block rounded-full bg-accent"
          style={{ width: '0.32em', height: '0.32em' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
