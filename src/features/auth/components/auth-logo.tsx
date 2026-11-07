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
  const textColor = variant === 'light' ? '#FFFFFF' : '#0F3D3A';
  const dotColor = '#F4B13B';

  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  return (
    <div
      className={`inline-flex select-none items-center font-black ${sizes[size]} ${className}`}
      aria-label="3m2A"
    >
      <div className="relative inline-flex items-center leading-none">
        {/* Leading golden dot */}
        <span
          className="me-1.5 inline-block rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            width: '0.24em',
            height: '0.24em',
            marginBottom: '0.05em',
          }}
          aria-hidden="true"
        />

        {/* 3m2A wordmark - lowercase m, uppercase A */}
        <span
          style={{
            color: textColor,
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}
        >
          3m2A
        </span>

        {/* Trailing upper golden dot */}
        <span
          className="absolute -top-[0.12em] -end-[0.38em] rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            width: '0.25em',
            height: '0.25em',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
