import { useState } from 'react';
import type { Product } from '../types/menu';
import { AdaptiveDialog, Badge, Button, MethodIcon } from '../../../shared/ui';
import { Sparkles, MapPin, Flame, Info, CheckCircle2, XCircle, Plus, Check, Coffee } from 'lucide-react';
import { useCustomerTray } from '../context/CustomerTrayContext';

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

  const { addItem, getItemQuantity } = useCustomerTray();
  const quantity = getItemQuantity(product.id);
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <AdaptiveDialog isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-stretch">
        {/* Left Column: Image & Badges */}
        <div className="md:col-span-5 flex flex-col">
          <div className="relative w-full h-40 sm:h-48 md:h-full md:min-h-[290px] md:max-h-[380px] rounded-2xl overflow-hidden bg-cream-dark shadow-inner">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-forest/40 bg-cream-dark p-6 text-center">
                <Coffee className="w-12 h-12 mb-2 opacity-60" />
                <span className="text-xs font-serif font-bold text-forest">{product.name}</span>
                <span className="text-[11px] text-sage">Ritual Coffee Lab</span>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
              {product.isSpecialty && (
                <Badge variant="gold" size="sm" className="shadow-xs backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-forest" />
                  <span>Especialidad</span>
                </Badge>
              )}
              <Badge
                variant={product.isAvailable ? 'sage' : 'terracotta'}
                size="sm"
                className="shadow-xs backdrop-blur-xs flex items-center gap-1"
              >
                {product.isAvailable ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Disponible</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Agotado</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Specs & Actions */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          {/* Header: Title, Origin, Price */}
          <div>
            {product.origin && (
              <div className="flex items-center gap-1 text-[11px] text-sage font-medium uppercase tracking-wider mb-0.5">
                <MapPin className="w-3 h-3 text-gold shrink-0" />
                <span className="truncate">{product.origin}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest leading-tight">
                {product.name}
              </h2>
              <span className="font-serif text-xl sm:text-2xl font-bold text-gold shrink-0">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Description / Cup Profile */}
          <div className="bg-cream p-3 rounded-xl border border-cream-dark">
            <h4 className="text-[10px] uppercase tracking-wider font-semibold text-sage mb-1">
              Perfil de la Taza
            </h4>
            <p className="text-xs sm:text-sm text-forest/85 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical Specs: Roast, Method, Temp in 3 compact columns */}
          {(product.roastLevel || product.extractionMethod || product.temperature) && (
            <div className="grid grid-cols-3 gap-2">
              {product.roastLevel && (
                <div className="bg-cream-dark/50 px-2 py-1.5 rounded-lg border border-cream-dark text-center">
                  <span className="text-[10px] text-sage flex items-center justify-center gap-1 font-medium">
                    <Flame className="w-3 h-3 text-gold" /> Tostado
                  </span>
                  <span className="text-xs font-semibold text-forest truncate block mt-0.5">
                    {product.roastLevel}
                  </span>
                </div>
              )}

              {product.extractionMethod && (
                <div className="bg-cream-dark/50 px-2 py-1.5 rounded-lg border border-cream-dark text-center">
                  <span className="text-[10px] text-sage flex items-center justify-center gap-1 font-medium">
                    <MethodIcon method={product.extractionMethod} className="w-3 h-3 text-gold shrink-0" />
                    <span className="truncate">Método</span>
                  </span>
                  <span className="text-xs font-semibold text-forest truncate block mt-0.5">
                    {product.extractionMethod}
                  </span>
                </div>
              )}

              {product.temperature && (
                <div className="bg-cream-dark/50 px-2 py-1.5 rounded-lg border border-cream-dark text-center">
                  <span className="text-[10px] text-sage flex items-center justify-center gap-1 font-medium">
                    🌡️ Temp.
                  </span>
                  <span className="text-xs font-semibold text-forest truncate block mt-0.5">
                    {product.temperature}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tasting Notes */}
          {product.tastingNotes && product.tastingNotes.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block mb-1">
                Notas Sensoriales
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="bg-gold/15 text-forest border border-gold/35 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens notice if present */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cream rounded-lg text-[11px] text-sage border border-cream-dark">
              <Info className="w-3 h-3 text-gold shrink-0" />
              <span>Contiene: {product.allergens.join(', ')}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2.5 border-t border-cream-dark flex items-center justify-between gap-3 mt-auto">
            <span className="text-[11px] text-sage italic hidden sm:inline">
              * Pide directamente en barra a tu barista.
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {product.isAvailable && (
                <button
                  type="button"
                  onClick={() => addItem(product)}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    quantity > 0
                      ? 'bg-forest text-gold font-bold border border-gold/40'
                      : 'bg-gold hover:bg-gold-hover text-forest font-bold'
                  }`}
                >
                  {quantity > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-gold stroke-[3]" />
                      <span>En lista ({quantity})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir a mi Selección</span>
                    </>
                  )}
                </button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdaptiveDialog>
  );
}
