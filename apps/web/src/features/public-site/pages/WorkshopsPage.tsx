import { useState } from 'react';
import { Button, WhatsAppIcon, Modal, Badge } from '../../../shared/ui';
import { Award, Clock, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';

interface WorkshopModule {
  id: string;
  moduleNumber: number;
  title: string;
  category: string;
  shortDescription: string;
  quote?: {
    text: string;
    author: string;
  };
  fullDescription: string;
  contents: string[];
  duration: string;
  certification: string;
  investment: string;
  image: string;
  whatsappMessage: string;
}

export function WorkshopsPage() {
  const [activeModalModule, setActiveModalModule] = useState<WorkshopModule | null>(null);

  const modules: WorkshopModule[] = [
    {
      id: 'modulo-1',
      moduleNumber: 1,
      title: 'Módulo 1: Barista Inicial',
      category: 'Barismo Profesional',
      shortDescription: 'Manejo de variables como tiempo, molienda, dosificación, presión y texturización para un espresso perfecto.',
      fullDescription: 'Un barista es el profesional encargado de manejar distintas variables como tiempo, temperatura, tipo de molienda, dosificación, trazabilidad de los granos de café, presión, volumen, ratios, entre otros; con la finalidad de preparar una bebida a base de café excepcional. Todo este conocimiento junto a un servicio extraordinario, permitirá que los consumidores se enamoren de este arte y ciencia del café, contagiando a más coffee lovers cada día desde las barras, generando impacto positivo en toda la cadena de valor.',
      contents: [
        'Introducción al Café',
        'Botánica de la Planta de Café',
        'El Espresso (Variables, molienda y ratios)',
        'Texturización de Leche (Microespuma aterciopelada)',
      ],
      duration: '12 horas presenciales + 8 horas de Actividades Autónomas',
      certification: 'Barista Inicial (20 horas académicas)',
      investment: '$180 USD',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
      whatsappMessage: 'Hola Ritual Coffee Lab, deseo reservar mi cupo para el Módulo 1: Barista Inicial.',
    },
    {
      id: 'modulo-2',
      moduleNumber: 2,
      title: 'Módulo 2: Brewing Inicial',
      category: 'Métodos de Filtrado',
      shortDescription: 'Control riguroso de ratios, molienda, turbulencia y extracción en V60, Prensa Francesa y Aeropress.',
      quote: {
        text: 'Pareciese que la preparación del café es un proceso simple. En realidad, es una interacción muy compleja de muchas variables, las cuales deben estar estrictamente reguladas si se pretende que la infusión resultante sea una bebida deliciosa.',
        author: 'Ted R. Lingle — Manual de Preparación del Café, 1996',
      },
      fullDescription: 'Aprende a controlar todas las variables físico-químicas para una correcta preparación de Café de especialidad en nuestro programa Brewing Inicial, extrayendo los mejores atributos de cada origen.',
      contents: [
        'Ratios de Preparación (Gramos de café vs Agua)',
        'Café vs Agua y Calidad del Agua',
        'Tipos de Molienda y Granulometría',
        'Tiempo, Temperatura y Turbulencia',
        'Métodos de Extracción: Hario V60, French Press, Aeropress',
      ],
      duration: '10 horas presenciales + 10 horas de Actividades Autónomas',
      certification: 'Brewing Inicial (20 horas académicas)',
      investment: '$180 USD',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop',
      whatsappMessage: 'Hola Ritual Coffee Lab, deseo reservar mi cupo para el Módulo 2: Brewing Inicial.',
    },
    {
      id: 'modulo-3',
      moduleNumber: 3,
      title: 'Módulo 3: Arte Latte Básico',
      category: 'Creatividad & Vertido',
      shortDescription: 'Técnicas de vertido libre y etching para crear diseños como punto blanco, corazón y tulipán sobre el café.',
      fullDescription: 'Conocido normalmente con varios nombres como arte en café, arte barista, diseños o dibujos en el café, sin embargo; el nombre más común es Arte Latte. La manera más corta, clara y concisa de describirlo es vaporizar o texturizar la leche y verterla sobre el espresso a manera de crear diseños sobre el café. Literalmente es una forma de que la creatividad sea consumida. Da tus primeros pasos como un artista del café a través de este programa inicial.',
      contents: [
        'Origen del Arte Latte',
        'Química de la Leche y Texturizado',
        'Instrumentos Necesarios (Jarras de precisión)',
        'Protocolo de Preparación del Espresso',
        'Vertido Libre y Técnicas de Caída',
        'Etching (Herramientas de dibujo)',
        'Patrones clásicos: Punto blanco, corazón y tulipán',
      ],
      duration: '8 horas presenciales + 4 horas de Actividades Autónomas',
      certification: 'Arte Latte Básico (12 horas académicas)',
      investment: '$140 USD',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop',
      whatsappMessage: 'Hola Ritual Coffee Lab, deseo reservar mi cupo para el Módulo 3: Arte Latte Básico.',
    },
    {
      id: 'modulo-4',
      moduleNumber: 4,
      title: 'Módulo 4: Introducción a la Catación',
      category: 'Análisis Sensorial',
      shortDescription: 'Entrenamiento sensorial con el protocolo SCA, uso de la rueda de sabores y evaluación de atributos de cata.',
      fullDescription: 'La cata es un método de análisis cuantificable y ampliamente utilizado para evaluar una muestra de café, desde su calidad general hasta las características individuales (por ejemplo, la acidez o el cuerpo) y las notas de sabor específicas. Inicia tu entrenamiento sensorial en el mundo del Café de especialidad junto a nosotros.',
      contents: [
        'Identificación de Sabores Básicos: Acidez, Dulzor, Amargor, Salado, Umami',
        'Introducción a la Rueda de Sabores del Catador de Café',
        'Introducción al Protocolo de Cata Estándar SCA',
        'Uso y Llenado de la Hoja de Cata SCA',
      ],
      duration: '4 horas presenciales + 4 horas de Actividades Autónomas',
      certification: 'Introducción a la Catación (8 horas académicas)',
      investment: '$80 USD',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
      whatsappMessage: 'Hola Ritual Coffee Lab, deseo reservar mi cupo para el Módulo 4: Introducción a la Catación.',
    },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Academy Presentation Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5 text-forest" />
          <span>Centro de Capacitación & Escuela de Baristas</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">
          Talleres & Cursos de Barismo
        </h1>

        <p className="text-sm sm:text-base text-forest/80 max-w-2xl mx-auto leading-relaxed pt-1">
          Más de 15 años formando baristas profesionales e investigando la ciencia del café de especialidad en Ecuador, desde la finca hasta la taza.
        </p>
      </div>

      {/* 4 Authentic Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modules.map((m) => {
          const whatsappUrl = `https://wa.me/593998040381?text=${encodeURIComponent(m.whatsappMessage)}`;

          return (
            <div
              key={m.id}
              className="bg-cream-light border border-cream-dark/90 rounded-3xl overflow-hidden shadow-xs hover:border-gold/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Module Image & Badges */}
                <div className="h-52 w-full overflow-hidden bg-cream-dark relative">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="gold" size="sm">
                      {m.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-forest/90 text-gold px-3 py-1 rounded-full text-xs font-bold font-mono backdrop-blur-xs">
                    {m.investment}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between text-xs text-sage font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{m.duration}</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-forest">
                    {m.title}
                  </h3>

                  <p className="text-sm text-forest/80 leading-relaxed">
                    {m.shortDescription}
                  </p>

                  {/* Highlights / Contenidos resumidos */}
                  <div className="pt-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-sage block mb-2">
                      Temario Principal:
                    </span>
                    <ul className="space-y-1.5 text-xs text-forest/85">
                      {m.contents.slice(0, 3).map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                      {m.contents.length > 3 && (
                        <li className="text-[11px] text-gold-hover font-semibold pl-5">
                          + {m.contents.length - 3} temas más en el curso completo
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Certification Badge */}
                  <div className="bg-forest/5 p-3 rounded-xl border border-forest/10 flex items-center gap-2 text-xs text-forest">
                    <Award className="w-4 h-4 text-gold shrink-0" />
                    <span><strong>Certificación:</strong> {m.certification}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Ver Temario & Reserva tu curso con WhatsApp */}
              <div className="p-6 pt-0 border-t border-cream-dark flex flex-col sm:flex-row items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModalModule(m)}
                  className="w-full sm:w-auto text-xs"
                  rightIcon={<BookOpen className="w-3.5 h-3.5" />}
                >
                  Ver Detalles
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1"
                >
                  <Button
                    variant="gold"
                    size="sm"
                    className="w-full gap-2 shadow-xs"
                    leftIcon={<WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />}
                  >
                    <span>Reserva tu curso</span>
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with Full Course Syllabus & Details */}
      <Modal
        isOpen={!!activeModalModule}
        onClose={() => setActiveModalModule(null)}
        title={activeModalModule?.title || ''}
        maxWidth="lg"
      >
        {activeModalModule && (
          <div className="space-y-6 pt-2">
            {activeModalModule.quote && (
              <blockquote className="bg-gold/15 p-4 rounded-2xl border-l-4 border-gold text-xs sm:text-sm text-forest italic leading-relaxed">
                "{activeModalModule.quote.text}"
                <span className="block mt-1 font-semibold not-italic text-xs text-sage">
                  — {activeModalModule.quote.author}
                </span>
              </blockquote>
            )}

            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-sage mb-2">
                Descripción del Programa
              </h4>
              <p className="text-sm text-forest/90 leading-relaxed">
                {activeModalModule.fullDescription}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-sage mb-3">
                Contenidos & Prácticas:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {activeModalModule.contents.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-cream border border-cream-dark text-xs sm:text-sm text-forest">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-cream p-3 rounded-xl border border-cream-dark">
                <span className="text-sage block">Duración</span>
                <span className="font-semibold text-forest mt-0.5 block">{activeModalModule.duration}</span>
              </div>
              <div className="bg-cream p-3 rounded-xl border border-cream-dark">
                <span className="text-sage block">Inversión</span>
                <span className="font-serif text-base font-bold text-forest mt-0.5 block">{activeModalModule.investment}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-sage">
                Inscripciones directas por WhatsApp con confirmación de fecha.
              </span>
              <a
                href={`https://wa.me/593998040381?text=${encodeURIComponent(activeModalModule.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="gold"
                  size="md"
                  className="w-full sm:w-auto gap-2"
                  leftIcon={<WhatsAppIcon className="w-4 h-4 fill-current" />}
                >
                  <span>Reserva tu curso</span>
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Advisory & Consulting Service Note */}
      <div className="bg-forest text-cream rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gold">
            Servicio a Cafeterías & Emprendedores
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
            Asesoría, calibración y mantenimiento profesional
          </h3>
          <p className="text-sm text-cream/75 leading-relaxed">
            Además de capacitar baristas, brindamos consultoría técnica para la apertura de nuevas cafeterías, diseño de barras de especialidad y calibración de maquinaria en todo el país.
          </p>
        </div>
        <a
          href="https://wa.me/593998040381?text=Hola%20Ritual%20Coffee%20Lab,%20me%20interesa%20asesoría%20para%20mi%20cafetería"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="gold" size="lg" className="whitespace-nowrap gap-2">
            <WhatsAppIcon className="w-4 h-4 fill-current" />
            <span>Consultar Asesoría</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
