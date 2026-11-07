interface AuthLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLeadingDot?: boolean;
  className?: string;
}

export function AuthLogo({
  variant = 'dark',
  size = 'md',
  showLeadingDot = true,
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
        {/* Leading golden dot (only if showLeadingDot is true) */}
        {showLeadingDot && (
          <span
            className="me-2 inline-block rounded-full shrink-0"
            style={{
              backgroundColor: dotColor,
              width: '0.22em',
              height: '0.22em',
              marginBottom: '0.04em',
            }}
            aria-hidden="true"
          />
        )}

        {/* 3m2A wordmark - lowercase m, uppercase A */}
        <span
          style={{
            color: textColor,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          3m2A
        </span>

        {/* Trailing upper golden dot */}
        <span
          className="absolute -top-[0.14em] -end-[0.38em] rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            width: '0.24em',
            height: '0.24em',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
