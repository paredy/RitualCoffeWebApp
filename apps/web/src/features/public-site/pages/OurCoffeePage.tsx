import { Link } from 'react-router';
import { Button, MethodIcon } from '../../../shared/ui';
import { Sparkles, MapPin, ShieldCheck, ArrowRight, Award } from 'lucide-react';

export function OurCoffeePage() {
  const origins = [
    {
      region: 'Loja — Saraguro & Vilcabamba',
      variety: 'Típica Mejorado & Geisha',
      altitude: '1,900 – 2,150 msnm',
      process: 'Lavado Anaeróbico 48h / Miel Amarillo',
      profile: 'Jazmín, flor de café, bergamota, manzana verde y miel de azahar. Acidez cítrica brillante y cuerpo sedoso.',
      recommendedMethod: 'Hario V60',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
    },
    {
      region: 'Pichincha — Nanegal & Pacto (Chocó Andino)',
      variety: 'Sidra Exclusiva & Bourbon',
      altitude: '1,750 – 1,850 msnm',
      process: 'Miel / Honey & Fermentación en Cereza',
      profile: 'Durazno blanco, uva verde, panela dulce y chocolate semiamargo. Taza sumamente dulce y aromática.',
      recommendedMethod: 'Chemex',
      image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=800&auto=format&fit=crop',
    },
    {
      region: 'Blend Ritual — Loja & Pichincha',
      variety: 'Bourbon Rosado & Caturra',
      altitude: '1,800 msnm',
      process: 'Proceso Natural y Lavado Tradicional',
      profile: 'Cacao ecuatoriano 70%, avellana tostada, caramelo y frutas rojas maduras. Balance perfecto para espresso y leche.',
      recommendedMethod: 'Espresso',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-forest" />
          <span>Trazabilidad & Cosechas Ecuatorianas</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">
          Nuestro Café: De la Finca a la Taza
        </h1>
        <p className="text-base text-forest/80 leading-relaxed">
          Manejamos todos los aspectos de la trazabilidad del café: desde la planta en colaboración con caficultores de las provincias de <strong>Pichincha</strong> y <strong>Loja</strong> hasta la taza en nuestra cafetería en Ambato, donde podrás sentir de primera mano <em>el ritual de un café de verdad</em>.
        </p>
      </div>

      {/* Origin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {origins.map((origin, index) => (
          <div
            key={index}
            className="bg-cream-light border border-cream-dark/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="h-52 w-full overflow-hidden bg-cream-dark relative">
                <img
                  src={origin.image}
                  alt={origin.region}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-forest/85 backdrop-blur-xs text-gold px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <MethodIcon method={origin.recommendedMethod} className="w-4 h-4" />
                  <span>Método: {origin.recommendedMethod}</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-sage font-medium uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    <span>{origin.region}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-forest">{origin.variety}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-cream p-2.5 rounded-xl border border-cream-dark">
                      <span className="text-sage block">Altura</span>
                      <span className="font-semibold text-forest mt-0.5 block">{origin.altitude}</span>
                    </div>
                    <div className="bg-cream p-2.5 rounded-xl border border-cream-dark">
                      <span className="text-sage block">Proceso</span>
                      <span className="font-semibold text-forest mt-0.5 block truncate">{origin.process}</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-forest/5 p-3 rounded-xl border border-forest/10">
                    <span className="text-[11px] font-bold text-forest uppercase tracking-wider block mb-1">
                      Notas en Taza
                    </span>
                    <p className="text-xs text-forest/85 italic leading-relaxed">
                      "{origin.profile}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-cream-dark flex items-center justify-between mt-2">
              <span className="text-xs text-sage flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-gold" /> Cosecha 2026
              </span>
              <Link to="/menu">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Ver en Menú
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Sustainable Commitment Banner */}
      <div className="bg-forest text-cream rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Comercio Directo y Transparente en Ecuador</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
            Alianzas directas con caficultores de Loja y Pichincha
          </h3>
          <p className="text-sm text-cream/70 leading-relaxed">
            Apoyamos micro-lotes de alta puntuación SCA, pagando precios justos que incentivan el cuidado ambiental y el relevo generacional en el campo ecuatoriano.
          </p>
        </div>
        <Link to="/menu">
          <Button variant="gold" size="lg">
            Degustar Hoy
          </Button>
        </Link>
      </div>
    </div>
  );
}
