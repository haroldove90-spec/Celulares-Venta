import React from 'react';
import { Calculator, Package, CreditCard, DollarSign, Settings } from 'lucide-react';
import { AppModule } from './Sidebar';
import { UserRole } from '../types/pos';

interface Props {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  activeRole: UserRole;
}

export const BottomBar: React.FC<Props> = ({ currentModule, onSelectModule, activeRole }) => {
  const navItems = [
    {
      id: 'pos' as AppModule,
      label: 'POS',
      icon: <Calculator className="w-5 h-5" />,
      allowedRoles: ['cajero', 'supervisor', 'admin', 'tecnico'],
    },
    {
      id: 'inventory' as AppModule,
      label: 'Inventario',
      icon: <Package className="w-5 h-5" />,
      allowedRoles: ['supervisor', 'admin', 'tecnico'],
    },
    {
      id: 'payjoy' as AppModule,
      label: 'PayJoy',
      icon: <CreditCard className="w-5 h-5" />,
      allowedRoles: ['cajero', 'supervisor', 'admin'],
    },
    {
      id: 'shifts' as AppModule,
      label: 'Caja',
      icon: <DollarSign className="w-5 h-5" />,
      allowedRoles: ['cajero', 'supervisor', 'admin'],
    },
    {
      id: 'settings' as AppModule,
      label: 'Ajustes',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['admin', 'supervisor'],
    },
  ];

  const visibleItems = navItems.filter((i) => i.allowedRoles.includes(activeRole));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb">
      {visibleItems.map((item) => {
        const isActive = currentModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectModule(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isActive ? 'bg-cyan-50 text-cyan-600' : 'text-slate-500'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[11px] leading-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
