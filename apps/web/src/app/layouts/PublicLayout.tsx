import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router';
import { Menu, X, Clock, MapPin, Sparkles, ShoppingBag } from 'lucide-react';
import { Button, WhatsAppIcon, InstagramIcon } from '../../shared/ui';
import logoImg from '../../assets/RITUAL_Coffee_Lab_LOGO.jpeg';
import { CustomerTrayProvider, useCustomerTray } from '../../features/menu/context/CustomerTrayContext';
import { CustomerTrayDialog } from '../../features/menu/components/CustomerTrayDialog';

export function PublicLayout() {
  return (
    <CustomerTrayProvider>
      <PublicLayoutContent />
    </CustomerTrayProvider>
  );
}

function PublicLayoutContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems, totalPrice, setIsTrayOpen } = useCustomerTray();

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/nuestro-cafe', label: 'Nuestro Café' },
    { to: '/laboratorio', label: 'El Laboratorio' },
    { to: '/talleres', label: 'Talleres' },
    { to: '/menu', label: 'Menú' },
    { to: '/visitanos', label: 'Visítanos' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest font-sans selection:bg-gold selection:text-forest">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-cream-dark/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Brand Logo & Tagline */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gold/70 shadow-md transition-transform group-hover:scale-105 bg-forest shrink-0">
                <img
                  src={logoImg}
                  alt="Ritual Coffee Lab Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-forest leading-none">
                  Ritual Coffee
                </span>
                <span className="text-[11px] uppercase tracking-widest text-sage font-semibold mt-1">
                  Specialty Coffee Lab
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive
                        ? 'bg-forest text-cream shadow-xs font-semibold'
                        : 'text-forest/80 hover:text-forest hover:bg-forest/5'
                      }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right actions: Selection Button, Menu Button & Barista Link */}
            <div className="hidden sm:flex items-center gap-2.5">
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() => setIsTrayOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest/90 transition-all cursor-pointer shadow-xs border border-gold/40 hover:scale-102"
                  title="Ver mi selección para barra"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 text-gold" />
                    <span className="absolute -top-1.5 -right-2 bg-terracotta text-cream text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  </div>
                  <span className="hidden md:inline">Mi Selección</span>
                  <span className="text-gold font-mono font-bold">${totalPrice.toFixed(2)}</span>
                </button>
              )}

              <Link to="/menu">
                <Button variant="gold" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Ver Carta
                </Button>
              </Link>
              <Link
                to="/barista"
                className="text-xs text-sage hover:text-forest font-medium border border-sage/30 hover:border-forest/50 px-3 py-1.5 rounded-full transition-colors"
                title="Acceso exclusivo para el personal"
              >
                Barista
              </Link>
            </div>

            {/* Mobile menu trigger and Selection Cart */}
            <div className="flex items-center gap-2 lg:hidden">
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() => setIsTrayOpen(true)}
                  className="p-2 rounded-xl bg-forest text-cream flex items-center justify-center relative cursor-pointer"
                  title="Mi Selección"
                >
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  <span className="absolute -top-1 -right-1 bg-terracotta text-cream text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                </button>
              )}
              <Link to="/menu" className="sm:hidden">
                <Button variant="gold" size="sm">Menú</Button>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-forest hover:bg-forest/10 focus:outline-none cursor-pointer transition-colors"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer (Matches 'Ritual Coffee Lab · Navegación emergente móvil.svg') */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-forest text-cream animate-in fade-in duration-200">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-forest-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gold shrink-0">
                <img
                  src={logoImg}
                  alt="Ritual Coffee Lab Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-cream">
                Ritual Coffee Lab
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full text-cream/70 hover:text-cream hover:bg-forest-light transition-colors"
              aria-label="Cerrar navegación"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-2xl text-lg font-serif transition-colors ${isActive
                      ? 'bg-gold text-forest font-bold'
                      : 'text-cream/90 hover:bg-forest-light'
                    }`}
                >
                  <span>{link.label}</span>
                  <span className="text-xs uppercase tracking-widest font-sans opacity-60">Explorar</span>
                </Link>
              );
            })}

            <div className="pt-6 border-t border-forest-light mt-4 space-y-4">
              <Link
                to="/barista"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-4 rounded-xl text-sm text-gold hover:bg-forest-light font-medium"
              >
                <span>Acceso Barista / Operaciones</span>
                <span className="text-xs">→</span>
              </Link>
            </div>

            {/* Info in drawer */}
            <div className="mt-auto pt-6 text-xs text-cream/60 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                <span>Lunes a Domingo: 7:30 AM — 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Calle Central 108, Laboratorio de Café</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-forest text-cream border-t-2 border-gold/40 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Philosophy */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gold/70 shrink-0">
                  <img
                    src={logoImg}
                    alt="Ritual Coffee Lab Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-cream">
                  Ritual Coffee Lab
                </span>
              </div>
              <p className="text-cream/80 text-sm max-w-md leading-relaxed">
                Honramos cada grano desde su origen. Un espacio dedicado a la ciencia, el arte del tostado y el ritual de una taza de café perfecta.
              </p>
              <div className="text-xs text-gold/80 font-mono pt-2">
                PWA Habilitada · Consulta nuestro menú sin conexión
              </div>
            </div>

            {/* Col 2: Enlaces Rápidos */}
            <div className="space-y-3">
              <h3 className="font-serif text-gold font-semibold text-base">Explorar</h3>
              <ul className="space-y-2 text-sm text-cream/75">
                <li><Link to="/nuestro-cafe" className="hover:text-gold transition-colors">Nuestro Café</Link></li>
                <li><Link to="/laboratorio" className="hover:text-gold transition-colors">Métodos de Extracción</Link></li>
                <li><Link to="/talleres" className="hover:text-gold transition-colors">Talleres & Catas</Link></li>
                <li><Link to="/menu" className="hover:text-gold transition-colors">Menú de Temporada</Link></li>
                <li><Link to="/visitanos" className="hover:text-gold transition-colors">Horarios y Ubicación</Link></li>
              </ul>
            </div>

            {/* Col 3: Contacto y Horarios */}
            <div className="space-y-3">
              <h3 className="font-serif text-gold font-semibold text-base">Laboratorio</h3>
              <div className="text-sm text-cream/75 space-y-2">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>Av. Quiz Quiz (entre Salamanca y Valladolid), Ambato, Ecuador</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>Lun - Sáb: 17:00 – 22:00<br />Dom: Cerrado</span>
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://wa.me/593998040381"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-forest-light hover:bg-gold hover:text-forest flex items-center justify-center transition-colors text-cream"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href="https://www.instagram.com/ritualcoffeelabec/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-forest-light hover:bg-gold hover:text-forest flex items-center justify-center transition-colors text-cream"
                    title="Instagram @ritualcoffeelabec"
                  >
                    <InstagramIcon className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-forest-light mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/50 gap-4">
            <p>© {new Date().getFullYear()} Ritual Coffee Lab. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link to="/barista" className="hover:text-gold transition-colors">Portal Baristas</Link>
              <span>·</span>
              <span className="text-gold/70">Diseño fiel a Figma</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Customer Selection Tray Dialog */}
      <CustomerTrayDialog />
    </div>
  );
}
