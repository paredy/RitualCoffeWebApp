import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hoverable = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-cream-light border border-cream-dark/80 rounded-2xl p-5 shadow-xs ${
          hoverable
            ? 'transition-all duration-300 hover:shadow-md hover:border-gold/60 hover:-translate-y-0.5'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
