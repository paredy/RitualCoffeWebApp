import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'gold' | 'forest' | 'sage' | 'terracotta' | 'cream';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-gold text-forest font-bold border border-gold-hover/60 shadow-xs',
  forest: 'bg-forest text-cream font-bold border border-forest-light/40 shadow-xs',
  sage: 'bg-forest/95 text-cream font-bold border border-forest-light/60 shadow-xs backdrop-blur-sm',
  terracotta: 'bg-terracotta text-cream font-bold border border-terracotta/50 shadow-xs',
  cream: 'bg-cream-dark text-forest font-semibold border border-forest/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs rounded-full',
  md: 'px-3 py-1 text-xs md:text-sm rounded-full',
};

export function Badge({
  children,
  variant = 'gold',
  size = 'sm',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center tracking-wide uppercase select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
