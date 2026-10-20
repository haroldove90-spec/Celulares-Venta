import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Shield, 
  Sparkles, 
  Zap, 
  PhoneCall, 
  CreditCard, 
  Headphones, 
  Search, 
  Star,
  Plus
} from 'lucide-react';
import { CATEGORIES } from '../../data/sampleData';
import { Product, ProductCategory } from '../../types/pos';

interface Props {
  products: Product[];
  currentCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onProductClick: (product: Product) => void;
  onOpenAirtime: () => void;
  onOpenPayJoy: () => void;
  gridSize?: 'compact' | 'comfortable';
}

export const TouchGrid: React.FC<Props> = ({
  products,
  currentCategory,
  onSelectCategory,
  onProductClick,
  onOpenAirtime,
  onOpenPayJoy,
  gridSize = 'comfortable',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  // Filter products by category & search term, prioritizing favorites first
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = p.category === currentCategory;
        const matchesSearch =
          searchTerm === '' ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.barcode && p.barcode.includes(searchTerm));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return (a.order || 99) - (b.order || 99);
      });
  }, [products, currentCategory, searchTerm]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === currentCategory) || CATEGORIES[0];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/70 select-none">
      {/* Category Tabs: Nivel 1 */}
      {/* Big touch buttons with representative icons */}
      <div className="bg-white border-b border-slate-200 p-2 overflow-x-auto no-scrollbar shadow-xs">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'tiempo_aire') {
                    onOpenAirtime();
                  } else if (cat.id === 'payjoy') {
                    onOpenPayJoy();
                  } else {
                    onSelectCategory(cat.id);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition-all duration-200 active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/25 ring-2 ring-cyan-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200/80'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-cyan-600'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span>{cat.name}</span>
                {cat.badge && (
                  <span
                    className={`hidden sm:inline px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subheader: Search bar & Current Category Counter */}
      <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Categoría:
          </span>
          <span className="text-sm font-black text-slate-800 truncate">
            {activeCategoryObj.name}
          </span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        {/* Quick Search & Barcode scan box */}
        <div className="relative w-44 sm:w-64">
          <input
            type="text"
            placeholder="Buscar o escanear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Products Visual Grid: Nivel 2 */}
      {/* Tapping button adds 1 unit to the ticket */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <div
            className={`grid gap-3 md:gap-4 ${
              gridSize === 'compact'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= 5;
              const isOut = product.stock <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  disabled={isOut}
                  className={`group relative flex flex-col justify-between p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer text-left overflow-hidden ${
                    isOut ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-cyan-400'
                  }`}
                >
                  {/* Favorite badge & Stock badge */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                    {product.isFavorite ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        TOP
                      </span>
                    ) : <span />}

                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                        isOut
                          ? 'bg-rose-500 text-white'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-900/75 text-white backdrop-blur-xs'
                      }`}
                    >
                      {isOut ? 'Agotado' : `${product.stock} disp`}
                    </span>
                  </div>

                  {/* Photo with clean container */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Add to ticket quick overlay button */}
                    <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Product Info: Short name & Big Price */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-cyan-700 transition">
                      {product.shortName || product.name}
                    </span>

                    {product.requiresImei && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                        Requiere IMEI
                      </span>
                    )}

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                        ${product.price.toLocaleString('es-MX')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">MXN</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No hay productos en esta categoría</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchTerm
                ? `No encontramos coincidencias para "${searchTerm}".`
                : 'Puedes dar de alta nuevos productos desde el módulo de Inventario.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
