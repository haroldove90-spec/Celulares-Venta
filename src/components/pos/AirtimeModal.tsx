import React, { useState } from 'react';
import { PhoneCall, CheckCircle2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AIRTIME_CARRIERS } from '../../data/sampleData';
import { AirtimeCarrier } from '../../types/pos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  airtimeBalance: number;
  onConfirmRecharge: (carrier: AirtimeCarrier, phoneNumber: string, amount: number) => void;
}

export const AirtimeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  airtimeBalance,
  onConfirmRecharge,
}) => {
  const [selectedCarrier, setSelectedCarrier] = useState<AirtimeCarrier>(AIRTIME_CARRIERS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmNumber, setConfirmNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  if (!isOpen) return null;

  const handlePhoneDigit = (digit: string) => {
    if (phoneNumber.length < 10) {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handlePhoneBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      alert('El número telefónico debe tener exactamente 10 dígitos.');
      return;
    }
    if (phoneNumber !== confirmNumber) {
      alert('La confirmación del número telefónico no coincide. Verifica ambos números.');
      return;
    }
    if (selectedAmount > airtimeBalance) {
      alert(`Saldo insuficiente en la bolsa de tiempo aire ($${airtimeBalance} MXN disponible).`);
      return;
    }
    setStep('confirm');
  };

  const handleFinalRecharge = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmRecharge(selectedCarrier, phoneNumber, selectedAmount);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Venta de Tiempo Aire &amp; Paquetes</h3>
              <p className="text-xs text-slate-500">
                Bolsa disponible: <strong className="text-cyan-700 font-mono">${airtimeBalance.toLocaleString('es-MX')} MXN</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
            {/* Carrier Logos Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                1. Selecciona el Operador Móvil:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AIRTIME_CARRIERS.map((c) => {
                  const isSelected = selectedCarrier.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCarrier(c);
                        if (!c.amounts.includes(selectedAmount)) {
                          setSelectedAmount(c.amounts[0] || 50);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-150 text-center ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/70 shadow-sm scale-102'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs mb-1"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  2. Número Celular (10 dígitos):
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Ej. 5512345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-800 tracking-wider text-center focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirmar Número:
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Repetir número"
                  value={confirmNumber}
                  onChange={(e) => setConfirmNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-800 tracking-wider text-center focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            {/* Quick Touch Keypad for phone number if tablet touch */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 text-center">
                Teclado Numérico Rápido Táctil:
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handlePhoneDigit(d)}
                    className="py-1.5 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-700 text-sm hover:bg-slate-100 active:scale-95"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePhoneBackspace}
                  className="col-span-2 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold active:scale-95"
                >
                  Borrar ←
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                3. Selecciona el Monto de Recarga / Paquete:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {selectedCarrier.amounts.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-2 rounded-xl font-bold text-sm transition-all border ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/25 scale-102'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      ${amt} MXN
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition"
              >
                Verificar &amp; Continuar →
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-center space-y-2">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider block">
                Confirmación de Transacción
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedCarrier.name}
              </div>
              <div className="text-xl font-mono font-extrabold text-cyan-700 tracking-wider">
                {phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}
              </div>
              <div className="text-3xl font-black text-slate-900">
                ${selectedAmount}.00 <span className="text-sm font-normal text-slate-500">MXN</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                Las recargas electrónicas son inmediatas y no tienen devolución una vez procesadas.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                ← Modificar
              </button>
              <button
                type="button"
                onClick={handleFinalRecharge}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Procesando API...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Recarga</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
