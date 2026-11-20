import { useState, useEffect, useCallback } from 'react';
import type { MenuCategory, Product } from '../types/menu';
import { INITIAL_PRODUCTS } from '../data/mockMenu';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ApiCategory;
  pricingType: 'fixed' | 'variant';
  price: string | null;
  currency: 'USD';
  imageUrl: string | null;
  isAvailable: boolean;
  origin?: string | null;
  roastLevel?: string | null;
  tastingNotes?: string[];
  extractionMethod?: string | null;
  temperature?: string | null;
  allergens?: string[];
  isSpecialty?: boolean;
}

export interface ApiProductListResponse {
  data: ApiProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function mapApiProductToProduct(apiProd: ApiProduct): Product {
  const categorySlug = apiProd.category?.slug as MenuCategory;
  const parsedPrice = apiProd.price ? parseFloat(apiProd.price) : 0;

  return {
    id: apiProd.id || apiProd.slug,
    name: apiProd.name,
    category: categorySlug || 'espresso',
    price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
    description: apiProd.description || '',
    origin: apiProd.origin || undefined,
    roastLevel: (apiProd.roastLevel as 'Claro' | 'Medio' | 'Medio-Oscuro') || undefined,
    tastingNotes: apiProd.tastingNotes?.length ? apiProd.tastingNotes : undefined,
    extractionMethod: apiProd.extractionMethod || undefined,
    temperature: (apiProd.temperature as 'Caliente' | 'Frío' | 'A elección') || undefined,
    allergens: apiProd.allergens?.length ? apiProd.allergens : undefined,
    isAvailable: apiProd.isAvailable,
    isSpecialty: apiProd.isSpecialty,
    image: apiProd.imageUrl || undefined,
  };
}

export async function fetchPublicProducts(limit = 50): Promise<Product[]> {
  const response = await fetch(`/api/v1/menu/products?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Error al consultar productos: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as ApiProductListResponse;
  if (!json || !Array.isArray(json.data) || json.data.length === 0) {
    throw new Error('No se encontraron productos en el servidor');
  }
  return json.data.map(mapApiProductToProduct);
}

export function useMenuProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromApi, setIsFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPublicProducts();
      setProducts(data);
      setIsFromApi(true);
      setError(null);
    } catch (err) {
      console.warn('API de productos no disponible, utilizando datos de respaldo locales:', err);
      setProducts(INITIAL_PRODUCTS);
      setIsFromApi(false);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    isFromApi,
    error,
    refetch: loadProducts,
  };
}
