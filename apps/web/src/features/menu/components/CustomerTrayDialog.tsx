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
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      <div className="space-y-4">
        {/* Header (with pr-12 to prevent overlap with the close X button) */}
        <div className="pb-3 border-b border-cream-dark pr-10 sm:pr-12">
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
              type="button"
              onClick={() => setIsTrayOpen(false)}
              className="mt-2 px-5 py-2 rounded-xl bg-forest text-cream text-xs font-semibold hover:bg-forest/90 transition-colors cursor-pointer"
            >
              Explorar el Menú
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Barista Mode Button (clean, without 'listo para pedir' banner text) */}
            <button
              type="button"
              onClick={() => setShowBaristaView(!showBaristaView)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-gold text-xs font-bold hover:bg-forest/90 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{showBaristaView ? 'Ver Lista Detallada' : 'Modo Mostrar al Barista'}</span>
            </button>

            {/* Sub-header with Vaciar button (separated from top X) */}
            {!showBaristaView && (
              <div className="flex items-center justify-between text-xs text-sage pt-0.5">
                <span className="font-medium">
                  {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu bandeja
                </span>

                {!confirmClear && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-terracotta hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Vaciar lista</span>
                  </button>
                )}
              </div>
            )}

            {/* Confirm Clear Double-check banner */}
            {confirmClear && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-terracotta/10 border border-terracotta/30 text-xs animate-in fade-in duration-150">
                <span className="text-terracotta font-semibold">¿Vaciar toda la selección?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearTray();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-terracotta text-cream font-bold text-xs hover:bg-terracotta/90 cursor-pointer shadow-xs"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg bg-cream-dark text-forest font-medium text-xs hover:bg-cream cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Quick Barista Ticket Card */}
            {showBaristaView ? (
              <div className="p-4 sm:p-5 bg-forest text-cream rounded-2xl border-2 border-gold space-y-3.5 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2.5 border-b border-forest-light">
                  <span className="text-xs uppercase tracking-widest text-gold font-bold">
                    ☕ Ticket para Barra
                  </span>
                  <button
                    type="button"
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
                      {/* Minus button: stops at 1, never deletes */}
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.product.id, item.quantity - 1);
                          }
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          item.quantity <= 1
                            ? 'bg-cream-dark/40 text-sage/40 cursor-not-allowed'
                            : 'bg-cream-dark hover:bg-gold/20 text-forest cursor-pointer'
                        }`}
                        aria-label="Disminuir"
                        title={item.quantity <= 1 ? 'Mínimo 1 unidad' : 'Disminuir'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-mono text-xs font-bold text-forest w-5 text-center">
                        {item.quantity}
                      </span>

                      {/* Plus button */}
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-cream-dark hover:bg-gold/20 text-forest flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Trash button with double confirmation */}
                      {confirmDeleteId === item.product.id ? (
                        <div className="flex items-center gap-1 bg-terracotta/10 border border-terracotta/30 px-1.5 py-0.5 rounded-lg ml-1 animate-in fade-in duration-150">
                          <span className="text-[10px] text-terracotta font-bold">¿Quitar?</span>
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(item.product.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-terracotta text-cream text-[10px] font-bold hover:bg-terracotta/90 cursor-pointer shadow-xs"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded bg-cream-dark text-forest text-[10px] font-medium hover:bg-cream cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.product.id)}
                          className="w-7 h-7 rounded-lg hover:bg-terracotta/10 text-sage hover:text-terracotta flex items-center justify-center transition-colors cursor-pointer ml-1"
                          aria-label="Eliminar de la selección"
                          title="Eliminar de la selección"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsTrayOpen(false)}
                  className="w-full py-2.5 rounded-full bg-cream-dark hover:bg-cream-dark/80 text-forest text-xs font-semibold transition-colors cursor-pointer"
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
