import React, { useState } from 'react';
import { 
  DollarSign, 
  Printer, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ShiftRegister, SaleTransaction, UserRole } from '../../types/pos';

interface Props {
  currentShift: ShiftRegister | null;
  sales: SaleTransaction[];
  activeRole: UserRole;
  onOpenShift: (initialFund: number, cashierName: string) => void;
  onCloseShift: (countedCash: number, difference: number, notes: string) => void;
  shiftsHistory: ShiftRegister[];
}

export const ShiftManager: React.FC<Props> = ({
  currentShift,
  sales,
  activeRole,
  onOpenShift,
  onCloseShift,
  shiftsHistory,
}) => {
  const [initialFundInput, setInitialFundInput] = useState<number>(1000);
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Compute live current sales breakdown for active shift
  const cashSalesTotal = currentShift ? currentShift.cashSales : 0;
  const payjoyDownPaymentsTotal = currentShift ? currentShift.payjoyDownPayments : 0;
  const airtimeSalesTotal = currentShift ? currentShift.airtimeSales : 0;
  const initialFund = currentShift ? currentShift.initialFund : 0;

  const expectedCashTotal = initialFund + cashSalesTotal + payjoyDownPaymentsTotal + airtimeSalesTotal;
  const countedCash = parseFloat(countedCashInput) || 0;
  const difference = countedCash - expectedCashTotal;

  const handleStartShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialFundInput < 0) {
      alert('El fondo inicial no puede ser negativo.');
      return;
    }
    const cashierLabel =
      activeRole === 'cajero' ? 'Juan Pérez (Cajero)' : 'Supervisor de Sucursal';
    onOpenShift(initialFundInput, cashierLabel);
  };

  const handleConfirmCloseShift = () => {
    if (countedCashInput === '') {
      alert('Por favor ingresa el monto total de efectivo contado en caja.');
      return;
    }
    onCloseShift(countedCash, difference, notes);
    setIsClosingModalOpen(false);
    setCountedCashInput('');
    setNotes('');
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Control de Caja &amp; Arqueos de Turno</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Cortes de Caja y Turnos</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Apertura con fondo inicial, recepción de efectivo y auditoría de diferencias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentShift ? (
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Turno Abierto: {currentShift.cashierName}
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                <Lock className="w-3.5 h-3.5" /> Caja Cerrada
              </span>
            )}
          </div>
        </div>

        {/* Current Active Shift or Open Shift Form */}
        {currentShift ? (
          <div className="space-y-6">
            {/* Live Financial Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Arqueo en Vivo del Turno Actual</h3>
                  <span className="text-xs text-slate-400">
                    Iniciado el {currentShift.openedAt} por {currentShift.cashierName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Realizar Corte de Caja</span>
                </button>
              </div>

              {/* Grid of Cash Flow */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">Fondo Inicial</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    ${initialFund.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-slate-400">Entregado al cajero</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-800 block">Venta Efectivo</span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">
                    +${cashSalesTotal.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-emerald-600">Accesorios y celulares</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                  <span className="text-xs font-semibold text-purple-800 block">Enganches PayJoy</span>
                  <span className="text-xl font-black text-purple-700 mt-1 block">
                    +${payjoyDownPaymentsTotal.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-purple-600">Cobrado en ventanilla</span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200">
                  <span className="text-xs font-semibold text-cyan-800 block">Tiempo Aire</span>
                  <span className="text-xl font-black text-cyan-700 mt-1 block">
                    +${airtimeSalesTotal.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-cyan-600">Recargas de telefonía</span>
                </div>
              </div>

              {/* Total Expected in Drawer */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL DE EFECTIVO ESPERADO EN CAJÓN FÍSICO
                  </span>
                  <div className="text-3xl font-black text-emerald-400 mt-0.5">
                    ${expectedCashTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                </div>
                <div className="text-xs text-slate-400 sm:text-right">
                  <span>Fondo Inicial ($ {initialFund}) + Ventas en Efectivo</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Shift is Closed - Prompt to Open Shift */
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-inner">
              <Unlock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Apertura de Turno de Caja</h3>
              <p className="text-xs text-slate-500 mt-1">
                Para comenzar a registrar ventas e imprimir tickets, ingresa el fondo de cambio inicial.
              </p>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="space-y-4 text-left pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fondo Inicial para Cambio ($ MXN):
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={50}
                  value={initialFundInput}
                  onChange={(e) => setInitialFundInput(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-xl font-black text-slate-800 text-center focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                {[500, 1000, 1500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialFundInput(amt)}
                    className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 transition active:scale-98"
              >
                Abrir Turno de Caja
              </button>
            </form>
          </div>
        )}

        {/* Close Shift Arqueo Modal */}
        {isClosingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                  <Lock className="w-5 h-5" />
                  <span>Corte y Arqueo de Turno</span>
                </div>
                <button
                  onClick={() => setIsClosingModalOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Total Esperado en Cajón:</span>
                <span className="font-black text-slate-900 text-base">
                  ${expectedCashTotal.toLocaleString('es-MX')} MXN
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Efectivo Físico Contado ($):
                </label>
                <input
                  type="number"
                  placeholder="Digita el dinero total contado"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-lg font-black text-slate-900 text-center"
                />
              </div>

              {/* Difference Status */}
              {countedCashInput !== '' && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between font-bold ${
                    difference === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : difference > 0
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span>
                    {difference === 0
                      ? 'Caja Exacta'
                      : difference > 0
                      ? 'Sobrante (+)'
                      : 'Faltante (-)'}
                  </span>
                  <span className="font-mono text-sm">
                    {difference > 0 ? `+$${difference}` : `$${difference}`} MXN
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Observaciones de Cierre / Firma Supervisor:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Efectivo entregado íntegramente a gerencia."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseShift}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Previous Shifts History */}
        {shiftsHistory.length > 0 && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3">Historial de Turnos Cerrados</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {shiftsHistory.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {s.cashierName} • {s.openedAt}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Cerrado: {s.closedAt} | Fondo: ${s.initialFund}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      ${s.totalCashExpected.toLocaleString('es-MX')}
                    </span>
                    {s.cashDifference !== undefined && (
                      <span
                        className={`text-[10px] font-bold ${
                          s.cashDifference === 0
                            ? 'text-emerald-600'
                            : s.cashDifference > 0
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        Dif: {s.cashDifference >= 0 ? `+$${s.cashDifference}` : `$${s.cashDifference}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
