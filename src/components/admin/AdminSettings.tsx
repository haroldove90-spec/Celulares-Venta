import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Database, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  PhoneCall, 
  BarChart3, 
  Key, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCcw,
  Download,
  Monitor,
  Tablet
} from 'lucide-react';
import { StoreConfig, SaleTransaction, PayJoyApplication } from '../../types/pos';
import { StorageService } from '../../services/storage';

interface Props {
  config: StoreConfig;
  onUpdateConfig: (newConfig: StoreConfig) => void;
  sales: SaleTransaction[];
  payjoyApps: PayJoyApplication[];
  onWipeSampleData: () => void;
  onRestoreDemoData: () => void;
}

export const AdminSettings: React.FC<Props> = ({
  config,
  onUpdateConfig,
  sales,
  payjoyApps,
  onWipeSampleData,
  onRestoreDemoData,
}) => {
  // Local form state
  const [storeName, setStoreName] = useState(config.storeName);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [rfc, setRfc] = useState(config.rfc);
  const [gridSize, setGridSize] = useState<'compact' | 'comfortable'>(config.gridSize);
  const [supervisorPin, setSupervisorPin] = useState(config.supervisorPin);
  const [payjoyApiKey, setPayjoyApiKey] = useState(config.payjoyApiKey);
  const [payjoyApiSecret, setPayjoyApiSecret] = useState(config.payjoyApiSecret);
  const [payjoySandbox, setPayjoySandbox] = useState(config.payjoySandbox);
  const [airtimeBalance, setAirtimeBalance] = useState(config.airtimeBalance);
  const [airtimeMinAlert, setAirtimeMinAlert] = useState(config.airtimeMinAlert);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showSupabaseExport, setShowSupabaseExport] = useState(false);

  // Calculate Sales by Visual Category (Audit)
  const categorySalesMap: Record<string, { count: number; total: number }> = {};
  sales.forEach((s) => {
    if (s.airtimeDetails) {
      categorySalesMap['Tiempo Aire'] = {
        count: (categorySalesMap['Tiempo Aire']?.count || 0) + 1,
        total: (categorySalesMap['Tiempo Aire']?.total || 0) + s.total,
      };
    } else if (s.payjoyContractId) {
      categorySalesMap['Crédito PayJoy'] = {
        count: (categorySalesMap['Crédito PayJoy']?.count || 0) + 1,
        total: (categorySalesMap['Crédito PayJoy']?.total || 0) + s.total,
      };
    } else {
      s.items.forEach((item) => {
        const cat = item.product.category.toUpperCase();
        categorySalesMap[cat] = {
          count: (categorySalesMap[cat]?.count || 0) + item.quantity,
          total: (categorySalesMap[cat]?.total || 0) + item.unitPrice * item.quantity,
        };
      });
    }
  });

  const sortedCategories = Object.entries(categorySalesMap).sort(
    ([, a], [, b]) => b.count - a.count
  );

  const totalStoreCommissions = payjoyApps.reduce((sum, a) => sum + a.commissionStore, 0);
  const regularSalesRevenue = sales
    .filter((s) => !s.payjoyContractId)
    .reduce((sum, s) => sum + s.total, 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreConfig = {
      ...config,
      storeName,
      address,
      phone,
      rfc,
      gridSize,
      supervisorPin,
      payjoyApiKey,
      payjoyApiSecret,
      payjoySandbox,
      airtimeBalance: Number(airtimeBalance),
      airtimeMinAlert: Number(airtimeMinAlert),
    };
    onUpdateConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmWipe = () => {
    onWipeSampleData();
    setShowWipeModal(false);
  };

  const handleDownloadSupabaseJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(StorageService.exportForSupabase());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `celulares_pos_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Panel de Administración &amp; Parámetros</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Configuración del Sistema</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamaño del grid táctil, credenciales de API PayJoy, bolsa de tiempo aire y gestión de datos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWipeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition shadow-2xs"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Borrar Datos de Muestra</span>
            </button>
          </div>
        </div>

        {/* Data Status Alert if sample data was cleared */}
        {config.sampleDataCleared ? (
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">
                  Modo Producción Limpio Activo
                </span>
                <span className="text-amber-800">
                  Los datos de muestra fueron eliminados. El navegador no volverá a mostrarlos.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRestoreDemoData}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100/50"
            >
              Restaurar Datos de Demostración
            </button>
          </div>
        ) : null}

        {/* Category Audit: Which buttons are tapped most! */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Auditoría de Ventas por Categoría Visual
                </h3>
                <span className="text-xs text-slate-400">
                  Frecuencia de toques y volumen recaudado por sección del POS
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sortedCategories.map(([catName, stats], i) => (
              <div
                key={catName}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-black text-slate-800 block">{catName}</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {stats.count} {stats.count === 1 ? 'unidad vendida' : 'unidades vendidas'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-cyan-800 block">
                    ${stats.total.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">#{i + 1} en toques</span>
                </div>
              </div>
            ))}
          </div>

          {/* PayJoy Commissions Comparison Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-black text-purple-900 block text-sm">
                Comparativa: Comisiones PayJoy vs. Venta Regular
              </span>
              <span className="text-purple-700">
                Ganancias netas por comisión de crédito celular otorgado en sucursal.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 block text-[11px]">Venta Normal</span>
                <span className="font-black text-slate-900 text-sm">
                  ${regularSalesRevenue.toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div>
                <span className="text-emerald-700 block text-[11px] font-bold">Comisiones PayJoy</span>
                <span className="font-black text-emerald-600 text-sm">
                  +${totalStoreCommissions.toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* POS & Visual Grid settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-600" />
              <span>Configuración del POS y Medios Visuales</span>
            </h3>

            {/* Grid Size Selection: 10" Tablet vs 15"+ Monitor */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Densidad y Tamaño del Grid de Productos:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGridSize('comfortable')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    gridSize === 'comfortable'
                      ? 'border-cyan-600 bg-cyan-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Tablet className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Botones Grandes (Optimizado para Tablets 10")
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Tarjetas amplias con fotos grandes para evitar toques accidentales en pantallas táctiles.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGridSize('compact')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    gridSize === 'compact'
                      ? 'border-cyan-600 bg-cyan-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Grid Compacto (Pantallas 15"+ o PCs)
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Más columnas visibles simultáneamente para visualizar gran cantidad de accesorios.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Supervisor PIN */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                PIN de Supervisor para Salida del POS y Autorizaciones:
              </label>
              <input
                type="text"
                maxLength={6}
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-48 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 text-center tracking-widest"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Requerido por cajeros para salir de la pantalla POS o autorizar cancelaciones.
              </span>
            </div>
          </div>

          {/* PayJoy & Airtime API Parameters */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              <span>Parámetros de Integración (PayJoy &amp; Tiempo Aire)</span>
            </h3>

            {/* PayJoy Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  PayJoy Client ID / API Key:
                </label>
                <input
                  type="text"
                  value={payjoyApiKey}
                  onChange={(e) => setPayjoyApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  PayJoy Client Secret:
                </label>
                <input
                  type="password"
                  value={payjoyApiSecret}
                  onChange={(e) => setPayjoyApiSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payjoySandbox}
                  onChange={(e) => setPayjoySandbox(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span>Modo Pruebas / Sandbox PayJoy (Sin impacto en buró real)</span>
              </label>
            </div>

            {/* Airtime Bag Balance & Alert */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Saldo en Bolsa de Tiempo Aire ($ MXN):
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={airtimeBalance}
                  onChange={(e) => setAirtimeBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alerta de Saldo Mínimo ($ MXN):
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={airtimeMinAlert}
                  onChange={(e) => setAirtimeMinAlert(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Store Identification Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Datos Institucionales de la Sucursal (Tickets de Venta)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">RFC / Razón Social:</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dirección Completa:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono de Contacto:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                ¡Configuración guardada exitosamente!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>

        {/* Supabase Integration Readiness Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Conexión y Sincronización Supabase</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSupabaseJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON de Respaldo</span>
            </button>
          </div>
          <p className="text-xs text-slate-500">
            El sistema está desacoplado con una capa de almacenamiento preparada para vincular tablas de Supabase (<code>products</code>, <code>sales</code>, <code>payjoy_loans</code>, <code>shifts</code>). Al borrar los datos de muestra, también se limpia la cola local para no contaminar la base remota.
          </p>
        </div>

        {/* Wipe Sample Data Confirmation Modal */}
        {showWipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-rose-200 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ¿Borrar Todos los Datos de Muestra?
                  </h3>
                  <span className="text-xs text-slate-500">Acción permanente para puesta en marcha</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Esta función eliminará del navegador todos los productos de demostración, ventas simuladas, solicitudes PayJoy y turnos abiertos.
                </p>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 font-semibold text-rose-800">
                  ⚠️ Se activará la regla permanente para que el navegador <strong>nunca vuelva a mostrar datos de muestra</strong> al recargar la página.
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWipe}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25"
                >
                  Sí, Borrar Todo Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
