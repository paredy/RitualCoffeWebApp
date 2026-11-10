import { useState } from 'react';
import { INITIAL_PRODUCTS } from '../../menu/data/mockMenu';
import type { Product, MenuCategory } from '../../menu/types/menu';
import { Button } from '../../../shared/ui';
import { Coffee, Plus, Minus, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export function BaristaPOSPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'todos'>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Mesa 1');
  const [orderCreated, setOrderCreated] = useState(false);

  const availableProducts = INITIAL_PRODUCTS.filter(
    (p) =>
      p.isAvailable &&
      (selectedCategory === 'todos' || p.category === selectedCategory)
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCreateOrder = () => {
    if (cart.length === 0) return;
    setOrderCreated(true);
    setTimeout(() => {
      navigate('/barista/orders');
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left: Product Selection Grid */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'espresso', label: 'Espresso & Leche' },
            { id: 'filtrados', label: 'Filtrados' },
            { id: 'frias', label: 'Bebidas Frías' },
            { id: 'cocteles', label: 'Cócteles con Café' },
            { id: 'pasteleria', label: 'Sal y Dulce' },
            { id: 'en-grano', label: 'Café en Grano' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gold text-forest font-bold'
                  : 'bg-forest/60 text-cream/70 hover:bg-forest-light border border-forest-light'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Fast touchable items grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-forest/60 border border-forest-light hover:border-gold/60 active:scale-98 p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer group shadow-sm min-h-[110px]"
            >
              <div>
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold block">
                  {p.category}
                </span>
                <h4 className="font-serif text-sm font-bold text-cream mt-1 line-clamp-2 group-hover:text-gold transition-colors">
                  {p.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-forest-light/60 mt-2">
                <span className="font-mono text-xs font-semibold text-cream/90">
                  ${p.price.toFixed(2)}
                </span>
                <span className="w-6 h-6 rounded-full bg-forest-light group-hover:bg-gold group-hover:text-forest flex items-center justify-center text-xs text-cream transition-colors">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Current Ticket / Bill */}
      <div className="lg:col-span-5 xl:col-span-4 bg-forest/80 border border-forest-light rounded-3xl p-5 shadow-2xl flex flex-col justify-between h-[calc(100vh-140px)] sticky top-20">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-forest-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg font-bold text-cream">
                Nueva Comanda
              </h2>
            </div>
            <span className="text-xs bg-forest-light px-2 py-0.5 rounded text-cream/70 font-mono">
              Ticket #{Math.floor(Math.random() * 800) + 100}
            </span>
          </div>

          {/* Customer & Table details */}
          <div className="grid grid-cols-2 gap-2 py-3 border-b border-forest-light">
            <div>
              <label className="text-[10px] uppercase font-semibold text-cream/60 block mb-1">
                Cliente
              </label>
              <input
                type="text"
                placeholder="Nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-forest border border-forest-light text-cream text-xs focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-cream/60 block mb-1">
                Ubicación
              </label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-forest border border-forest-light text-cream text-xs focus:border-gold focus:outline-none cursor-pointer"
              >
                <option value="Mesa 1">Mesa 1</option>
                <option value="Mesa 2">Mesa 2</option>
                <option value="Mesa 3">Mesa 3 (Barra)</option>
                <option value="Mesa 4">Mesa 4 (Terraza)</option>
                <option value="Para Llevar">Para Llevar</option>
              </select>
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-cream/40 py-12">
                <Coffee className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Toca un producto de la izquierda para agregarlo a la orden.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-forest/60 p-2.5 rounded-xl border border-forest-light space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cream truncate pr-2">
                      {item.product.name}
                    </span>
                    <span className="font-mono text-gold font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Nota (ej. sin azúcar, leche avena)"
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      className="text-[11px] bg-forest/80 border border-forest-light/60 px-2 py-1 rounded text-cream/80 placeholder:text-cream/30 flex-1 mr-2 focus:border-gold focus:outline-none"
                    />

                    <div className="flex items-center gap-1 bg-forest-light px-1.5 py-0.5 rounded-lg shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-cream hover:text-gold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold text-cream">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-5 h-5 flex items-center justify-center text-cream hover:text-gold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer & Checkout button */}
        <div className="pt-3 border-t border-forest-light space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cream/70">Total a Pagar</span>
            <span className="font-serif text-2xl font-bold text-gold">
              ${total.toFixed(2)} USD
            </span>
          </div>

          <Button
            variant="gold"
            size="lg"
            disabled={cart.length === 0 || orderCreated}
            onClick={handleCreateOrder}
            className="w-full text-base font-bold shadow-lg"
          >
            {orderCreated ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                ¡Comanda Enviada a Barra!
              </span>
            ) : (
              'Enviar a Barra'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
