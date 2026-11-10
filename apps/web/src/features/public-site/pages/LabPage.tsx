import { Link } from 'react-router';
import { Button, MethodIcon } from '../../../shared/ui';
import { Beaker, Gauge, Clock, GraduationCap, ArrowRight } from 'lucide-react';

export function LabPage() {
  const methods = [
    {
      name: 'Hario V60',
      type: 'Goteo Cónico',
      methodKey: 'v60',
      ratio: '1:16 (18g café / 288g agua)',
      time: '2:45 min',
      character: 'Claridad excepcional, resalta acidez cítrica y notas florales delicadas.',
      image: '/methods/v60.jpg',
    },
    {
      name: 'Chemex 6 Tazas',
      type: 'Filtro de Papel Grueso',
      methodKey: 'chemex',
      ratio: '1:15 (30g café / 450g agua)',
      time: '4:00 min',
      character: 'Taza extremadamente limpia, sin sedimentos ni aceites amargos, dulzura pura.',
      image: '/methods/chemex.jpg',
    },
    {
      name: 'Aeropress',
      type: 'Inmersión y Presión',
      methodKey: 'aeropress',
      ratio: '1:12 (16g café / 192g agua)',
      time: '1:30 min',
      character: 'Cuerpo denso, acidez jugosa y notas a fruta madura bien definidas.',
      image: '/methods/aeropress.jpg',
    },
    {
      name: 'Sifón Japonés al Vacío',
      type: 'Vacío y Vapor',
      methodKey: 'sifon',
      ratio: '1:14 (20g café / 280g agua)',
      time: '2:00 min',
      character: 'Experiencia visual y sensorial incomparable. Temperatura alta y taza aromática.',
      image: '/methods/siphon.jpg',
    },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
          <Beaker className="w-3.5 h-3.5 text-forest" />
          <span>Física & Química del Café</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">
          El Laboratorio de Extracción
        </h1>
        <p className="text-base text-forest/80 leading-relaxed">
          Cada método altera la interacción entre agua y compuestos solubles. Te invitamos a elegir tu método favorito y descubrir nuevas dimensiones en cada variedad.
        </p>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {methods.map((method, index) => (
          <div
            key={index}
            className="bg-cream-light border border-cream-dark/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-xs hover:border-gold/60 transition-colors"
          >
            <div className="w-full sm:w-44 h-48 rounded-2xl overflow-hidden bg-cream-dark shrink-0 relative">
              <img
                src={method.image}
                alt={method.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-forest/80 backdrop-blur-xs text-gold flex items-center justify-center shadow-md">
                <MethodIcon method={method.methodKey} className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-forest">{method.name}</h3>
                <span className="text-xs bg-gold/20 text-forest px-2.5 py-1 rounded-full font-semibold">
                  {method.type}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-forest/80 leading-relaxed">
                {method.character}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-cream-dark">
                <div className="flex items-center gap-1.5 text-sage">
                  <Gauge className="w-3.5 h-3.5 text-gold" />
                  <span>Ratio: {method.ratio}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sage">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>Tiempo: {method.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Index to Talleres Call to Action Banner */}
      <div className="bg-cream-light border-2 border-gold/50 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-forest" />
            <span>Escuela de Barismo & Certificaciones</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            Aprende a dominar estos métodos en nuestros Talleres
          </h3>
          <p className="text-sm text-forest/80 leading-relaxed">
            En nuestro programa <strong>Brewing Inicial</strong> y <strong>Barista Inicial</strong> aprenderás a controlar de forma práctica la turbulencia, granulometría y ratios para extraer cafés de clase mundial.
          </p>
        </div>

        <Link to="/talleres" className="shrink-0">
          <Button variant="gold" size="lg" className="whitespace-nowrap gap-2 shadow-md">
            <span>Explorar Cursos & Talleres</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Lab variables */}
      <div className="bg-forest text-cream rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-gold font-serif text-2xl font-bold">92°C — 94°C</span>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-cream">Control Térmico</h4>
            <p className="text-xs text-cream/70">
              Sensores PID para evitar sobre-extracción de amargores astringentes.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-gold font-serif text-2xl font-bold">150 PPM</span>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-cream">Agua Formulada</h4>
            <p className="text-xs text-cream/70">
              Calcio y magnesio en proporciones óptimas para transportar los aromas.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-gold font-serif text-2xl font-bold">EK43 Mahlkönig</span>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-cream">Distribución Granulométrica</h4>
            <p className="text-xs text-cream/70">
              Muelas planas de 98mm para una molienda unimodal perfecta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
