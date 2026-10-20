import React from 'react';
import { Smartphone, LogOut, Wifi, WifiOff, PhoneCall, ShieldCheck, Crown, ShoppingBag, Wrench, Menu } from 'lucide-react';
import { UserRole, StoreConfig } from '../types/pos';
import { PWAInstallButton } from './common/PWAInstallButton';

interface Props {
  activeRole: UserRole;
  config: StoreConfig;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  isOnline: boolean;
}

export const Header: React.FC<Props> = ({
  activeRole,
  config,
  onLogout,
  onToggleSidebar,
  isOnline,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'cajero':
        return {
          label: 'Cajero / Vendedor',
          icon: <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />,
          classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'supervisor':
        return {
          label: 'Encargado / Supervisor',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'admin':
        return {
          label: 'Administrador / Dueño',
          icon: <Crown className="w-3.5 h-3.5 text-indigo-600" />,
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'tecnico':
        return {
          label: 'Soporte / Taller',
          icon: <Wrench className="w-3.5 h-3.5 text-amber-600" />,
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  const roleInfo = getRoleBadge(activeRole);
  const isAirtimeLow = config.airtimeBalance < config.airtimeMinAlert;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 md:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xs select-none">
      {/* Left: Hamburger for desktop/tablet & Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Alternar Menú Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLogout}>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/25">
            <Smartphone className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <span className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
              Celulares <span className="text-cyan-600">Venta</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Punto de Venta &amp; Gestión
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Active Role Badge & Airtime Indicator */}
      <div className="flex items-center gap-2">
        {/* Active Role Identification */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${roleInfo.classes}`}
        >
          {roleInfo.icon}
          <span className="hidden sm:inline">Rol:</span>
          <span>{roleInfo.label}</span>
        </div>

        {/* Airtime Bag Pill (only if relevant) */}
        <div
          title={`Saldo bolsa de tiempo aire: $${config.airtimeBalance.toLocaleString('es-MX')} MXN`}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isAirtimeLow
              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <PhoneCall className={`w-3 h-3 ${isAirtimeLow ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>TA: ${config.airtimeBalance.toLocaleString('es-MX')}</span>
          {isAirtimeLow && <span className="text-[10px] text-amber-600 font-bold">¡Recargar!</span>}
        </div>

        {/* Connectivity status icon */}
        <div className="hidden sm:flex items-center">
          {isOnline ? (
            <span title="Conectado a Internet" className="text-emerald-500 p-1">
              <Wifi className="w-4 h-4" />
            </span>
          ) : (
            <span
              title="Modo Fuera de Línea (Local)"
              className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 border border-amber-200"
            >
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick Install App Button & Logout Button */}
      <div className="flex items-center gap-2">
        <PWAInstallButton />

        {/* Logout / Switch Role */}
        <button
          onClick={onLogout}
          title="Cambiar de Rol / Cerrar Sesión"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
