import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ClipboardList, PlusCircle, UtensilsCrossed, ExternalLink } from 'lucide-react';
import logoImg from '../../assets/RITUAL_Coffee_Lab_LOGO.jpeg';

export function BaristaLayout() {
  const location = useLocation();

  const baristaNav = [
    { to: '/barista/orders', label: 'Comandas & Órdenes', icon: ClipboardList },
    { to: '/barista/pos', label: 'Tomar Orden (POS)', icon: PlusCircle },
    { to: '/barista/menu', label: 'Gestión del Menú', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#051c16] text-cream">
      {/* Barista Header Bar */}
      <header className="sticky top-0 z-40 bg-forest border-b border-forest-light shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Mode Indicator */}
            <div className="flex items-center gap-3">
              <Link to="/barista/orders" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gold/70 shrink-0">
                  <img
                    src={logoImg}
                    alt="Ritual Coffee Lab Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-cream tracking-tight block leading-none">
                    Ritual Barista
                  </span>
                  <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                    Sistema de Barra & Cocina
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-1">
              {baristaNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to === '/barista/orders' && location.pathname === '/barista');
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-gold text-forest shadow-xs'
                        : 'text-cream/80 hover:text-cream hover:bg-forest-light'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Back to Client Site */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs text-cream/75 hover:text-gold transition-colors border border-forest-light px-3 py-1.5 rounded-full"
              >
                <span>Vista Cliente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Mobile subnavigation bar */}
          <div className="flex sm:hidden items-center justify-around py-2 border-t border-forest-light">
            {baristaNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/barista/orders' && location.pathname === '/barista');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
                    isActive ? 'text-gold' : 'text-cream/60'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Barista workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
