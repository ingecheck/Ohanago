import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-5xl sm:text-6xl md:text-7xl',
    xl: 'text-6xl sm:text-8xl md:text-9xl',
  };

  const goSizeClasses = {
    sm: 'text-2xl sm:text-3xl px-1.5 py-0.5',
    md: 'text-3xl sm:text-4xl px-2 py-0.5',
    lg: 'text-5xl sm:text-6xl md:text-7xl px-3 py-1',
    xl: 'text-6xl sm:text-8xl md:text-9xl px-4 py-2',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center tracking-tight font-black leading-none group">
        {/* OHANA in crisp athletic brush/condensed display */}
        <span
          className={`font-bebas ${sizeClasses[size]} text-white tracking-widest uppercase transform -skew-x-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]`}
          style={{ letterSpacing: '0.08em' }}
        >
          OHANA
        </span>

        {/* GO in electric neon chartreuse with athletic italic wedge */}
        <span
          className={`font-bebas ${sizeClasses[size]} ml-1.5 sm:ml-2 text-lime-400 tracking-wider uppercase transform -skew-x-12 inline-block drop-shadow-[0_0_20px_rgba(163,230,53,0.6)]`}
          style={{
            textShadow: '0 0 25px rgba(163, 230, 53, 0.75), 0 0 10px rgba(163, 230, 53, 0.9)',
          }}
        >
          GO
        </span>
      </div>

      {showSubtitle && (
        <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.25em] text-neutral-400 uppercase mt-1 text-center font-bold">
          RUN CLUB <span className="text-lime-400">·</span> TARAPOTO
        </span>
      )}
    </div>
  );
};
