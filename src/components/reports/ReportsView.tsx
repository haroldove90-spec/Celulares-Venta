import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, FileText, Search, CreditCard, PhoneCall } from 'lucide-react';
import { SaleTransaction, PayJoyApplication } from '../../types/pos';

interface Props {
  sales: SaleTransaction[];
  payjoyApps: PayJoyApplication[];
}

export const ReportsView: React.FC<Props> = ({ sales, payjoyApps }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPayJoyCommissions = payjoyApps.reduce((sum, a) => sum + a.commissionStore, 0);

  const filteredSales = sales.filter(
    (s) =>
      searchTerm === '' ||
      s.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Reportes &amp; Auditoría Comercial</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Historial de Ventas y Comisiones</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditoría cronológica de tickets emitidos, recargas y financiamientos.
            </p>
          </div>
        </div>

        {/* Big Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Ingresos Totales en Caja</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ${totalRevenue.toLocaleString('es-MX')} MXN
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">{sales.length} transacciones registradas</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Comisiones Ganadas PayJoy</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              +${totalPayJoyCommissions.toLocaleString('es-MX')} MXN
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Incentivo directo por colocación</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Ticket Promedio</span>
            <span className="text-2xl font-black text-cyan-800 mt-1 block">
              ${sales.length > 0 ? Math.round(totalRevenue / sales.length).toLocaleString('es-MX') : 0} MXN
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Por cliente atendido</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
            <h3 className="text-sm font-black text-slate-900">Bitácora de Tickets Emitidos</h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar por folio o cajero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Folio / Hora</th>
                  <th className="py-2.5 px-3">Atendido Por</th>
                  <th className="py-2.5 px-3">Artículos / Concepto</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 text-right">Total Cobrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold font-mono text-slate-900 block">{s.folio}</span>
                      <span className="text-[11px] text-slate-400">{s.timestamp}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{s.cashierName}</td>
                    <td className="py-2.5 px-3">
                      {s.airtimeDetails ? (
                        <span className="inline-flex items-center gap-1 text-cyan-800 font-semibold bg-cyan-50 px-2 py-0.5 rounded">
                          <PhoneCall className="w-3 h-3 text-cyan-600" />
                          Recarga {s.airtimeDetails.carrier} ({s.airtimeDetails.phoneNumber})
                        </span>
                      ) : s.payjoyContractId ? (
                        <span className="inline-flex items-center gap-1 text-purple-800 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                          <CreditCard className="w-3 h-3 text-purple-600" />
                          Enganche PayJoy {s.payjoyContractId}
                        </span>
                      ) : (
                        <span>
                          {s.items.map((i) => `${i.quantity}x ${i.product.shortName || i.product.name}`).join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-bold text-[11px] text-slate-500">
                      {s.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      ${s.total.toLocaleString('es-MX')}
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
