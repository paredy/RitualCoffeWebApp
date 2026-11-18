import { MapPin, Clock, Phone, ExternalLink, Navigation, Sparkles } from 'lucide-react';
import { Button, WhatsAppIcon, InstagramIcon, GoogleMapsIcon } from '../../../shared/ui';

export function VisitUsPage() {
  const googleMapsUrl = 'https://maps.app.goo.gl/ZrC3PLNpepjmrrGY9';
  const instagramUrl = 'https://www.instagram.com/ritualcoffeelabec/';
  const whatsappUrl = 'https://wa.me/593998040381';

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-forest text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-forest" />
          <span>Ubicación & Contacto</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">
          Ven a vivir el Ritual
        </h1>
        <p className="text-base text-forest/80 leading-relaxed">
          Un espacio diseñado para hacer una pausa, disfrutar del aroma a café recién tostado y conversar con nuestros baristas en Ambato, Ecuador.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact details */}
        <div className="lg:col-span-5 space-y-6 bg-cream-light p-6 sm:p-8 rounded-3xl border border-cream-dark shadow-xs">
          <div>
            <h3 className="font-serif text-2xl font-bold text-forest mb-2">
              Ritual Coffee Lab
            </h3>
            <p className="text-sm text-forest/80 leading-relaxed">
              Barra de café de especialidad, métodos artesanales de filtrado y un ambiente relajado pensado para amantes del buen café.
            </p>
          </div>

          <div className="space-y-4 text-sm text-forest/90 pt-4 border-t border-cream-dark">
            {/* Dirección */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-forest">Dirección</span>
                <span>Av. Quiz Quiz (entre Salamanca y Valladolid), Ciudadela España</span>
                <span className="text-xs text-sage block mt-0.5">Ambato, Tungurahua, Ecuador</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold-hover hover:underline font-semibold mt-1"
                >
                  <span>Ver en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Horarios */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-forest">Horarios de Atención</span>
                <div className="text-xs text-sage space-y-0.5 mt-0.5">
                  <p className="font-medium text-forest">Lunes a Sábado: 17:00 – 22:00</p>
                  <p className="text-sage">Domingos: Cerrado</p>
                </div>
              </div>
            </div>

            {/* Teléfono / Reservas */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-forest">Atención & Pedidos</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest hover:text-gold transition-colors font-medium block mt-0.5"
                >
                  +593 99 804 0381
                </a>
              </div>
            </div>
          </div>

          {/* Social buttons with official brand icons */}
          <div className="pt-4 border-t border-cream-dark flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px]"
              title="Escríbenos por WhatsApp"
            >
              <Button
                variant="gold"
                size="md"
                className="w-full gap-2 shadow-xs"
                leftIcon={<WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />}
              >
                <span>WhatsApp</span>
              </Button>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px]"
              title="Síguenos en Instagram @ritualcoffeelabec"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full gap-2 border-forest/30 hover:border-forest shadow-xs"
                leftIcon={<InstagramIcon className="w-4 h-4 fill-current shrink-0" />}
              >
                <span>Instagram</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Google Maps Interactive Section */}
        <div className="lg:col-span-7 bg-forest text-cream rounded-3xl overflow-hidden shadow-xl border-2 border-gold/40 flex flex-col">
          {/* Map Header Bar */}
          <div className="p-4 sm:p-5 bg-forest-dark border-b border-forest-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0">
                <GoogleMapsIcon className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-cream leading-tight">
                  Ritual Coffe Lab en Google Maps
                </h4>
                <span className="text-[11px] text-cream/70 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ambato, Ecuador · Barra de Especialidad</span>
                </span>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto"
            >
              <Button
                variant="gold"
                size="sm"
                className="gap-1.5 text-xs whitespace-nowrap"
                rightIcon={<Navigation className="w-3.5 h-3.5" />}
              >
                Cómo Llegar
              </Button>
            </a>
          </div>

          {/* Embedded Interactive Google Maps Iframe */}
          <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] bg-forest-light overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.288289569766!2d-78.6417824!3d-1.2562087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d381f23005852f%3A0xbbcbc6aeaa630bbf!2sRitual%20Coffe%20Lab!5e0!3m2!1ses!2sec!4v1731190000000!5m2!1ses!2sec"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Ritual Coffee Lab en Google Maps"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
