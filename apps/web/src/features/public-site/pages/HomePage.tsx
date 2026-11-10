import { Link } from 'react-router';
import { Button } from '../../../shared/ui';
import { INITIAL_PRODUCTS } from '../../menu/data/mockMenu';
import { ProductCard } from '../../menu/components/ProductCard';
import { ProductDetailDialog } from '../../menu/components/ProductDetailDialog';
import { useState } from 'react';
import type { Product } from '../../menu/types/menu';
import { Sparkles, ArrowRight, Award, Compass, Flame, Droplets } from 'lucide-react';

export function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const featuredProducts = INITIAL_PRODUCTS.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 text-forest border border-gold/40 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Micro-lotes & Tueste Artesanal</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-forest leading-[1.1]">
                El arte y la ciencia del <span className="italic font-normal text-gold">café de especialidad</span>.
              </h1>

              <p className="text-base sm:text-lg text-forest/80 max-w-xl leading-relaxed">
                En Ritual Coffee Lab exploramos cada origen con métodos de extracción milimétricos y tueste personalizado. Una experiencia sensorial única en cada taza.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/menu">
                  <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explorar la Carta
                  </Button>
                </Link>
                <Link to="/visitanos">
                  <Button variant="outline" size="lg">
                    Visítanos
                  </Button>
                </Link>
              </div>

              {/* Badges / Accents */}
              <div className="pt-6 border-t border-cream-dark/90 grid grid-cols-3 gap-4">
                <div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-forest block">86+</span>
                  <span className="text-xs text-sage font-medium">Puntos SCA</span>
                </div>
                <div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-forest block">100%</span>
                  <span className="text-xs text-sage font-medium">Trazabilidad de origen</span>
                </div>
                <div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-forest block">6</span>
                  <span className="text-xs text-sage font-medium">Métodos de filtrado</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image Frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40 aspect-4/5">
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop"
                    alt="Ritual Coffee Barista Pour Over"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-forest/80 via-transparent to-transparent" />

                  {/* Floating badge inside hero image */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-cream-light/95 backdrop-blur-md border border-gold/50 shadow-lg">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gold block">
                      Recomendación del Barista
                    </span>
                    <h4 className="font-serif text-lg font-bold text-forest mt-0.5">
                      V60 Típica Mejorado Loja — Cosecha 2026
                    </h4>
                    <p className="text-xs text-sage mt-1">
                      Cultivado a 2,050 msnm en Saraguro. Notas a jazmín silvestre, bergamota y miel de azahar.
                    </p>
                  </div>
                </div>

                {/* Decorative background geometry */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gold/15 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-forest/10 rounded-full blur-3xl -z-10" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy / Pillars Section */}
      <section className="bg-forest text-cream py-16 lg:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-gold">
              Filosofía Ritual
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-cream">
              Cada paso es un tributo al origen
            </h2>
            <p className="text-cream/70 text-sm mt-3">
              No solo servimos café; conectamos las montañas con tu taza mediante rigor técnico y pasión por el detalle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-forest-light/60 p-6 rounded-2xl border border-gold/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cream">1. Micro-Lotes Directos</h3>
              <p className="text-sm text-cream/70 leading-relaxed">
                Compramos directamente a caficultores de Pichincha y Loja, pagando precios justos y garantizando trazabilidad total de la planta a la taza.
              </p>
            </div>

            <div className="bg-forest-light/60 p-6 rounded-2xl border border-gold/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cream">2. Tueste Científico</h3>
              <p className="text-sm text-cream/70 leading-relaxed">
                Curvas de tueste desarrolladas en tostadora de laboratorio para realzar la acidez floral natural y la dulzura intrínseca de cada variedad.
              </p>
            </div>

            <div className="bg-forest-light/60 p-6 rounded-2xl border border-gold/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cream">3. Extracción de Precisión</h3>
              <p className="text-sm text-cream/70 leading-relaxed">
                Agua remineralizada a 150 ppm, molienda micrométrica y control térmico riguroso en métodos filtrados y espresso de alta gama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-sage">
              Destacados de Barra
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
              Favoritos de la temporada
            </h2>
          </div>
          <Link to="/menu">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Ver menú completo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Workshops & Experiences Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-cream-light border-2 border-gold/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-forest" />
              <span>Academia & Talleres</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Aprende el arte de la cata y los métodos artesanales
            </h2>
            <p className="text-sm text-forest/75 leading-relaxed">
              Descubre los secretos de una extracción profesional con nuestros baristas certificados. Talleres de fin de semana para apasionados y principiantes.
            </p>
            <div className="pt-2">
              <Link to="/talleres">
                <Button variant="gold" size="md">
                  Ver Próximos Talleres
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 h-56 rounded-2xl overflow-hidden shadow-lg border border-gold/40 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
              alt="Taller de Barismo Ritual Coffee"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Adaptive Modal for Preview */}
      <ProductDetailDialog
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
