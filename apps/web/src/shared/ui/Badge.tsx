import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'gold' | 'forest' | 'sage' | 'terracotta' | 'cream';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-gold/20 text-forest border border-gold/40 font-medium',
  forest: 'bg-forest text-cream font-medium',
  sage: 'bg-sage/15 text-sage border border-sage/30',
  terracotta: 'bg-terracotta/15 text-terracotta border border-terracotta/30 font-medium',
  cream: 'bg-cream-dark text-forest border border-forest/15',
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
