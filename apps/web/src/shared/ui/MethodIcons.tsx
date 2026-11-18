import type { SVGProps } from 'react';

export function V60Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* V60 Cone Dripper */}
      <path d="M4 4h16l-5.5 11h-5L4 4Z" />
      <path d="M12 4v11" strokeDasharray="2 2" opacity="0.6" />
      <path d="M9 4l1.5 11" opacity="0.4" />
      <path d="M15 4l-1.5 11" opacity="0.4" />
      <path d="M6 18h12" strokeWidth="2.5" />
      <path d="M9 15v3" />
      <path d="M15 15v3" />
      {/* Handle */}
      <path d="M17 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1.5" />
      {/* Drops */}
      <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChemexIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Hourglass top */}
      <path d="M6 3h12l-4 7h-4L6 3Z" />
      {/* Wooden collar in the middle */}
      <rect x="9" y="10" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
      <path d="M9 11.5h6" strokeWidth="1" />
      {/* Hourglass bottom decanter */}
      <path d="M10 13l-5 8h14l-5-8H10Z" />
    </svg>
  );
}

export function AeropressIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Plunger handle */}
      <path d="M7 2h10" strokeWidth="2.5" />
      <path d="M12 2v4" strokeWidth="2" />
      <rect x="9.5" y="6" width="5" height="2" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      {/* Outer Chamber */}
      <rect x="7" y="8" width="10" height="11" rx="1" />
      {/* Measurement markings */}
      <path d="M10 11h4" strokeWidth="1" opacity="0.7" />
      <path d="M10 14h4" strokeWidth="1" opacity="0.7" />
      {/* Filter cap at bottom */}
      <path d="M5 19h14v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2Z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function FrenchPressIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Knob & Plunger */}
      <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 4.5V13" />
      <path d="M7 13h10" strokeWidth="2.5" />
      {/* Lid & Spout */}
      <path d="M5 7h14" strokeWidth="2.5" />
      <path d="M5 7l-2 1" />
      {/* Glass Cylinder & Base */}
      <rect x="6" y="7" width="12" height="13" rx="1" />
      <path d="M4 20h16" strokeWidth="2.5" />
      {/* Handle */}
      <path d="M18 9h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

export function EspressoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Portafilter Basket */}
      <path d="M6 5h10v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5Z" />
      {/* Dual spouts */}
      <path d="M8.5 13v3" />
      <path d="M13.5 13v3" />
      <path d="M8 18h1" />
      <path d="M13 18h1" />
      {/* Long Handle */}
      <path d="M16 7h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function ColdBrewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Bottle cap & neck */}
      <rect x="10" y="2" width="4" height="2" rx="0.5" fill="currentColor" />
      <path d="M10 4v3l-4 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9l-4-4V4H10Z" />
      {/* Ice droplet */}
      <path d="M12 11c-1.5 1.5-2 3-2 4a2 2 0 1 0 4 0c0-1-.5-2.5-2-4Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

export function SiphonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Upper chamber */}
      <rect x="9" y="3" width="6" height="6" rx="1" />
      <path d="M12 9v4" strokeWidth="2" />
      {/* Lower glass sphere */}
      <circle cx="12" cy="16" r="4.5" />
      {/* Stand and base */}
      <path d="M6 16h1.5" />
      <path d="M16.5 16H18" />
      <path d="M6 9v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" opacity="0.4" />
    </svg>
  );
}

export function CleverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Conical Dripper Body */}
      <path d="M4 4h16l-4.5 10h-7L4 4Z" />
      {/* Base Valve Plate */}
      <rect x="7.5" y="14" width="9" height="3" rx="1" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 17v2" strokeWidth="2" />
      <path d="M9 19h6" strokeWidth="2" />
      {/* Handle */}
      <path d="M17 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

export function MethodIcon({
  method,
  className = "w-5 h-5",
}: {
  method?: string;
  className?: string;
}) {
  const norm = (method || '').toLowerCase();

  if (norm.includes('clever')) {
    return <CleverIcon className={className} />;
  }
  if (norm.includes('v60') || norm.includes('goteo') || norm.includes('hario')) {
    return <V60Icon className={className} />;
  }
  if (norm.includes('chemex')) {
    return <ChemexIcon className={className} />;
  }
  if (norm.includes('aeropress')) {
    return <AeropressIcon className={className} />;
  }
  if (norm.includes('prensa') || norm.includes('french') || norm.includes('francesa')) {
    return <FrenchPressIcon className={className} />;
  }
  if (norm.includes('espresso') || norm.includes('marzocco') || norm.includes('latte') || norm.includes('flat white') || norm.includes('cappuccino')) {
    return <EspressoIcon className={className} />;
  }
  if (norm.includes('cold brew') || norm.includes('frío') || norm.includes('inmersión')) {
    return <ColdBrewIcon className={className} />;
  }
  if (norm.includes('sifón') || norm.includes('siphon') || norm.includes('vacío')) {
    return <SiphonIcon className={className} />;
  }

  // Fallback to V60
  return <V60Icon className={className} />;
}

