import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  X,
  QrCode,
  DollarSign
} from 'lucide-react';
import { RepairTicket, RepairStatus } from '../../types/pos';

interface Props {
  repairs: RepairTicket[];
  onUpdateRepairs: (repairs: RepairTicket[]) => void;
  technicianName: string;
}

export const RepairManager: React.FC<Props> = ({ repairs, onUpdateRepairs, technicianName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RepairStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<RepairTicket | null>(null);

  // New repair form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [issue, setIssue] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(500);
  const [advancePayment, setAdvancePayment] = useState<number>(200);
  const [notes, setNotes] = useState('');

  // Diagnostic tool
  const [diagnosticImei, setDiagnosticImei] = useState('');
  const [diagnosticResult, setDiagnosticResult] = useState<{
    status: 'limpio' | 'bloqueo_payjoy' | 'reporte_robo' | 'verificando' | null;
    message: string;
  }>({ status: null, message: '' });

  const filteredRepairs = repairs.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deviceImei.includes(searchTerm) ||
      r.folio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deviceModel) {
      alert('Completa los campos obligatorios del cliente y equipo.');
      return;
    }

    const folio = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: RepairTicket = {
      id: `rep-${Date.now()}`,
      folio,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName,
      customerPhone,
      deviceModel,
      deviceImei: deviceImei || 'N/A',
      issue,
      lockStatus: 'limpio',
      estimatedCost,
      advancePayment,
      status: 'recibido',
      technicianName,
      notes,
    };

    onUpdateRepairs([newTicket, ...repairs]);
    setIsAddModalOpen(false);
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setDeviceModel('');
    setDeviceImei('');
    setIssue('');
    setNotes('');
  };

  const handleStatusChange = (id: string, nextStatus: RepairStatus) => {
    const updated = repairs.map((r) => (r.id === id ? { ...r, status: nextStatus } : r));
    onUpdateRepairs(updated);
  };

  const runDiagnostic = () => {
    if (!diagnosticImei || diagnosticImei.length < 14) {
      alert('Ingresa un IMEI de al menos 14-15 dígitos para consultar.');
      return;
    }
    setDiagnosticResult({ status: 'verificando', message: 'Consultando base de datos de operadores...' });
    setTimeout(() => {
      if (diagnosticImei.endsWith('9')) {
        setDiagnosticResult({
          status: 'bloqueo_payjoy',
          message: 'ATENCIÓN: Equipo cuenta con bloqueo activo de PayJoy / Knox Guard. Requiere liquidación de saldo para desinstalación.',
        });
      } else if (diagnosticImei.endsWith('0')) {
        setDiagnosticResult({
          status: 'reporte_robo',
          message: 'ALERTA: IMEI con reporte de extravío/robo registrado ante el IFT.',
        });
      } else {
        setDiagnosticResult({
          status: 'limpio',
          message: 'ESTADO LIMPIO: Sin adeudos, libre para cualquier compañía, sin candado PayJoy activo.',
        });
      }
    }, 700);
  };

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'recibido':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Recibido</span>;
      case 'en_revision':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">En Revisión</span>;
      case 'esperando_refaccion':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Esp. Refacción</span>;
      case 'listo_entrega':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Listo para Entrega</span>;
      case 'entregado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Entregado</span>;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <span>Soporte Técnico, Reparaciones &amp; Diagnóstico</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Taller de Celulares y Servicios</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recepción de equipos averiados, control de refacciones y verificación de bloqueo IMEI / PayJoy.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden de Servicio</span>
          </button>
        </div>

        {/* Quick IMEI Diagnostic Tool */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-600" />
              <h3 className="text-sm font-black text-slate-900">
                Verificador Rápido de Estado IMEI (Bloqueo / PayJoy / IFT)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              Consulta en tiempo real
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={18}
                placeholder="Digita o escanea los 15 dígitos del IMEI a diagnosticar..."
                value={diagnosticImei}
                onChange={(e) => setDiagnosticImei(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800"
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="button"
              onClick={runDiagnostic}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
            >
              Diagnosticar IMEI
            </button>
          </div>

          {diagnosticResult.status && (
            <div
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-start gap-2 ${
                diagnosticResult.status === 'limpio'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : diagnosticResult.status === 'bloqueo_payjoy'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : diagnosticResult.status === 'reporte_robo'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}
            >
              {diagnosticResult.status === 'limpio' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{diagnosticResult.message}</span>
            </div>
          )}
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
              Todos ({repairs.length})
            </button>
            <button
              onClick={() => setStatusFilter('recibido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'recibido'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Recibidos
            </button>
            <button
              onClick={() => setStatusFilter('en_revision')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'en_revision'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              En Revisión
            </button>
            <button
              onClick={() => setStatusFilter('listo_entrega')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === 'listo_entrega'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Listos
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por folio, cliente o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Repair Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Folio / Fecha</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Equipo / IMEI</th>
                  <th className="py-3 px-4">Falla / Servicio</th>
                  <th className="py-3 px-4">Presupuesto / Anticipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRepairs.map((r) => {
                  const balanceDue = r.estimatedCost - r.advancePayment;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-slate-900 block">{r.folio}</span>
                        <span className="text-[11px] text-slate-400">{r.createdAt}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{r.customerName}</span>
                        <span className="text-[11px] text-slate-500">{r.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{r.deviceModel}</span>
                        <span className="text-[11px] font-mono text-slate-500">IMEI: {r.deviceImei}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 block line-clamp-2">{r.issue}</span>
                        {r.notes && <span className="text-[10px] text-slate-400 block mt-0.5">{r.notes}</span>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          Total: ${r.estimatedCost.toLocaleString('es-MX')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Anticipo: ${r.advancePayment} | Resta: ${balanceDue}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(r.status)}
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value as RepairStatus)}
                            className="block text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50 text-slate-700"
                          >
                            <option value="recibido">Recibido</option>
                            <option value="en_revision">En Revisión</option>
                            <option value="esperando_refaccion">Esp. Refacción</option>
                            <option value="listo_entrega">Listo Entrega</option>
                            <option value="entregado">Entregado</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTicketForPrint(r)}
                          title="Imprimir Comprobante de Recepción"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Service Ticket Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Recepción de Equipo para Servicio Técnico</span>
              </h3>

              <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Cliente:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Gómez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Teléfono:</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 5512345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Modelo del Smartphone:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. iPhone 12 / Samsung A54"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">IMEI del Equipo:</label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="15 dígitos"
                      value={deviceImei}
                      onChange={(e) => setDeviceImei(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Descripción de la Falla:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cambio de pantalla rota / No carga"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Presupuesto Estimado ($):</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Anticipo Dejado ($):</label>
                    <input
                      type="number"
                      min={0}
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Observaciones / Contraseña:</label>
                  <input
                    type="text"
                    placeholder="Ej. Patrón de desbloqueo, detalles estéticos"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
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
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20"
                  >
                    Generar Orden de Servicio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Service Order Receipt Modal */}
        {selectedTicketForPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800">Comprobante de Servicio</span>
                <button
                  onClick={() => setSelectedTicketForPrint(null)}
                  className="text-xs text-slate-400 font-bold hover:text-slate-600"
                >
                  Cerrar
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs space-y-2">
                <div className="text-center font-bold text-sm">CELULARES VENTA - TALLER</div>
                <div className="text-center text-[10px] text-slate-500">Orden: {selectedTicketForPrint.folio}</div>
                <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] space-y-1">
                  <div>Cliente: {selectedTicketForPrint.customerName}</div>
                  <div>Tel: {selectedTicketForPrint.customerPhone}</div>
                  <div>Equipo: {selectedTicketForPrint.deviceModel}</div>
                  <div>IMEI: {selectedTicketForPrint.deviceImei}</div>
                  <div>Falla: {selectedTicketForPrint.issue}</div>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold">
                  <span>Presupuesto:</span>
                  <span>${selectedTicketForPrint.estimatedCost}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Anticipo:</span>
                  <span>${selectedTicketForPrint.advancePayment}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-black">
                  <span>Resta al recoger:</span>
                  <span>${selectedTicketForPrint.estimatedCost - selectedTicketForPrint.advancePayment}</span>
                </div>
                <div className="pt-2 text-[9px] text-slate-400 text-center">
                  Garantía de 30 días en refacción y mano de obra.
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
