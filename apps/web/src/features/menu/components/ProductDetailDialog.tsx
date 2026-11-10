import type { Product } from '../types/menu';
import { AdaptiveDialog, Badge, Button, MethodIcon, WhatsAppIcon } from '../../../shared/ui';
import { Sparkles, MapPin, Flame, Info, CheckCircle2, XCircle, Plus, Check } from 'lucide-react';
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

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <AdaptiveDialog isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Main Header / Image section */}
        <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-cream-dark">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isSpecialty && (
              <Badge variant="gold" size="md" className="shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Café de Especialidad</span>
              </Badge>
            )}
            <Badge
              variant={product.isAvailable ? 'sage' : 'terracotta'}
              size="md"
              className="shadow-md flex items-center gap-1"
            >
              {product.isAvailable ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Disponible en Barra</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Agotado por hoy</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Title & Origin */}
        <div>
          {product.origin && (
            <div className="flex items-center gap-1.5 text-xs text-sage font-medium uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{product.origin}</span>
            </div>
          )}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            {product.name}
          </h2>
          <p className="font-serif text-xl sm:text-2xl font-bold text-gold mt-1">
            {formattedPrice}
          </p>
        </div>

        {/* Detailed Story / Description */}
        <div className="bg-cream p-4 rounded-xl border border-cream-dark">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-sage mb-1.5">
            Perfil de la Taza
          </h4>
          <p className="text-sm text-forest/85 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {product.roastLevel && (
            <div className="bg-cream-dark/60 p-3 rounded-xl border border-cream-dark">
              <span className="text-[11px] text-sage block flex items-center gap-1">
                <Flame className="w-3 h-3 text-gold" /> Tostado
              </span>
              <span className="text-sm font-semibold text-forest mt-0.5 block">
                {product.roastLevel}
              </span>
            </div>
          )}

          {product.extractionMethod && (
            <div className="bg-cream-dark/60 p-3 rounded-xl border border-cream-dark">
              <span className="text-[11px] text-sage block flex items-center gap-1.5">
                <MethodIcon method={product.extractionMethod} className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Método Recomendado</span>
              </span>
              <span className="text-sm font-semibold text-forest mt-0.5 block truncate">
                {product.extractionMethod}
              </span>
            </div>
          )}

          {product.temperature && (
            <div className="bg-cream-dark/60 p-3 rounded-xl border border-cream-dark">
              <span className="text-[11px] text-sage block">Temperatura</span>
              <span className="text-sm font-semibold text-forest mt-0.5 block">
                {product.temperature}
              </span>
            </div>
          )}
        </div>

        {/* Tasting Notes */}
        {product.tastingNotes && product.tastingNotes.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-sage mb-2">
              Notas Sensoriales
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.tastingNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="bg-gold/15 text-forest border border-gold/40 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergens notice if present */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-cream rounded-xl text-xs text-sage border border-cream-dark">
            <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>Alérgenos / Contiene: {product.allergens.join(', ')}</span>
          </div>
        )}

        {/* Public Action / Order Guidance */}
        <div className="pt-2 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sage italic text-center sm:text-left">
            * Pide esta opción directamente en barra con nuestros baristas.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {product.isAvailable && (
              <button
                type="button"
                onClick={() => addItem(product)}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm w-full sm:w-auto ${
                  quantity > 0
                    ? 'bg-forest text-gold font-bold border border-gold/40'
                    : 'bg-cream-dark hover:bg-forest hover:text-cream text-forest'
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

            <a
              href={`https://wa.me/593998040381?text=${encodeURIComponent(
                `Hola Ritual Coffee Lab, me gustaría pedir / consultar sobre: ${product.name} ($${product.price.toFixed(2)})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-forest text-gold text-xs font-semibold hover:bg-forest/90 transition-all cursor-pointer w-full sm:w-auto shadow-sm"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
              <span>Consultar en Barra</span>
            </a>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </AdaptiveDialog>
  );
}
