import { useState } from 'react';
import type { Product } from '../types/menu';
import { Badge, Card, MethodIcon } from '../../../shared/ui';
import { Sparkles, Eye, Coffee, Plus, Check } from 'lucide-react';
import { useCustomerTray } from '../context/CustomerTrayContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCustomerTray();
  const quantityInTray = getItemQuantity(product.id);
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <Card
      hoverable={product.isAvailable}
      onClick={() => onSelect(product)}
      className={`group flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ${
        !product.isAvailable ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-cream-dark mb-4">
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-forest/40 bg-cream-dark">
              <Coffee className="w-10 h-10 mb-1 opacity-60" />
              <span className="text-[11px] font-medium text-sage">Ritual Coffee Lab</span>
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {product.isSpecialty && (
              <Badge variant="gold" size="sm" className="shadow-xs backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-forest" />
                <span>Especialidad</span>
              </Badge>
            )}
            {!product.isAvailable && (
              <Badge variant="terracotta" size="sm" className="shadow-xs">
                Agotado
              </Badge>
            )}
          </div>

          {/* Quick view hover icon on desktop */}
          <div className="absolute inset-0 bg-forest/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-cream text-forest text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5" />
              Ver Ficha Técnica
            </span>
          </div>
        </div>

        {/* Origin / Category text & Recommended Method */}
        <div className="flex items-center justify-between gap-2 mb-1">
          {product.origin ? (
            <p className="text-xs uppercase font-medium tracking-wider text-sage line-clamp-1">
              {product.origin}
            </p>
          ) : <div />}

          {product.extractionMethod && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-forest bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full shrink-0 font-medium"
              title={`Método recomendado: ${product.extractionMethod}`}
            >
              <MethodIcon method={product.extractionMethod} className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="hidden sm:inline">{product.extractionMethod}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-bold text-forest group-hover:text-gold-hover transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-forest/75 mt-1.5 line-clamp-3 leading-relaxed">
          {product.description}
        </p>

        {/* Tasting notes tags */}
        {product.tastingNotes && product.tastingNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tastingNotes.slice(0, 3).map((note, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-cream-dark/90 text-sage px-2 py-0.5 rounded-md font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom price and action */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-cream-dark">
        <div>
          <span className="text-[11px] text-sage block font-sans">
            {product.category === 'filtrados' && product.tastingNotes?.some((t) => t.includes('500 ml')) && product.price === 3
              ? 'Desde'
              : 'Precio'}
          </span>
          <span className="font-serif text-base sm:text-lg font-bold text-forest">
            {product.category === 'filtrados' && product.tastingNotes?.some((t) => t.includes('500 ml')) && product.price === 3
              ? 'Desde $3.00'
              : formattedPrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {product.isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                quantityInTray > 0
                  ? 'bg-forest text-gold border border-gold/40 hover:bg-forest/90 scale-102'
                  : 'bg-cream-dark hover:bg-forest hover:text-cream text-forest'
              }`}
              title="Añadir a mi selección para no olvidar al pedir"
            >
              {quantityInTray > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-gold stroke-[3]" />
                  <span>{quantityInTray} en lista</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-terracotta italic font-medium">Agotado</span>
          )}
        </div>
      </div>
    </Card>
  );
}
