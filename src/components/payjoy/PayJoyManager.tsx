import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PackageCheck, 
  FileText, 
  DollarSign, 
  Smartphone,
  Search,
  Filter
} from 'lucide-react';
import { PayJoyApplication, PayJoyStatus } from '../../types/pos';

interface Props {
  applications: PayJoyApplication[];
  onUpdateStatus: (id: string, status: PayJoyStatus) => void;
}

export const PayJoyManager: React.FC<Props> = ({ applications, onUpdateStatus }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | PayJoyStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customerIne.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.deviceImei.includes(searchTerm) ||
      app.folio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCommissions = applications.reduce((sum, a) => sum + a.commissionStore, 0);
  const totalFinanced = applications.reduce((sum, a) => sum + (a.devicePrice - a.downPayment), 0);

  const getStatusBadge = (status: PayJoyStatus) => {
    switch (status) {
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <PackageCheck className="w-3.5 h-3.5" /> Entregado / Activo
          </span>
        );
      case 'aprobado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
          </span>
        );
      case 'pendiente_firma':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pendiente de Firma
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>Supervisión de Financiamiento PayJoy</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Contratos y Comisiones de Crédito
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisa el ciclo de vida de los contratos de financiamiento celular y comisiones de tienda.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Comisiones Ganadas</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              +${totalCommissions.toLocaleString('es-MX')} MXN
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              En {applications.length} solicitudes procesadas
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Monto Total Financiado</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              ${totalFinanced.toLocaleString('es-MX')} MXN
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Respaldado por plataforma PayJoy
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Equipos Entregados</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {applications.filter((a) => a.status === 'entregado').length} equipos
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Con seguro de bloqueo activo
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({applications.length})
            </button>
            <button
              onClick={() => setStatusFilter('entregado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'entregado'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Entregados
            </button>
            <button
              onClick={() => setStatusFilter('aprobado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'aprobado'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setStatusFilter('pendiente_firma')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'pendiente_firma'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Pendientes
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar cliente, INE o IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Folio / Fecha</th>
                  <th className="py-3 px-4">Cliente / INE</th>
                  <th className="py-3 px-4">Smartphone / IMEI</th>
                  <th className="py-3 px-4">Enganche / Semanal</th>
                  <th className="py-3 px-4">Comisión Tienda</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{app.folio}</span>
                      <span className="text-[11px] text-slate-400">{app.date}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{app.customerName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{app.customerIne}</span>
                      <span className="text-[10px] text-slate-400 block">{app.customerPhone}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{app.deviceModel}</span>
                      <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 inline-block mt-0.5">
                        IMEI: {app.deviceImei}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-bold">
                        Enganche: ${app.downPayment.toLocaleString('es-MX')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ${app.weeklyPayment}/sem ({app.termWeeks} sem)
                      </div>
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-600 text-sm">
                      +${app.commissionStore.toLocaleString('es-MX')}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>

                    <td className="py-3 px-4 text-right">
                      {app.status === 'aprobado' ? (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'entregado')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                        >
                          Entregar Equipo
                        </button>
                      ) : app.status === 'pendiente_firma' ? (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'aprobado')}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                        >
                          Aprobar Firma
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Completado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
