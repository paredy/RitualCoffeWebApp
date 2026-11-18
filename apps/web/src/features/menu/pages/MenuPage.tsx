import { useState, useMemo } from 'react';
import type { MenuCategory, Product } from '../types/menu';
import { INITIAL_PRODUCTS, MONIN_SYRUP_FLAVORS } from '../data/mockMenu';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailDialog } from '../components/ProductDetailDialog';
import { AdaptiveDialog } from '../../../shared/ui';
import { useCustomerTray } from '../context/CustomerTrayContext';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  GlassWater,
  Info,
  Check,
  ShoppingBag,
} from 'lucide-react';

const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'espresso', label: 'Espresso & Calientes' },
  { id: 'filtrados', label: 'Métodos Filtrados' },
  { id: 'frias', label: 'Bebidas Frías & Frozen' },
  { id: 'cocteles', label: 'Cócteles con Café' },
  { id: 'pasteleria', label: 'Sal y Dulce' },
  { id: 'en-grano', label: 'Café en Grano' },
];

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [isMoninModalOpen, setIsMoninModalOpen] = useState(false);
  const [selectedSyrup, setSelectedSyrup] = useState<string | null>(null);

  const { totalItems, totalPrice, setIsTrayOpen } = useCustomerTray();

  // Compute product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: INITIAL_PRODUCTS.length };
    for (const p of INITIAL_PRODUCTS) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'todos' && product.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (onlyAvailable && !product.isAvailable) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesOrigin = product.origin?.toLowerCase().includes(query);
        const matchesNotes = product.tastingNotes?.some((n) =>
          n.toLowerCase().includes(query)
        );
        const matchesDesc = product.description.toLowerCase().includes(query);
        return matchesName || matchesOrigin || matchesNotes || matchesDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, onlyAvailable]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-forest border border-gold/40 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-forest" />
          <span>Carta Oficial & Especialidad</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest">
          Menú Ritual Coffee Lab
        </h1>
        <p className="mt-4 text-sm sm:text-base text-forest/75 leading-relaxed">
          Cafés de especialidad ecuatorianos de Loja y Pichincha, métodos artesanales de extracción, coctelería de autor con café y opciones del día de sal y dulce en Ambato.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar espresso, carajillo, V60..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream-light border border-cream-dark focus:border-gold focus:outline-none text-sm text-forest placeholder:text-sage/60 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-forest cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right filter controls: Green Monin button + Only Available Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            type="button"
            onClick={() => setIsMoninModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest hover:bg-forest/90 text-cream border border-forest text-xs font-semibold transition-all cursor-pointer shadow-xs hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Jarabes Monin (+ $0.75)</span>
          </button>

          <label className="flex items-center gap-2 text-xs sm:text-sm text-forest cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-gold rounded cursor-pointer"
            />
            <span>Solo disponibles</span>
          </label>
        </div>
      </div>

      {/* Category Pills Slider / Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-forest text-cream font-semibold shadow-sm border border-forest scale-102'
                  : 'bg-cream-light text-forest/80 border border-cream-dark hover:border-gold/50 hover:bg-cream-dark/50'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-gold text-forest font-bold'
                    : 'bg-cream-dark text-forest/60'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Contextual Notice for Cocktails and Pastry only */}
      {selectedCategory === 'cocteles' && (
        <div className="p-4 rounded-2xl bg-gold/15 border border-gold/40 text-forest text-xs sm:text-sm flex items-start gap-3">
          <GlassWater className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <strong className="font-serif font-bold text-forest block mb-0.5">
              Coctelería de Autor con Café Ritual
            </strong>
            <p className="text-forest/80">
              Nuestras creaciones combinan extracciones frescas de espresso y Cold Brew con destilados de clase mundial: Licor 43, Whisky Jameson, Ginebra Bombay Sapphire, Ron San Miguel, Vodka Smirnoff y el tradicional aguardiente ecuatoriano PU-RO.
            </p>
          </div>
        </div>
      )}

      {selectedCategory === 'pasteleria' && (
        <div className="p-4 rounded-2xl bg-cream-light border border-cream-dark text-forest text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <strong className="font-serif font-bold text-forest block mb-0.5">
              Opciones Frescas del Día de Sal y de Dulce
            </strong>
            <p className="text-forest/80">
              Nuestras opciones de repostería y sal son horneadas artesanalmente a diario. Pregunta en barra a tu barista por las opciones disponibles del día.
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-cream-light rounded-3xl border border-cream-dark max-w-lg mx-auto p-8">
          <SlidersHorizontal className="w-10 h-10 text-sage mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-forest">
            No se encontraron productos
          </h3>
          <p className="text-sm text-sage mt-2">
            Intenta cambiar el término de búsqueda o seleccionar otra categoría.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
              setOnlyAvailable(false);
            }}
            className="mt-4 text-xs font-semibold text-gold hover:underline cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Non-invasive Monin Syrups Dialog */}
      <AdaptiveDialog
        isOpen={isMoninModalOpen}
        onClose={() => setIsMoninModalOpen(false)}
        maxWidth="lg"
      >
        <div className="space-y-5">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalización Gourmet</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-forest">
              Jarabes Gourmet MONIN (+ $0.75)
            </h3>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Dale un toque exclusivo a tu capuccino, latte, frozen o soda italiana con cualquiera de nuestros 17 sabores disponibles en barra:
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {MONIN_SYRUP_FLAVORS.map((flavor) => {
              const isSelected = selectedSyrup === flavor;
              return (
                <button
                  key={flavor}
                  onClick={() => setSelectedSyrup(isSelected ? null : flavor)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-forest text-gold font-bold shadow-sm scale-102 border border-forest'
                      : 'bg-cream-light hover:bg-cream-dark text-forest border border-cream-dark'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-gold stroke-[3]" />}
                  <span>{flavor}</span>
                </button>
              );
            })}
          </div>

          {selectedSyrup && (
            <div className="p-3 bg-gold/15 rounded-2xl border border-gold/40 text-xs text-forest flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-forest shrink-0" />
              <span>
                Has elegido <strong className="text-forest font-bold">{selectedSyrup}</strong>. ¡Indícaselo a tu barista al pedir tu bebida en barra (+ $0.75)!
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-cream-dark flex justify-end">
            <button
              onClick={() => setIsMoninModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-forest text-cream text-xs font-semibold hover:bg-forest/90 transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </AdaptiveDialog>

      {/* Adaptive Modal / BottomSheet Detail for Products */}
      <ProductDetailDialog
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Floating Tray / Cart Pill for quick access */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsTrayOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-forest text-cream shadow-2xl border-2 border-gold hover:scale-105 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4 group"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-terracotta text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <span className="text-xs font-semibold block leading-tight">Mi Selección</span>
            <span className="text-[11px] text-gold font-mono font-bold leading-none">
              ${totalPrice.toFixed(2)} USD
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
