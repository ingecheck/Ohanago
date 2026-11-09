import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  variant?: 'crimson' | 'lime' | 'gold';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  subtitleText,
  variant = 'crimson',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-5xl sm:text-6xl md:text-7xl',
    xl: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
  };

  // Holiday Crimson Red (#FF1E27 / #D42426) with subtle warm glow
  const isCrimson = variant === 'crimson';
  const isGold = variant === 'gold';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center tracking-tight font-black leading-none group">
        {/* OHANA in crisp athletic brush/condensed display */}
        <span
          className={`font-bebas ${sizeClasses[size]} text-white tracking-widest uppercase transform -skew-x-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]`}
          style={{ letterSpacing: '0.08em' }}
        >
          OHANA
        </span>

        {/* GO > in vibrant Santa Crimson Red with warm holiday realce */}
        <span
          className={`font-bebas ${sizeClasses[size]} ml-1.5 sm:ml-2 tracking-wider uppercase transform -skew-x-12 inline-flex items-center drop-shadow-[0_2px_16px_rgba(255,30,39,0.55)] transition-all`}
          style={{
            color: isCrimson ? '#FF1E27' : isGold ? '#D4AF37' : '#a3e635',
            textShadow: isCrimson
              ? '0 0 20px rgba(255, 30, 39, 0.45), 0 2px 4px rgba(0, 0, 0, 0.8)'
              : undefined,
          }}
        >
          GO
          <span
            className="text-[0.75em] ml-0.5 font-sans font-black inline-block transform scale-y-125"
            style={{ color: isCrimson ? '#FF333B' : isGold ? '#F59E0B' : '#a3e635' }}
          >
            &gt;
          </span>
        </span>
      </div>

      {showSubtitle && (
        <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.25em] text-red-200/80 uppercase mt-1 text-center font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>{subtitleText || 'TARAPOTO 2026 · SANTA RUN'}</span>
        </span>
      )}
    </div>
  );
};
