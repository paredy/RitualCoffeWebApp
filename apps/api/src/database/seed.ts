import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createConnection, Types } from 'mongoose';
import { fileURLToPath } from 'node:url';
import { CategorySchema } from '../categories/schemas/category.schema.js';
import { ProductSchema } from '../products/schemas/product.schema.js';

interface RawSeedProduct {
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  description: string;
  origin?: string;
  roastLevel?: string;
  tastingNotes?: string[];
  extractionMethod?: string;
  temperature?: string;
  allergens?: string[];
  isAvailable: boolean;
  isSpecialty?: boolean;
  image?: string;
}

const SEED_CATEGORIES = [
  {
    name: 'Esencia Espresso',
    slug: 'espresso',
    description: 'Extracciones de espresso puras y balanceadas con leche vaporizada.',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Brewing & Filtrados',
    slug: 'filtrados',
    description: 'Métodos manuales de filtrado que destacan perfiles aromáticos únicos.',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Bebidas Frías & Frozen',
    slug: 'frias',
    description: 'Bebidas refrescantes de café en frío, sodas italianas e infusiones.',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Cócteles con Café',
    slug: 'cocteles',
    description: 'Combinaciones de autor con café de especialidad y destilados finos.',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: 'De Sal y De Dulce',
    slug: 'pasteleria',
    description: 'Repostería y opciones artesanales para maridar con tu café.',
    sortOrder: 5,
    isActive: true,
  },
  {
    name: 'En Grano para Llevar',
    slug: 'en-grano',
    description: 'Micro-lotes tostados en casa para preparar en tu método preferido.',
    sortOrder: 6,
    isActive: true,
  },
];

