import { useState } from 'react';
import type { Product, MenuCategory } from '../../menu/types/menu';
import { INITIAL_PRODUCTS } from '../../menu/data/mockMenu';
import { Button, Modal, MethodIcon } from '../../../shared/ui';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Coffee, Sparkles } from 'lucide-react';

const EXTRACTION_METHODS = [
  { id: 'Hario V60', label: 'Hario V60', key: 'v60' },
  { id: 'Chemex', label: 'Chemex', key: 'chemex' },
  { id: 'Aeropress', label: 'Aeropress', key: 'aeropress' },
  { id: 'Clever', label: 'Clever Dripper', key: 'clever' },
  { id: 'Prensa Francesa', label: 'Prensa Francesa', key: 'french-press' },
  { id: 'Espresso', label: 'Espresso', key: 'espresso' },
  { id: 'Cold Brew', label: 'Cold Brew', key: 'cold-brew' },
  { id: 'Sifón Japonés', label: 'Sifón Japonés', key: 'siphon' },
];

export function BaristaMenuPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MenuCategory | 'todos'>('todos');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form temporary state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'filtrados',
    price: 4.00,
    description: '',
    origin: '',
    roastLevel: 'Claro',
    extractionMethod: 'Hario V60',
    isAvailable: true,
    isSpecialty: true,
  });

  // Toggle availability directly from the list
  const handleToggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  // Open modal to add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'filtrados',
      price: 4.00,
      description: '',
      origin: '',
      roastLevel: 'Claro',
      extractionMethod: 'Hario V60',
      isAvailable: true,
      isSpecialty: true,
    });
    setIsFormModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsFormModalOpen(true);
  };

  // Save product (create or update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price) return;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? ({ ...p, ...formData, id: editingProduct.id } as Product)
            : p
        )
      );
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod-${Date.now()}`,
        name: formData.name || 'Nuevo Producto',
        category: (formData.category as MenuCategory) || 'filtrados',
        price: Number(formData.price) || 4.00,
        description: formData.description || '',
        extractionMethod: formData.extractionMethod || 'Hario V60',
        isAvailable: formData.isAvailable ?? true,
      } as Product;
      setProducts((prev) => [newProduct, ...prev]);
    }
    setIsFormModalOpen(false);
  };

  // Open delete confirm
  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const filtered = products.filter((p) => {
    if (filterCategory !== 'todos' && p.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.extractionMethod?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-forest/80 border border-forest-light p-6 rounded-3xl">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
            Configuración de Cafés de Especialidad & Menú
          </h1>
          <p className="text-xs sm:text-sm text-cream/70 mt-1">
            Administra variedades, métodos de extracción recomendados y disponibilidad en barra.
          </p>
        </div>
        <Button
          variant="gold"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Agregar Café / Producto
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, origen o método..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-forest/50 border border-forest-light focus:border-gold focus:outline-none text-xs sm:text-sm text-cream placeholder:text-cream/40"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-forest/50 border border-forest-light text-cream text-xs sm:text-sm focus:border-gold focus:outline-none cursor-pointer"
        >
          <option value="todos">Todas las Categorías</option>
          <option value="filtrados">Métodos Filtrados</option>
          <option value="espresso">Espresso & Leche</option>
          <option value="frias">Bebidas Frías</option>
          <option value="cocteles">Cócteles con Café</option>
          <option value="pasteleria">Pastelería & Panadería</option>
          <option value="en-grano">Café en Grano</option>
        </select>
      </div>

      {/* Table / Grid for Products */}
      <div className="bg-forest/60 border border-forest-light rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-cream/90">
            <thead className="bg-forest border-b border-forest-light uppercase tracking-wider text-[11px] text-gold font-semibold">
              <tr>
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Método Recomendado</th>
                <th className="py-4 px-6">Precio USD</th>
                <th className="py-4 px-6 text-center">Disponibilidad</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-light/60">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-forest-light/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-forest-light shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold">
                            <Coffee className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-cream flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isSpecialty && (
                            <span className="text-[10px] bg-gold/20 text-gold border border-gold/40 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>SCA</span>
                            </span>
                          )}
                        </div>
                        {item.origin && (
                          <span className="text-[11px] text-cream/60 line-clamp-1">
                            {item.origin}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 capitalize text-cream/80">
                    {item.category}
                  </td>

                  {/* Método Recomendado con Icono */}
                  <td className="py-4 px-6">
                    {item.extractionMethod ? (
                      <span className="inline-flex items-center gap-1.5 bg-forest-light/80 text-cream px-2.5 py-1 rounded-full border border-forest-light text-xs font-medium">
                        <MethodIcon method={item.extractionMethod} className="w-4 h-4 text-gold shrink-0" />
                        <span>{item.extractionMethod}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-cream/30 italic">No asignado</span>
                    )}
                  </td>

                  <td className="py-4 px-6 font-mono font-semibold text-gold">
                    ${item.price.toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${item.isAvailable
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900'
                          : 'bg-terracotta/20 text-terracotta-light border border-terracotta/50 hover:bg-terracotta/30'
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-terracotta'
                          }`}
                      />
                      <span>{item.isAvailable ? 'En Carta' : 'Agotado'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        aria-label={`Editar ${item.name}`}
                        className="p-1.5 rounded-lg text-cream/70 hover:text-gold hover:bg-forest-light transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        aria-label={`Eliminar ${item.name}`}
                        className="p-1.5 rounded-lg text-cream/70 hover:text-terracotta-light hover:bg-forest-light transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Extraction Method Icon Selector */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Configurar Café / Producto' : 'Agregar Café de Especialidad'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-5 pt-2">
          <div>
            <label className="text-xs font-semibold text-sage uppercase tracking-wider block mb-1">
              Nombre del Café / Bebida *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-cream-dark text-forest focus:border-gold focus:outline-none text-sm font-medium"
              placeholder="Ej: V60 Típica Mejorado Loja"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-sage uppercase tracking-wider block mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl bg-cream border border-cream-dark text-forest focus:border-gold focus:outline-none text-sm"
              >
                <option value="filtrados">Métodos Filtrados</option>
                <option value="espresso">Espresso & Leche</option>
                <option value="frias">Bebidas Frías</option>
                <option value="cocteles">Cócteles con Café</option>
                <option value="pasteleria">Pastelería & Panadería</option>
                <option value="en-grano">Café en Grano</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-sage uppercase tracking-wider block mb-1">
                Precio ($ USD) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={0.25}
                value={formData.price ?? 4.00}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-cream border border-cream-dark text-forest focus:border-gold focus:outline-none text-sm font-mono font-semibold"
              />
            </div>
          </div>

          {/* Selector de Método Recomendado con Iconos Oficiales */}
          <div className="bg-cream p-4 rounded-2xl border border-cream-dark space-y-2.5">
            <label className="text-xs font-semibold text-sage uppercase tracking-wider block flex items-center justify-between">
              <span>Método Recomendado de Extracción (Con Icono)</span>
              <span className="text-gold font-bold normal-case text-xs">
                Seleccionado: {formData.extractionMethod || 'Ninguno'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {EXTRACTION_METHODS.map((m) => {
                const isSelected = formData.extractionMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setFormData({ ...formData, extractionMethod: m.id })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${isSelected
                        ? 'bg-forest text-gold border-gold shadow-xs font-semibold'
                        : 'bg-cream-light text-forest/80 border-cream-dark hover:border-gold/50 hover:bg-cream-dark/50'
                      }`}
                  >
                    <MethodIcon method={m.key} className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gold' : 'text-sage'}`} />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-sage uppercase tracking-wider block mb-1">
              Origen / Finca (Ecuador)
            </label>
            <input
              type="text"
              value={formData.origin || ''}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-cream border border-cream-dark text-forest focus:border-gold focus:outline-none text-sm"
              placeholder="Ej: Loja, Saraguro — Finca San Cayetano"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-sage uppercase tracking-wider block mb-1">
              Descripción Sensorial & Notas
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-cream border border-cream-dark text-forest focus:border-gold focus:outline-none text-sm"
              placeholder="Notas a jazmín, miel, acidez málica brillante..."
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-forest">
              <input
                type="checkbox"
                checked={formData.isAvailable ?? true}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-gold rounded"
              />
              <span>Disponible en carta</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-forest">
              <input
                type="checkbox"
                checked={formData.isSpecialty ?? false}
                onChange={(e) => setFormData({ ...formData, isSpecialty: e.target.checked })}
                className="w-4 h-4 accent-gold rounded"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Café de Especialidad (SCA)</span>
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-dark">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gold">
              {editingProduct ? 'Guardar Cambios' : 'Crear Café'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="sm"
      >
        <div className="text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-forest">
            ¿Eliminar producto?
          </h3>
          <p className="text-sm text-sage leading-relaxed">
            Estás a punto de eliminar <strong className="text-forest">"{productToDelete?.name}"</strong> del menú. Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Eliminar Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
