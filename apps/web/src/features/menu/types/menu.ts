export type MenuCategory = 
  | 'todos'
  | 'espresso'
  | 'filtrados'
  | 'frias'
  | 'cocteles'
  | 'pasteleria'
  | 'en-grano';

export interface Product {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  origin?: string;
  roastLevel?: 'Claro' | 'Medio' | 'Medio-Oscuro';
  tastingNotes?: string[];
  extractionMethod?: string;
  temperature?: 'Caliente' | 'Frío' | 'A elección';
  allergens?: string[];
  isAvailable: boolean;
  isSpecialty?: boolean;
  image?: string;
}
