import React from 'react';
import { ShoppingBag, ShieldCheck, Crown, Wrench, Smartphone } from 'lucide-react';
import { UserRole } from '../types/pos';
import { PWAInstallButton } from './common/PWAInstallButton';

interface Props {
  onSelectRole: (role: UserRole) => void;
}

interface RoleCardItem {
  id: UserRole;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  hoverBorder: string;
}

export const RoleSelector: React.FC<Props> = ({ onSelectRole }) => {
  const roles: RoleCardItem[] = [
    {
      id: 'cajero',
      title: 'Cajero / Vendedor',
      icon: (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-cyan-600" />
        </div>
      ),
      accentColor: 'from-cyan-500/20 to-blue-500/5',
      hoverBorder: 'hover:border-cyan-500 hover:shadow-cyan-500/20',
    },
    {
      id: 'supervisor',
      title: 'Encargado / Supervisor',
      icon: (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
        </div>
      ),
      accentColor: 'from-emerald-500/20 to-teal-500/5',
      hoverBorder: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
    },
    {
      id: 'admin',
      title: 'Administrador / Dueño',
      icon: (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Crown className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
        </div>
      ),
      accentColor: 'from-indigo-500/20 to-violet-500/5',
      hoverBorder: 'hover:border-indigo-500 hover:shadow-indigo-500/20',
    },
    {
      id: 'tecnico',
      title: 'Soporte / Taller',
      icon: (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
          <Wrench className="w-8 h-8 md:w-10 md:h-10 text-amber-600" />
        </div>
      ),
      accentColor: 'from-amber-500/20 to-orange-500/5',
      hoverBorder: 'hover:border-amber-500 hover:shadow-amber-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Top quick install button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8">
        <PWAInstallButton />
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Subtle Brand Logo at top */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
            <Smartphone className="w-7 h-7" />
          </div>
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            Celulares <span className="text-cyan-600">Venta</span>
          </span>
        </div>

        {/* Clean Role Cards Grid: 2 Columns Mobile / 4 Columns Desktop */}
        {/* Strict compliance: no header, no descriptions, just role name and logo */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 text-center cursor-pointer overflow-hidden ${role.hoverBorder}`}
            >
              {/* Subtle hover gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${role.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Logo / Icon */}
              <div className="relative z-10 mb-4 md:mb-6">
                {role.icon}
              </div>

              {/* Role Name only (no descriptions) */}
              <span className="relative z-10 text-base md:text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                {role.title}
              </span>

              {/* Subtle tap indicator */}
              <span className="relative z-10 mt-3 text-[11px] font-semibold text-slate-400 group-hover:text-cyan-600 uppercase tracking-wider transition-colors">
                Ingresar →
              </span>
            </button>
          ))}
        </div>

        {/* System Version Footnote */}
        <div className="mt-10 md:mt-14 flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span>Celulares Venta POS v2.6 PWA</span>
          <span>•</span>
          <span>Modo Offline Disponible</span>
        </div>
      </div>
    </div>
  );
};
