import React, { useState } from 'react';
import { Smartphone, Check, X, QrCode } from 'lucide-react';
import { Product } from '../../types/pos';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imei: string) => void;
}

export const ImeiSelectorModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedImei, setSelectedImei] = useState<string>(
    product.availableImeis && product.availableImeis.length > 0 ? product.availableImeis[0] : ''
  );
  const [manualImei, setManualImei] = useState<string>('');
  const [useManual, setUseManual] = useState<boolean>(
    !product.availableImeis || product.availableImeis.length === 0
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    const imei = useManual ? manualImei.trim() : selectedImei;
    if (!imei) {
      alert('Por favor selecciona o digita un IMEI de 15 dígitos para el equipo.');
      return;
    }
    onConfirm(imei);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Vincular IMEI al Ticket</h3>
              <p className="text-xs text-slate-500">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Available registered IMEIs in store */}
          {product.availableImeis && product.availableImeis.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                IMEIs Disponibles en Stock ({product.availableImeis.length}):
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {product.availableImeis.map((imei) => {
                  const isChosen = !useManual && selectedImei === imei;
                  return (
                    <button
                      key={imei}
                      type="button"
                      onClick={() => {
                        setSelectedImei(imei);
                        setUseManual(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        isChosen
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="tracking-wider">IMEI: {imei}</span>
                      {isChosen && <Check className="w-4 h-4 text-cyan-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Or Manual / Barcode Scanner input */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Escanear con Lector o Ingreso Manual:
              </label>
              <button
                type="button"
                onClick={() => setUseManual(true)}
                className="text-[11px] text-cyan-600 font-semibold hover:underline"
              >
                Digitar otro IMEI
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={18}
                placeholder="Ej. 352098108492019"
                value={manualImei}
                onChange={(e) => {
                  setManualImei(e.target.value.replace(/[^0-9]/g, ''));
                  setUseManual(true);
                }}
                className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border ${
                  useManual ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-slate-300'
                } bg-white text-slate-800`}
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              El IMEI aparecerá en el ticket para validación de garantía y bloqueo PayJoy.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition"
          >
            Agregar al Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
