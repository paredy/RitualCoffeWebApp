import type { Product } from '../types/menu';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const isFiltrados = product.category === 'filtrados';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group flex items-start justify-between gap-3 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl cursor-pointer hover:bg-gold/10 transition-colors ${
        !product.isAvailable ? 'opacity-70' : ''
      }`}
    >
      {/* Left Column: Name & Description (Cormorant Garamond paper-menu style) */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg sm:text-xl font-normal sm:font-medium text-forest group-hover:text-gold-hover transition-colors leading-snug tracking-wide">
            {product.name}
          </h3>
          {!product.isAvailable && (
            <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta/10 px-1.5 py-0.2 rounded border border-terracotta/30 shrink-0 font-sans">
              Agotado
            </span>
          )}
        </div>
        <p className="text-xs text-forest/70 mt-0.5 line-clamp-2 leading-relaxed font-sans">
          {product.description}
        </p>
      </div>

      {/* Right Column: Price (omitted for filtrados) & Eye Visualize Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 pt-0.5">
        {!isFiltrados && (
          <span className="font-serif text-base sm:text-lg font-medium text-forest/90">
            {formattedPrice}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          aria-label={`Ver ficha de ${product.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gold/80 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-forest transition-all cursor-pointer shadow-2xs hover:scale-105"
        >
          <Eye className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>
    </div>
  );
}
