import React from 'react';
import { 
  Calculator, 
  Package, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Trash2,
  PhoneCall,
  Wrench,
  Smartphone
} from 'lucide-react';
import { UserRole, StoreConfig } from '../types/pos';

export type AppModule = 'pos' | 'inventory' | 'payjoy' | 'shifts' | 'reports' | 'repairs' | 'settings';

interface Props {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  activeRole: UserRole;
  config: StoreConfig;
  isOpen: boolean;
  onLogout: () => void;
  onClearSampleData: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentModule,
  onSelectModule,
  activeRole,
  config,
  isOpen,
  onLogout,
  onClearSampleData,
}) => {
  const menuItems = [
    {
      id: 'pos' as AppModule,
      label: 'Punto de Venta (POS)',
      icon: <Calculator className="w-5 h-5 text-cyan-600" />,
      allowedRoles: ['cajero', 'supervisor', 'admin', 'tecnico'],
      badge: 'Táctil',
    },
    {
      id: 'inventory' as AppModule,
      label: 'Catálogo & Almacén',
      icon: <Package className="w-5 h-5 text-emerald-600" />,
      allowedRoles: ['supervisor', 'admin', 'tecnico'],
      badge: undefined,
    },
    {
      id: 'payjoy' as AppModule,
      label: 'Crédito PayJoy',
      icon: <CreditCard className="w-5 h-5 text-purple-600" />,
      allowedRoles: ['cajero', 'supervisor', 'admin'],
      badge: 'Financiamiento',
    },
    {
      id: 'shifts' as AppModule,
      label: 'Cortes & Turnos',
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      allowedRoles: ['cajero', 'supervisor', 'admin'],
      badge: undefined,
    },
    {
      id: 'repairs' as AppModule,
      label: 'Taller & Diagnóstico',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      allowedRoles: ['tecnico', 'supervisor', 'admin'],
      badge: 'Servicio',
    },
    {
      id: 'reports' as AppModule,
      label: 'Reportes & Auditoría',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      allowedRoles: ['supervisor', 'admin'],
      badge: undefined,
    },
    {
      id: 'settings' as AppModule,
      label: 'Configuración & Datos',
      icon: <Settings className="w-5 h-5 text-slate-600" />,
      allowedRoles: ['admin', 'supervisor'],
      badge: undefined,
    },
  ];

  const filteredItems = menuItems.filter((item) => item.allowedRoles.includes(activeRole));

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Store Quick Info / Status */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {isOpen ? (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sucursal</span>
            <span className="text-sm font-bold text-slate-800 truncate block max-w-[180px]">
              {config.storeName}
            </span>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
            <Smartphone className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-800 font-semibold border border-cyan-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-100 text-cyan-800">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Airtime Bolsa & System Actions Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* Airtime Quick Card (when expanded) */}
        {isOpen && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium mb-1">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
                Bolsa Tiempo Aire
              </span>
              <span className="font-bold text-slate-800">
                ${config.airtimeBalance.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${
                  config.airtimeBalance < config.airtimeMinAlert ? 'bg-amber-500' : 'bg-cyan-600'
                }`}
                style={{
                  width: `${Math.min(100, (config.airtimeBalance / 10000) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Clear Sample Data Button */}
        {(activeRole === 'admin' || activeRole === 'supervisor') && (
          <button
            onClick={onClearSampleData}
            title="Borrar datos de muestra del sistema"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200/60 transition ${
              !isOpen && 'justify-center'
            }`}
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            {isOpen && <span>Borrar Datos Muestra</span>}
          </button>
        )}

        {/* Switch Role / Exit */}
        <button
          onClick={onLogout}
          title="Cambiar de Rol"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition ${
            !isOpen && 'justify-center'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span>Cambiar de Rol</span>}
        </button>
      </div>
    </aside>
  );
};