const SEED_PRODUCTS: RawSeedProduct[] = [
  // ================= ESPRESSO & CALIENTES =================
  {
    name: 'Espresso Simple',
    slug: 'espresso-simple',
    categorySlug: 'espresso',
    price: 1.5,
    description: 'Extracción donde utilizamos de 10 a 12 gramos de café para obtener un volumen concentrado de 30 ml con densa crema avellana.',
    origin: 'Blend de la Casa (Loja & Pichincha)',
    roastLevel: 'Medio',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Espresso Doble',
    slug: 'espresso-doble',
    categorySlug: 'espresso',
    price: 2.25,
    description: 'Extracción donde utilizamos de 19 hasta 22 gramos de café para obtener un volumen de 60 ml con máxima potencia aromática.',
    origin: 'Blend de la Casa (Loja & Pichincha)',
    roastLevel: 'Medio',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Americano (6 oz)',
    slug: 'americano-6-oz',
    categorySlug: 'espresso',
    price: 1.75,
    description: 'Extracción de un espresso simple más agua caliente en taza clásica de 6 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Americano Grande (9 oz)',
    slug: 'americano-grande-9-oz',
    categorySlug: 'espresso',
    price: 2.5,
    description: 'Extracción de un espresso doble más agua caliente en taza generosa de 9 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Capuccino (6 oz)',
    slug: 'capuccino-6-oz',
    categorySlug: 'espresso',
    price: 2.0,
    description: 'Extracción de un espresso simple más leche texturizada con microespuma aterciopelada en taza de 6 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Capuccino Grande (9 oz)',
    slug: 'capuccino-grande-9-oz',
    categorySlug: 'espresso',
    price: 2.75,
    description: 'Extracción de un espresso doble más leche finamente texturizada en taza de 9 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Mocaccino (Chocolate Blanco o Negro)',
    slug: 'mocaccino',
    categorySlug: 'espresso',
    price: 2.5,
    description: 'Extracción de un espresso simple más 1 onza de chocolate líquido Monin más leche texturizada en taza de 9 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: '/products/mocaccino.jpg',
  },
  {
    name: 'Latte (9 oz)',
    slug: 'latte-9-oz',
    categorySlug: 'espresso',
    price: 2.0,
    description: 'Extracción de un espresso simple más abundante leche texturizada suave en taza de 9 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Macchiato (2 oz)',
    slug: 'macchiato-2-oz',
    categorySlug: 'espresso',
    price: 1.75,
    description: 'Extracción de un espresso simple manchado con un toque sutil de microespuma de leche en taza de 2 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Cortado (3 oz)',
    slug: 'cortado-3-oz',
    categorySlug: 'espresso',
    price: 1.8,
    description: 'Extracción de un espresso simple balanceado con igual proporción de leche texturizada en taza de 3 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Café Bombón (2 oz)',
    slug: 'cafe-bombon-2-oz',
    categorySlug: 'espresso',
    price: 2.0,
    description: 'Extracción de un espresso simple vertido sobre una capa dulce de leche condensada en taza de 2 onzas.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Chocolate Caliente Artesanal',
    slug: 'chocolate-caliente-artesanal',
    categorySlug: 'espresso',
    price: 2.5,
    description: 'Deliciosa taza de chocolate preparado con cacao ecuatoriano seleccionado y leche cremosa vaporizada.',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Chai Latte',
    slug: 'chai-latte',
    categorySlug: 'espresso',
    price: 2.5,
    description: 'Infusión aromática de té negro con especias tradicionales (canela, cardamomo, clavo, jengibre) y leche texturizada.',
    temperature: 'Caliente',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
  },

  // ================= BREWING & FILTRADOS =================
  {
    name: 'Hario V60',
    slug: 'hario-v60',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Método de goteo cónico japonés con estrías espirales a 60° que favorecen un flujo constante. Resalta la acidez cítrica brillante, notas florales delicadas y una taza de cuerpo ligero y sedoso.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Claro',
    tastingNotes: ['250 ml / 500 ml', 'Acidez Cítrica', 'Notas Florales'],
    extractionMethod: 'Hario V60',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/v60.jpg',
  },
  {
    name: 'Chemex',
    slug: 'chemex',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Elegante matraz de vidrio de borosilicato con collar de madera y filtro de papel grueso. Retiene aceites y sedimentos finos, entregando una taza sumamente limpia, cristalina y con dulzura natural pura.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Claro',
    tastingNotes: ['250 ml / 500 ml', 'Taza Limpia', 'Dulzura Suave'],
    extractionMethod: 'Chemex',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/chemex.jpg',
  },
  {
    name: 'Aeropress',
    slug: 'aeropress',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Extracción versátil que combina inmersión total y presión de aire manual por émbolo. Brinda una extracción rápida de 1:30 min con cuerpo aterciopelado, acidez jugosa y notas a fruta madura.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Claro',
    tastingNotes: ['250 ml', 'Cuerpo Denso', 'Acidez Jugosa'],
    extractionMethod: 'Aeropress',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/aeropress.jpg',
  },
  {
    name: 'Prensa Francesa',
    slug: 'prensa-francesa',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Inmersión clásica directa de 4 minutos con émbolo de malla metálica. Al no usar papel, conserva todos los aceites naturales y micronutrientes del café, otorgando un cuerpo robusto y profundo.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Medio',
    tastingNotes: ['250 ml / 500 ml', 'Cuerpo Robusto', 'Notas a Cacao'],
    extractionMethod: 'Prensa Francesa',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/french-press.jpg',
  },
  {
    name: 'Clever Dripper',
    slug: 'clever-dripper',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Sistema híbrido inteligente que une el control de inmersión total con la limpieza del filtrado en papel mediante válvula hermética. Perfil armónico, dulce y con acidez balanceada.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Claro',
    tastingNotes: ['250 ml', 'Equilibrio Dulce', 'Claridad Media'],
    extractionMethod: 'Clever',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/clever.jpg',
  },
  {
    name: 'Sifón Japonés al Vacío',
    slug: 'sifon-japones-al-vacio',
    categorySlug: 'filtrados',
    price: 0,
    description: 'Espectacular método teatral que utiliza presión de vapor y vacío continuo. Su temperatura constante produce una taza extremadamente pura, aromática, viva y de retrogusto prolongado.',
    origin: 'Loja / Pichincha, Ecuador',
    roastLevel: 'Claro',
    tastingNotes: ['500 ml', 'Aroma Intenso', 'Taza Cristalina'],
    extractionMethod: 'Sifón Japonés',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: '/methods/siphon.jpg',
  },

  // ================= BEBIDAS FRÍAS & FROZEN =================
  {
    name: 'Cold Brew Ritual (30 Horas)',
    slug: 'cold-brew-ritual-30-horas',
    categorySlug: 'frias',
    price: 2.5,
    description: 'Utilizamos un método de maceración en frío por 30 horas utilizando café blend de la casa Ritual. Extremadamente refrescante y suave.',
    origin: 'Blend Ritual Ecuatoriano',
    roastLevel: 'Medio',
    extractionMethod: 'Cold Brew',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Ice Latte',
    slug: 'ice-latte',
    categorySlug: 'frias',
    price: 2.5,
    description: 'Utilizamos hielos, leche fresca, jarabe natural y una extracción doble de espresso con café especial.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Frozen Capuccino',
    slug: 'frozen-capuccino',
    categorySlug: 'frias',
    price: 3.5,
    description: 'Utilizamos una extracción doble de espresso y licuamos con hielos, leche y jarabe en frappé helado.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Frozen Mocaccino Amazónico',
    slug: 'frozen-mocaccino-amazonico',
    categorySlug: 'frias',
    price: 4.0,
    description: 'Extracción doble de espresso licuado con hielos, leche, chocolate Monin y auténtico cacao Sarsayacu Amazónico.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    allergens: ['Lácteos'],
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Soda Italiana Artesanal',
    slug: 'soda-italiana-artesanal',
    categorySlug: 'frias',
    price: 3.0,
    description: 'Bebida gasificada artesanal con sirope gourmet Monin. Sabores: Manzana verde, Mora, Mora azul, Granada, Caramelo salado, Marshmallows tostados, Mango picante o Piña chipotle.',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Infusiones con Frutas Deshidratadas',
    slug: 'infusiones-frutas-deshidratadas',
    categorySlug: 'frias',
    price: 2.0,
    description: 'Infusión frutal natural elaborada con mezclas aromáticas de frutos deshidratados.',
    temperature: 'A elección',
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Agua Mineral / Sin Gas',
    slug: 'agua-mineral-sin-gas',
    categorySlug: 'frias',
    price: 1.0,
    description: 'Botella de agua pura embotellada, disponible con gas o sin gas.',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: false,
    image: '/products/agua-mineral.jpg',
  },

  // ================= CÓCTELES CON CAFÉ =================
  {
    name: 'Café Irlandés',
    slug: 'cafe-irlandes',
    categorySlug: 'cocteles',
    price: 8.0,
    description: 'Extracción de un espresso doble más agua caliente, auténtico Whisky Irlandés JAMESON, sirope de caramelo y crema de leche batida.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Ice Carajillo',
    slug: 'ice-carajillo',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Utilizamos una extracción doble de espresso más Licor 43 batido con fuerza en coctelera sobre hielo.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Fire Carajillo',
    slug: 'fire-carajillo',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Utilizamos una extracción doble de espresso caliente más Licor 43 flameado y agua caliente.',
    extractionMethod: 'Espresso',
    temperature: 'Caliente',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Carajillo de Altura',
    slug: 'carajillo-de-altura',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Extracción doble de espresso combinada con PU-RO aguardiente premium ecuatoriano y batido en coctelera.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Espresso Moscow Mule',
    slug: 'espresso-moscow-mule',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Extracción doble de espresso, jarabe de jengibre, zumo de limón fresco, vodka neutro Smirnoff, hielos y cerveza de jengibre.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Espresso Martini',
    slug: 'espresso-martini',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Extracción doble de espresso recién colado, vodka neutro Smirnoff o SKYY y jarabe natural con espuma aterciopelada.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: '/products/espresso-martini.jpg',
  },
  {
    name: 'Espresso Mai Tai',
    slug: 'espresso-mai-tai',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Extracción doble de espresso, Ron San Miguel Añejo y Blanco, jugos tropicales cítricos y sirope Orgeat Almond de Monin.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Cold Brew Negroni',
    slug: 'cold-brew-negroni',
    categorySlug: 'cocteles',
    price: 8.0,
    description: 'Utilizamos el Cold Brew macerado de la casa Ritual más Campari, Vermouth Rosso y ginebra Bombay Sapphire.',
    extractionMethod: 'Cold Brew',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Mojito Espresso',
    slug: 'mojito-espresso',
    categorySlug: 'cocteles',
    price: 4.0,
    description: 'Extracción simple de espresso, hierbabuena o menta fresca, zumo de limón, jarabe, Ron San Miguel Silver, hielos y agua mineral.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Gin Tónic Coffe',
    slug: 'gin-tonic-coffe',
    categorySlug: 'cocteles',
    price: 7.0,
    description: 'Extracción simple de espresso, zumo fresco de limón, Ginebra Bombay Sapphire, hielos y agua tónica.',
    extractionMethod: 'Espresso',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Piña Cafeteada',
    slug: 'pina-cafeteada',
    categorySlug: 'cocteles',
    price: 6.0,
    description: 'Nuestro Cold Brew con maceración de 24 horas, Ron San Miguel blanco, crema de coco dulce y jugo de piña tropical.',
    extractionMethod: 'Cold Brew',
    temperature: 'Frío',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop',
  },

  // ================= DE SAL Y DE DULCE =================
  {
    name: 'Opciones del Día de Sal y de Dulce',
    slug: 'opciones-del-dia-sal-y-dulce',
    categorySlug: 'pasteleria',
    price: 2.5,
    description: 'Pregunta en barra por las opciones artesanales preparadas cada día: croissants de mantequilla, tartaletas, empanadas y bocadillos de masa madre.',
    temperature: 'Caliente',
    allergens: ['Gluten', 'Lácteos'],
    isAvailable: true,
    isSpecialty: false,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
  },

  // ================= EN GRANO PARA LLEVAR =================
  {
    name: 'Bolsa Café Tostado Ritual (250g)',
    slug: 'bolsa-cafe-tostado-ritual-250g',
    categorySlug: 'en-grano',
    price: 10.0,
    description: 'Café de especialidad en grano entero o molido para tu método preferido. Cosechas frescas de Loja y Pichincha tostadas en nuestro laboratorio.',
    origin: 'Loja & Pichincha, Ecuador',
    roastLevel: 'Claro',
    extractionMethod: 'Hario V60',
    temperature: 'A elección',
    isAvailable: true,
    isSpecialty: true,
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=800&auto=format&fit=crop',
  },
];

