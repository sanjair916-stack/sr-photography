import React from 'react';

interface BrandLogoProps {
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'gold';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  className = '',
  size = 'md',
  showText = true
}) => {
  // If user uploaded a custom logo image, render it beautifully with gold framing
  if (logoUrl) {
    const boxSize = {
      sm: 'h-10 w-10 rounded-lg',
      md: 'h-13 w-13 rounded-xl',
      lg: 'h-18 w-18 rounded-2xl',
      xl: 'h-24 w-24 rounded-2xl'
    }[size];

    const titleSize = {
      sm: 'text-sm tracking-wider',
      md: 'text-base sm:text-lg tracking-widest',
      lg: 'text-xl sm:text-2xl tracking-[0.18em]',
      xl: 'text-2xl sm:text-3xl tracking-[0.2em]'
    }[size];

    const subtitleSize = {
      sm: 'text-[9px]',
      md: 'text-[10px]',
      lg: 'text-xs',
      xl: 'text-xs'
    }[size];

    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        <div className={`relative shrink-0 overflow-hidden bg-black border border-amber-400/50 shadow-sm ${boxSize} flex items-center justify-center p-0.5`}>
          <img
            src={logoUrl}
            alt="SR PHOTOGRAPHY"
            crossOrigin="anonymous"
            className="w-full h-full object-cover rounded-inherit"
          />
        </div>
        {showText && (
          <div className="flex flex-col justify-center">
            <span className={`font-brand font-bold text-stone-900 uppercase leading-tight ${titleSize}`}>
              SR PHOTOGRAPHY
            </span>
            <span className={`font-sans uppercase text-amber-700/90 font-bold tracking-widest mt-0.5 ${subtitleSize}`}>
              Studio & Cinematography
            </span>
          </div>
        )}
      </div>
    );
  }

  // Regal Vector White & Gold Brand Mark
  const iconSize = {
    sm: 32,
    md: 44,
    lg: 58,
    xl: 72
  }[size];

  const titleSize = {
    sm: 'text-sm tracking-wider',
    md: 'text-lg tracking-widest',
    lg: 'text-2xl tracking-[0.2em]',
    xl: 'text-3xl tracking-[0.25em]'
  }[size];

  const subtitleSize = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-[0.2em]',
    xl: 'text-sm tracking-[0.25em]'
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Gold Medallion Camera Monogram */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFB76C" />
              <stop offset="40%" stopColor="#C5A059" />
              <stop offset="70%" stopColor="#EAD292" />
              <stop offset="100%" stopColor="#A88438" />
            </linearGradient>
            <linearGradient id="goldRing" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B38E3E" />
              <stop offset="50%" stopColor="#F3E5AB" />
              <stop offset="100%" stopColor="#99752B" />
            </linearGradient>
          </defs>

          {/* Outer Octagon / Rounded Lens Bezel */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="20"
            fill="#FFFFFF"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
          />

          {/* Inner Decorative Framing Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#goldRing)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />

          {/* Camera Viewfinder & Aperture Blades */}
          <circle cx="50" cy="50" r="28" stroke="url(#goldGradient)" strokeWidth="2.5" />
          
          {/* Subtle Aperture Notches */}
          <path d="M 50 22 L 54 36" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 74 38 L 60 46" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 70 70 L 56 60" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 42 78 L 44 64" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 24 56 L 38 50" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 32 30 L 44 38" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Monogram SR in center */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontSize="21"
            fontWeight="bold"
            fill="url(#goldGradient)"
            letterSpacing="1"
          >
            SR
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-brand font-bold uppercase text-stone-900 leading-none ${titleSize}`}
            >
              SR PHOTOGRAPHY
            </span>
          </div>
          <span
            className={`font-sans uppercase text-amber-700/80 font-semibold tracking-widest mt-1 ${subtitleSize}`}
          >
            Studio & Cinematography
          </span>
        </div>
      )}
    </div>
  );
};
