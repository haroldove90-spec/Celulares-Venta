import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Star, 
  Edit3, 
  Trash2, 
  Smartphone, 
  Upload, 
  Check, 
  Search, 
  QrCode,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Product, ProductCategory } from '../../types/pos';
import { CATEGORIES } from '../../data/sampleData';

interface Props {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export const InventoryManager: React.FC<Props> = ({ products, onUpdateProducts }) => {
  const [activeTab, setActiveTab] = useState<'all' | ProductCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchImeiOpen, setIsBatchImeiOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('celulares');
  const [price, setPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [image, setImage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [requiresImei, setRequiresImei] = useState(false);
  const [barcode, setBarcode] = useState('');

  // Batch IMEI form states
  const [batchProductId, setBatchProductId] = useState<string>('');
  const [batchImeisText, setBatchImeisText] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeTab === 'all' || p.category === activeTab;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setShortName('');
    setCategory('celulares');
    setPrice(100);
    setCost(40);
    setStock(10);
    setImage('https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80');
    setIsFavorite(false);
    setRequiresImei(true);
    setBarcode('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setShortName(p.shortName);
    setCategory(p.category);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setImage(p.image);
    setIsFavorite(p.isFavorite || false);
    setRequiresImei(p.requiresImei || false);
    setBarcode(p.barcode || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) {
      alert('Ingresa al menos nombre y precio válido.');
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name,
              shortName: shortName || name.slice(0, 16),
              category,
              price: Number(price),
              cost: Number(cost),
              stock: Number(stock),
              image,
              isFavorite,
              requiresImei,
              barcode,
            }
          : p
      );
      onUpdateProducts(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        shortName: shortName || name.slice(0, 16),
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        image,
        isFavorite,
        requiresImei,
        barcode: barcode || `750${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        availableImeis: requiresImei ? [`35${Math.floor(1000000000000 + Math.random() * 9000000000000)}`] : [],
        order: products.length + 1,
      };
      onUpdateProducts([...products, newProd]);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Eliminar este producto del catálogo?')) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleToggleFavorite = (product: Product) => {
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    onUpdateProducts(updated);
  };

  const handleProcessBatchImeis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchProductId) {
      alert('Selecciona un equipo celular.');
      return;
    }
    const lines = batchImeisText
      .split('\n')
      .map((l) => l.trim().replace(/[^0-9]/g, ''))
      .filter((l) => l.length >= 14);

    if (lines.length === 0) {
      alert('Pega al menos un IMEI numérico de 15 dígitos.');
      return;
    }

    const updated = products.map((p) => {
      if (p.id === batchProductId) {
        const existing = p.availableImeis || [];
        // Add new unique IMEIs
        const merged = Array.from(new Set([...existing, ...lines]));
        return {
          ...p,
          availableImeis: merged,
          stock: p.stock + lines.length,
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setIsBatchImeiOpen(false);
    setBatchImeisText('');
    alert(`¡Se agregaron ${lines.length} IMEIs con éxito y se actualizó el stock!`);
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
              <Package className="w-4 h-4" />
              <span>Gestión de Inventario &amp; Catálogo Visual</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Almacén de Equipos y Accesorios</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura fotografías, asigna favoritos a la primera fila del POS y registra lotes de IMEIs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBatchImeiOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Lote de IMEIs</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({products.length})
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border whitespace-nowrap ${
                  activeTab === c.id
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Products Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Foto / Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio Venta</th>
                  <th className="py-3 px-4">Costo / Margen</th>
                  <th className="py-3 px-4">Stock Disp.</th>
                  <th className="py-3 px-4 text-center">Favorito POS</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const margin = p.price - p.cost;
                  const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[11px] text-slate-400">
                              Etiqueta: {p.shortName}
                            </span>
                            {p.requiresImei && (
                              <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200 inline-block mt-0.5">
                                {p.availableImeis?.length || 0} IMEIs en almacén
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold capitalize text-slate-600">
                        {p.category}
                      </td>

                      <td className="py-3 px-4 font-black text-slate-900 text-sm">
                        ${p.price.toLocaleString('es-MX')}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-500">${p.cost.toLocaleString('es-MX')}</span>
                        <span className="text-[10px] font-bold text-emerald-600 ml-1.5 bg-emerald-50 px-1 py-0.5 rounded">
                          +{marginPct}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            p.stock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.stock} pzas
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(p)}
                          title="Alternar como botón favorito en primera fila del POS"
                          className={`p-1.5 rounded-xl border transition ${
                            p.isFavorite
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-white text-slate-300 hover:text-amber-500 border-slate-200'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${p.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-cyan-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                {editingProduct ? 'Editar Producto / Accesorio' : 'Nuevo Producto para el Catálogo'}
              </h3>

              <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. iPhone 15 128GB Azul"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Corto (Botón POS):</label>
                    <input
                      type="text"
                      placeholder="Ej. iPhone 15"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Categoría:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold capitalize bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Precio Venta ($):</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Costo ($):</label>
                    <input
                      type="number"
                      min={0}
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Stock Inicial:</label>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL Fotografía:</label>
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  {image && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                      <img src={image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                      <span className="text-[11px] text-slate-500">Vista previa del botón táctil POS</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="rounded text-cyan-600 w-4 h-4"
                    />
                    <span>Fijar en Primera Fila (Favorito TOP)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={requiresImei}
                      onChange={(e) => setRequiresImei(e.target.checked)}
                      className="rounded text-cyan-600 w-4 h-4"
                    />
                    <span>Requiere IMEI (Celular)</span>
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batch IMEI Intake Modal */}
        {isBatchImeiOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <span>Alta de Lotes de IMEIs Recibidos</span>
              </h3>

              <form onSubmit={handleProcessBatchImeis} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Selecciona el Modelo de Celular:
                  </label>
                  <select
                    required
                    value={batchProductId}
                    onChange={(e) => setBatchProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    <option value="">-- Elige un smartphone --</option>
                    {products
                      .filter((p) => p.category === 'celulares')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock actual: {p.stock})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Pega los IMEIs (uno por línea o escaneados con pistola):
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="352098108492025&#10;352098108492026&#10;352098108492027"
                    value={batchImeisText}
                    onChange={(e) => setBatchImeisText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cada IMEI válido de 15 dígitos aumentará automáticamente el stock del equipo.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchImeiOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25"
                  >
                    Registrar Lote de IMEIs
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