async function seed(): Promise<void> {
  await ConfigModule.forRoot({
    envFilePath: [
      fileURLToPath(new URL('../../.env', import.meta.url)),
      '.env',
    ],
  });

  const config = new ConfigService();
  const host = config.getOrThrow<string>('MONGO_HOST');
  const database = config.getOrThrow<string>('MONGO_DATABASE');
  const user = encodeURIComponent(config.getOrThrow<string>('MONGO_USER'));
  const password = encodeURIComponent(config.getOrThrow<string>('MONGO_PASSWORD'));
  const port = config.getOrThrow<string>('MONGO_PORT');

  const uri = `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=${database}`;

  console.log('Conectando a MongoDB para sembrar el menú...');
  const connection = createConnection(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await connection.asPromise();
    console.log('Conexión establecida con éxito.');

    const CategoryModel = connection.model('Category', CategorySchema);
    const ProductModel = connection.model('Product', ProductSchema);

    // 1. Sincronizar categorías
    const categoryMap = new Map<string, Types.ObjectId>();
    for (const catData of SEED_CATEGORIES) {
      const categoryDoc = await CategoryModel.findOneAndUpdate(
        { slug: catData.slug },
        { $set: catData },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      categoryMap.set(catData.slug, categoryDoc._id as Types.ObjectId);
    }
    console.log(`✓ Sincronizadas ${SEED_CATEGORIES.length} categorías.`);

    // 2. Sincronizar productos
    let sortCounter = 1;
    for (const prodData of SEED_PRODUCTS) {
      const categoryId = categoryMap.get(prodData.categorySlug);
      if (!categoryId) {
        throw new Error(`Categoría desconocida: ${prodData.categorySlug}`);
      }

      const productPayload = {
        name: prodData.name,
        slug: prodData.slug,
        description: prodData.description,
        categoryId,
        pricingType: 'fixed',
        price: Types.Decimal128.fromString(prodData.price.toFixed(2)),
        variants: [],
        extras: [],
        imageUrl: prodData.image ?? null,
        isAvailable: prodData.isAvailable,
        isVisible: true,
        isArchived: false,
        sortOrder: sortCounter++,
        origin: prodData.origin ?? null,
        roastLevel: prodData.roastLevel ?? null,
        tastingNotes: prodData.tastingNotes ?? [],
        extractionMethod: prodData.extractionMethod ?? null,
        temperature: prodData.temperature ?? null,
        allergens: prodData.allergens ?? [],
        isSpecialty: prodData.isSpecialty ?? false,
      };

      await ProductModel.findOneAndUpdate(
        { slug: prodData.slug },
        { $set: productPayload },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`✓ Sincronizados ${SEED_PRODUCTS.length} productos sin pérdida de datos.`);
    console.log('¡Sincronización del menú completada con éxito!');
  } finally {
    await connection.close();
  }
}

try {
  await seed();
} catch (error) {
  console.error('Error durante la sincronización de la base de datos:', error);
  process.exitCode = 1;
}
