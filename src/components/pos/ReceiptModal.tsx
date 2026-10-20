import React from 'react';
import { Printer, CheckCircle2, X, Smartphone, ArrowRight } from 'lucide-react';
import { SaleTransaction, StoreConfig } from '../../types/pos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleTransaction | null;
  config: StoreConfig;
}

export const ReceiptModal: React.FC<Props> = ({ isOpen, onClose, sale, config }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[95vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Venta Registrada Exitosamente</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realistic 80mm Thermal Receipt Preview */}
        <div className="flex-1 overflow-y-auto my-3 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed select-text shadow-inner">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="font-extrabold text-sm tracking-tight">{config.storeName}</div>
            <div className="text-[11px] text-slate-500">{config.address}</div>
            <div className="text-[11px] text-slate-500">Tel: {config.phone} | RFC: {config.rfc}</div>
          </div>

          {/* Folio & Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Folio:</span>
              <span className="font-bold">{sale.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha/Hora:</span>
              <span>{sale.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Atendido por:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Método de Pago:</span>
              <span className="uppercase font-bold">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-[10px] text-slate-400 pb-1 uppercase">
              <span>Cant. / Descripción</span>
              <span>Importe</span>
            </div>

            {/* Standard Items */}
            {sale.items.length > 0 ? (
              <div className="space-y-2">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>${(item.unitPrice * item.quantity).toLocaleString('es-MX')}</span>
                    </div>
                    {item.selectedImei && (
                      <div className="text-[10px] text-cyan-800 font-bold bg-cyan-50 px-1.5 py-0.5 rounded inline-block">
                        IMEI: {item.selectedImei}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Airtime Details if airtime sale */}
            {sale.airtimeDetails && (
              <div className="p-2 rounded bg-cyan-50/70 border border-cyan-100 text-[11px] space-y-1">
                <div className="font-bold text-cyan-900">RECARGA ELECTRÓNICA</div>
                <div className="flex justify-between">
                  <span>Operador:</span>
                  <span className="font-bold">{sale.airtimeDetails.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número:</span>
                  <span className="font-bold">{sale.airtimeDetails.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Autorización:</span>
                  <span className="font-mono">{sale.airtimeDetails.authCode}</span>
                </div>
              </div>
            )}

            {/* PayJoy Details if PayJoy sale */}
            {sale.payjoyContractId && (
              <div className="mt-2 p-2 rounded bg-purple-50/70 border border-purple-100 text-[11px] space-y-1">
                <div className="font-bold text-purple-900">CRÉDITO PAYJOY</div>
                <div className="flex justify-between">
                  <span>Contrato No:</span>
                  <span className="font-bold">{sale.payjoyContractId}</span>
                </div>
                <div className="text-[10px] text-purple-700">
                  Concepto: Cobro de Enganche Inicial. Equipo entregado con seguro anti-bloqueo.
                </div>
              </div>
            )}
          </div>

          {/* Totals & Math */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toLocaleString('es-MX')}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Descuento autorizado:</span>
                <span>-${sale.discount.toLocaleString('es-MX')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
              <span>TOTAL:</span>
              <span>${sale.total.toLocaleString('es-MX')} MXN</span>
            </div>

            {sale.cashReceived !== undefined && sale.cashReceived > 0 && (
              <>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Efectivo Recibido:</span>
                  <span>${sale.cashReceived.toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Cambio Entregado:</span>
                  <span>${(sale.changeGiven || 0).toLocaleString('es-MX')}</span>
                </div>
              </>
            )}
          </div>

          {/* Simulated Barcode */}
          <div className="pt-3 text-center space-y-1">
            <div className="inline-block py-1 px-3 bg-white border border-slate-200 rounded">
              <div className="h-8 flex items-center justify-center gap-0.5">
                {[...Array(28)].map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{ width: `${(i % 3) + 1}px`, margin: '0 1px' }}
                  />
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-slate-500 font-mono">
                *{sale.folio}*
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">
              ¡Gracias por su compra! Conserve este ticket para hacer válida su garantía de 30 días.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/25 transition"
          >
            <span>Nueva Venta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
