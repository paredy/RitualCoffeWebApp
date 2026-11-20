import { useState } from 'react';
import type { Product } from '../types/menu';
import { AdaptiveDialog, MethodIcon } from '../../../shared/ui';
import { MapPin, Flame, Info, Coffee } from 'lucide-react';

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({
  product,
  isOpen,
  onClose,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  const displayPrice =
    product.category === 'filtrados' &&
    product.tastingNotes?.some((t) => t.includes('500 ml')) &&
    product.price === 3
      ? 'Desde $3.00'
      : formattedPrice;

  return (
    <AdaptiveDialog isOpen={isOpen} onClose={onClose} maxWidth="3xl" variant="forest">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-stretch text-cream">
        {/* Left Column: Image (clean without overlay badges) */}
        <div className="md:col-span-5 flex flex-col">
          <div className="relative w-full h-44 sm:h-52 md:h-full md:min-h-[290px] md:max-h-[380px] rounded-2xl overflow-hidden bg-forest-light/60 border border-gold/30 shadow-inner">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-cream/40 bg-forest-light/60 p-6 text-center">
                <Coffee className="w-12 h-12 mb-2 text-gold opacity-80" />
                <span className="text-xs font-serif font-bold text-cream">{product.name}</span>
                <span className="text-[11px] text-gold/80">Ritual Coffee Lab</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information, Specs & Actions */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
          {/* Header: Title, Origin, Price (with pr-12 to avoid overlap with modal close X) */}
          <div className="pr-10 sm:pr-12">
            {product.origin && (
              <div className="flex items-center gap-1.5 text-[11px] text-gold font-medium uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="truncate">{product.origin}</span>
              </div>
            )}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xl sm:text-2xl font-serif font-bold text-gold">
                {displayPrice}
              </span>
              {!product.isAvailable && (
                <span className="text-xs font-semibold text-terracotta bg-terracotta/20 border border-terracotta/40 px-2 py-0.5 rounded-full">
                  Agotado
                </span>
              )}
            </div>
          </div>

          {/* Description / Cup Profile */}
          <div className="bg-forest-light/40 p-3.5 rounded-xl border border-gold/25">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-gold mb-1">
              Perfil de la Taza
            </h4>
            <p className="text-xs sm:text-sm text-cream/90 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical Specs: Roast, Method, Temp in 3 compact columns */}
          {(product.roastLevel || product.extractionMethod || product.temperature) && (
            <div className="grid grid-cols-3 gap-2">
              {product.roastLevel && (
                <div className="bg-forest-light/50 px-2 py-2 rounded-lg border border-gold/20 text-center">
                  <span className="text-[10px] text-gold flex items-center justify-center gap-1 font-medium">
                    <Flame className="w-3 h-3 text-gold" /> Tostado
                  </span>
                  <span className="text-xs font-semibold text-cream truncate block mt-0.5">
                    {product.roastLevel}
                  </span>
                </div>
              )}

              {product.extractionMethod && (
                <div className="bg-forest-light/50 px-2 py-2 rounded-lg border border-gold/20 text-center">
                  <span className="text-[10px] text-gold flex items-center justify-center gap-1 font-medium">
                    <MethodIcon method={product.extractionMethod} className="w-3 h-3 text-gold shrink-0" />
                    <span className="truncate">Método</span>
                  </span>
                  <span className="text-xs font-semibold text-cream truncate block mt-0.5">
                    {product.extractionMethod}
                  </span>
                </div>
              )}

              {product.temperature && (
                <div className="bg-forest-light/50 px-2 py-2 rounded-lg border border-gold/20 text-center">
                  <span className="text-[10px] text-gold flex items-center justify-center gap-1 font-medium">
                    🌡️ Temp.
                  </span>
                  <span className="text-xs font-semibold text-cream truncate block mt-0.5">
                    {product.temperature}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tasting Notes */}
          {product.tastingNotes && product.tastingNotes.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gold block mb-1.5">
                Notas Sensoriales
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="bg-gold/20 text-cream border border-gold/40 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens notice if present */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-light/40 rounded-lg text-[11px] text-cream/75 border border-gold/20">
              <Info className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>Contiene: {product.allergens.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </AdaptiveDialog>
  );
}
