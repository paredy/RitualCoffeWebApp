import { useState } from 'react';
import { useCustomerTray } from '../context/CustomerTrayContext';
import { AdaptiveDialog } from '../../../shared/ui';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';

export function CustomerTrayDialog() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearTray,
    totalItems,
    totalPrice,
    isTrayOpen,
    setIsTrayOpen,
  } = useCustomerTray();

  const [showBaristaView, setShowBaristaView] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTicket = () => {
    let text = `Ritual Coffee Lab - Mi Selección:\n`;
    items.forEach((item) => {
      text += `• ${item.quantity}x ${item.product.name} - $${(
        item.product.price * item.quantity
      ).toFixed(2)}\n`;
    });
    text += `Total: $${totalPrice.toFixed(2)} USD`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdaptiveDialog
      isOpen={isTrayOpen}
      onClose={() => setIsTrayOpen(false)}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-cream-dark">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mi Selección ({totalItems})</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-forest">
              Bandeja para Ordenar
            </h2>
            <p className="text-xs text-sage leading-relaxed">
              Guarda tus bebidas y postres favoritos mientras navegas por la carta para recordarlos al ordenar en caja.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearTray}
              className="text-xs text-terracotta hover:underline font-medium cursor-pointer shrink-0 pt-1"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-3 bg-cream-light rounded-2xl border border-cream-dark">
            <Coffee className="w-10 h-10 text-sage/60 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Aún no has agregado productos
            </h3>
            <p className="text-xs sm:text-sm text-sage max-w-sm mx-auto">
              Navega entre las pestañas del menú y pulsa <strong>"+ Añadir"</strong> en lo que se te antoje para tenerlo a mano en esta lista.
            </p>
            <button
              onClick={() => setIsTrayOpen(false)}
              className="mt-2 px-5 py-2 rounded-xl bg-forest text-cream text-xs font-semibold hover:bg-forest/90 transition-colors cursor-pointer"
            >
              Explorar el Menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toggle Barista View mode */}
            <div className="flex items-center justify-between bg-gold/15 border border-gold/40 p-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest shrink-0" />
                <span className="text-xs font-semibold text-forest">
                  ¿Listo para pedir en el mostrador?
                </span>
              </div>
              <button
                onClick={() => setShowBaristaView(!showBaristaView)}
                className="px-3 py-1.5 rounded-lg bg-forest text-gold text-xs font-bold hover:bg-forest/90 transition-colors cursor-pointer shrink-0"
              >
                {showBaristaView ? 'Ver Lista Normal' : 'Modo Mostrar al Barista'}
              </button>
            </div>

            {/* Quick Barista Ticket Card */}
            {showBaristaView ? (
              <div className="p-4 sm:p-5 bg-forest text-cream rounded-2xl border-2 border-gold space-y-3.5 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2.5 border-b border-forest-light">
                  <span className="text-xs uppercase tracking-widest text-gold font-bold">
                    ☕ Ticket para Barra
                  </span>
                  <button
                    onClick={handleCopyTicket}
                    className="inline-flex items-center gap-1 text-[11px] text-cream/80 hover:text-gold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
                  </button>
                </div>

                <div className="space-y-2 font-mono text-sm max-h-[40vh] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center py-1 border-b border-forest-light/30 last:border-b-0">
                      <span className="font-bold text-cream">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-gold font-semibold shrink-0 ml-2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-forest-light flex justify-between items-center font-mono text-base font-bold">
                  <span>Total Estimado:</span>
                  <span className="text-gold text-lg">${totalPrice.toFixed(2)} USD</span>
                </div>

                <p className="text-[11px] text-cream/70 text-center italic pt-0.5">
                  * Muestra esta pantalla al barista al momento de ordenar en caja.
                </p>
              </div>
            ) : (
              /* Item list with controls */
              <div className="divide-y divide-cream-dark max-h-[45vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    {/* Thumbnail & Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-cream-dark shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-forest/40">
                            <Coffee className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-sm font-bold text-forest truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-sage block font-mono">
                          ${item.product.price.toFixed(2)} c/u
                        </span>
                      </div>
                    </div>

                    {/* Stepper controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-cream-dark hover:bg-gold/20 text-forest flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Disminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-mono text-xs font-bold text-forest w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-cream-dark hover:bg-gold/20 text-forest flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-7 h-7 rounded-lg hover:bg-terracotta/10 text-sage hover:text-terracotta flex items-center justify-center transition-colors cursor-pointer ml-1"
                        aria-label="Eliminar de la selección"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total and actions */}
            <div className="pt-3 border-t border-cream-dark space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-sage block">Total Estimado</span>
                  <span className="text-[11px] text-sage/70 font-sans">
                    {totalItems} producto{totalItems !== 1 ? 's' : ''} seleccionado{totalItems !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-forest">
                  ${totalPrice.toFixed(2)} USD
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBaristaView(!showBaristaView)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-forest text-gold text-xs font-bold hover:bg-forest/90 transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>{showBaristaView ? 'Ver Lista Detallada' : 'Modo Mostrar al Barista'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTrayOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-cream-dark text-forest text-xs font-semibold hover:bg-cream-dark/80 transition-colors cursor-pointer"
                >
                  Continuar Explorando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdaptiveDialog>
  );
}
