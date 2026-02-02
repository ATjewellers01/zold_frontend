import React from 'react';

interface ZoldLogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
  className?: string;
}

// ZOLD Logomark: Infinity symbol with Z cutting through it
function ZoldLogomark({ size, color = '#D4AF37' }: { size: number; color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Infinity symbol - smooth continuous path */}
      <path 
        d="M 25 50 Q 25 30, 35 30 Q 45 30, 50 40 Q 55 30, 65 30 Q 75 30, 75 50 Q 75 70, 65 70 Q 55 70, 50 60 Q 45 70, 35 70 Q 25 70, 25 50 Z"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Z diagonal line cutting through */}
      <path 
        d="M 70 25 L 30 75"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
      
      {/* Z top bar */}
      <path 
        d="M 62 20 L 78 20"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Z bottom bar */}
      <path 
        d="M 22 80 L 38 80"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ZoldLogo({ 
  variant = 'full', 
  size = 'md', 
  theme = 'dark',
  className = '' 
}: ZoldLogoProps) {
  
  const logomarkSizes = {
    sm: 40,
    md: 56,
    lg: 80,
    xl: 100
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };

  const goldColor = '#D4AF37';
  const taglineColor = theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(100,100,100,0.7)';

  // Icon variant - just the logomark
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <ZoldLogomark size={logomarkSizes[size]} color={goldColor} />
      </div>
    );
  }

  // Text variant - just the text
  if (variant === 'text') {
    return (
      <div className={`inline-flex flex-col items-start ${className}`}>
        <h1 
          className={`${textSizes[size]} tracking-wider font-extrabold leading-none`}
          style={{ color: goldColor }}
        >
          ZOLD
        </h1>
        <p className="text-xs mt-1.5 tracking-wide" style={{ color: taglineColor }}>
          Gold for GenZ
        </p>
      </div>
    );
  }

  // Full variant - logomark + text
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <ZoldLogomark size={logomarkSizes[size]} color={goldColor} />
      <div className="flex flex-col">
        <h1 
          className={`${textSizes[size]} tracking-wider font-extrabold leading-none`}
          style={{ color: goldColor }}
        >
          ZOLD
        </h1>
        <p className="text-xs mt-1.5 tracking-wide" style={{ color: taglineColor }}>
          Gold for GenZ
        </p>
      </div>
    </div>
  );
}

// Compact horizontal layout
interface ZoldLogoHorizontalProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  className?: string;
  showTagline?: boolean;
}

export function ZoldLogoHorizontal({ 
  size = 'md',
  theme = 'dark',
  className = '',
  showTagline = false
}: ZoldLogoHorizontalProps) {
  
  const logomarkSizes = {
    sm: 32,
    md: 44,
    lg: 56
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const goldColor = '#D4AF37';
  const taglineColor = theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(100,100,100,0.7)';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ZoldLogomark size={logomarkSizes[size]} color={goldColor} />
      <div className="flex flex-col">
        <p 
          className={`${textSizes[size]} tracking-wider font-extrabold leading-none`}
          style={{ color: goldColor }}
        >
          ZOLD
        </p>
        {showTagline && (
          <p className="text-xs mt-1 tracking-wide" style={{ color: taglineColor }}>
            Gold for GenZ
          </p>
        )}
      </div>
    </div>
  );
}