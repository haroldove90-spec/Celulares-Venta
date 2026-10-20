import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  expectedPin: string;
}

export const PinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autorización de Supervisor Requerida',
  expectedPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin === expectedPin) {
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 150);
      } else if (nextPin.length >= expectedPin.length) {
        setError(true);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Ingresa el PIN de supervisor para salir del POS o autorizar:
        </p>

        {/* PIN Dots Display */}
        <div className="my-4 flex justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? error
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-cyan-600 border-cyan-600 scale-110'
                  : 'bg-slate-100 border-slate-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold animate-shake">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PIN Incorrecto (Predeterminado: {expectedPin})</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg active:scale-95 transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-600 font-semibold text-xs active:scale-95 transition"
          >
            Limpiar
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs active:scale-95 transition"
          >
            ←
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-400">
            PIN Supervisor inicial: <code className="font-mono font-bold text-slate-600">1234</code>
          </span>
        </div>
      </div>
    </div>
  );
};
