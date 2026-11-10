import { useState } from 'react';
import { Button } from '../../../shared/ui';
import { Clock, CheckCircle2, Coffee, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  tableOrType: string; // e.g. "Mesa 4" or "Para Llevar"
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 101,
    customerName: 'Santiago Vargas',
    tableOrType: 'Mesa 3 (Barra)',
    createdAt: 'Hace 3 min',
    status: 'pending',
    items: [
      { name: 'V60 Típica Mejorado Loja', quantity: 1, notes: 'Ratio 1:16, servir en jarra de vidrio', price: 4.00 },
      { name: 'Croissant Bicolor 70%', quantity: 1, notes: 'Calentar 2 minutos', price: 2.75 },
    ],
    total: 6.75,
  },
  {
    id: 'ord-102',
    orderNumber: 102,
    customerName: 'Camila Restrepo',
    tableOrType: 'Para Llevar',
    createdAt: 'Hace 8 min',
    status: 'preparing',
    items: [
      { name: 'Flat White Australiano', quantity: 2, notes: '1 con leche de avena, 1 regular', price: 3.25 },
    ],
    total: 6.50,
  },
  {
    id: 'ord-103',
    orderNumber: 103,
    customerName: 'Mateo Gómez',
    tableOrType: 'Mesa 7 (Terraza)',
    createdAt: 'Hace 14 min',
    status: 'ready',
    items: [
      { name: 'Cold Brew Tonic & Romero', quantity: 1, notes: 'Hielo extra', price: 3.75 },
      { name: 'Espresso Doble Especialidad', quantity: 1, price: 2.25 },
    ],
    total: 6.00,
  },
  {
    id: 'ord-104',
    orderNumber: 104,
    customerName: 'Valentina Díaz',
    tableOrType: 'Mesa 1',
    createdAt: 'Hace 25 min',
    status: 'delivered',
    items: [
      { name: 'Chemex Sidra Pichincha', quantity: 1, price: 4.50 },
    ],
    total: 4.50,
  },
];

export function BaristaOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  const advanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        let nextStatus: OrderStatus = order.status;
        if (order.status === 'pending') nextStatus = 'preparing';
        else if (order.status === 'preparing') nextStatus = 'ready';
        else if (order.status === 'ready') nextStatus = 'delivered';
        return { ...order, status: nextStatus };
      })
    );
  };

  const filteredOrders = orders.filter((o) =>
    activeTab === 'all' ? true : o.status === activeTab
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-950/70 text-amber-300 border border-amber-600/40 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-sky-950/70 text-sky-300 border border-sky-600/40 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Coffee className="w-3 h-3 animate-spin" /> En Preparación
          </span>
        );
      case 'ready':
        return (
          <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-600/40 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Lista para Barra
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-forest-light text-cream/50 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Entregada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-forest/80 border border-forest-light p-6 rounded-3xl">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
            Comandas & Órdenes en Vivo
          </h1>
          <p className="text-xs sm:text-sm text-cream/70 mt-1">
            Flujo en tiempo real para baristas y estación de extracción.
          </p>
        </div>
        <Link to="/barista/pos">
          <Button variant="gold" size="md">
            + Tomar Nueva Orden (POS)
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Todas las Órdenes', count: orders.length },
          { id: 'pending', label: 'Pendientes', count: orders.filter((o) => o.status === 'pending').length },
          { id: 'preparing', label: 'En Preparación', count: orders.filter((o) => o.status === 'preparing').length },
          { id: 'ready', label: 'Listas', count: orders.filter((o) => o.status === 'ready').length },
          { id: 'delivered', label: 'Entregadas', count: orders.filter((o) => o.status === 'delivered').length },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gold text-forest'
                  : 'bg-forest/60 text-cream/70 hover:bg-forest-light border border-forest-light'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-forest text-gold' : 'bg-forest-light text-cream/60'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-forest/60 border border-forest-light rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-gold/40 transition-colors"
          >
            <div>
              {/* Order Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-forest-light">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-gold">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-cream/50">• {order.createdAt}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Customer and location */}
              <div className="flex items-center justify-between text-xs pt-3 pb-2 text-cream/80">
                <span className="font-semibold text-cream flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold" />
                  {order.customerName}
                </span>
                <span className="bg-forest px-2.5 py-1 rounded-md text-gold font-medium border border-forest-light">
                  {order.tableOrType}
                </span>
              </div>

              {/* Order Items list */}
              <div className="space-y-2 mt-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-forest/50 p-2.5 rounded-xl border border-forest-light text-xs">
                    <div className="flex items-center justify-between font-medium text-cream">
                      <span>
                        <strong className="text-gold mr-1.5">{item.quantity}x</strong> {item.name}
                      </span>
                      <span className="font-mono text-cream/70">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-amber-200/80 italic mt-1 bg-amber-950/40 p-1.5 rounded-md">
                        Nota: {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Total & Action */}
            <div className="pt-3 border-t border-forest-light flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cream/50 block">Total</span>
                <span className="font-serif text-base font-bold text-gold">
                  ${order.total.toFixed(2)} USD
                </span>
              </div>

              {order.status !== 'delivered' && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => advanceStatus(order.id)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {order.status === 'pending' && 'Preparar'}
                  {order.status === 'preparing' && 'Marcar Lista'}
                  {order.status === 'ready' && 'Entregar'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
