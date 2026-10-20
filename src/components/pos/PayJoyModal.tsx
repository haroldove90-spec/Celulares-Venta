import React, { useState } from 'react';
import { CreditCard, CheckCircle2, X, Smartphone, AlertCircle, FileText, Zap } from 'lucide-react';
import { Product, PayJoyApplication } from '../../types/pos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onConfirmCredit: (app: PayJoyApplication) => void;
  cashierName: string;
}

export const PayJoyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  onConfirmCredit,
  cashierName,
}) => {
  const phoneProducts = products.filter((p) => p.category === 'celulares');

  const [customerName, setCustomerName] = useState('');
  const [customerIne, setCustomerIne] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    phoneProducts.length > 0 ? phoneProducts[0] : null
  );
  const [selectedImei, setSelectedImei] = useState<string>(
    phoneProducts.length > 0 && phoneProducts[0]?.availableImeis?.[0] ? phoneProducts[0].availableImeis[0] : ''
  );
  const [termWeeks, setTermWeeks] = useState<number>(26);
  const [downPayment, setDownPayment] = useState<number>(500);
  const [isPreQualifying, setIsPreQualifying] = useState(false);
  const [preQualified, setPreQualified] = useState(false);

  if (!isOpen) return null;

  const currentPrice = selectedProduct ? selectedProduct.price : 4000;
  // PayJoy approximate weekly rate: (Price - DownPayment) * 1.35 / termWeeks
  const calculatedWeekly = Math.max(
    50,
    Math.round(((currentPrice - downPayment) * 1.32) / termWeeks)
  );
  // Store commission usually around 10-15% of financed amount
  const storeCommission = Math.round((currentPrice - downPayment) * 0.12);

  const handlePreQualify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerIne || !customerPhone) {
      alert('Por favor completa todos los datos del cliente (Nombre, INE y WhatsApp).');
      return;
    }
    if (customerPhone.replace(/[^0-9]/g, '').length !== 10) {
      alert('El número de WhatsApp del cliente debe tener 10 dígitos.');
      return;
    }
    setIsPreQualifying(true);
    setTimeout(() => {
      setIsPreQualifying(false);
      setPreQualified(true);
    }, 900);
  };

  const handleCompletePayJoySale = () => {
    if (!selectedProduct) {
      alert('Selecciona un equipo celular para el crédito.');
      return;
    }
    if (!selectedImei) {
      alert('Debes asignar un IMEI de 15 dígitos al teléfono.');
      return;
    }

    const folio = `PJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newApplication: PayJoyApplication = {
      id: `pj-app-${Date.now()}`,
      folio,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName,
      customerIne,
      customerPhone,
      deviceModel: selectedProduct.name,
      deviceImei: selectedImei,
      devicePrice: selectedProduct.price,
      downPayment,
      weeklyPayment: calculatedWeekly,
      termWeeks,
      commissionStore: storeCommission,
      status: 'aprobado',
      cashierName,
      notes: `Venta a crédito procesada en POS. Enganche cobrado: $${downPayment}.`,
    };

    onConfirmCredit(newApplication);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200">
        {/* Header with PayJoy Brand Color */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase tracking-wider">
                  PayJoy Oficial
                </span>
                <span className="text-xs text-slate-400">Trámite Rápido Sin Tarjetas</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Crédito Celular Inmediato</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!preQualified ? (
          /* Step 1: Pre-qualification Form */
          <form onSubmit={handlePreQualify} className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-900 flex items-start gap-2.5">
              <CreditCard className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Requisitos mínimos:</strong> INE vigente y número de WhatsApp activo del cliente.
                No se requiere historial crediticio bancario previo.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre Completo del Cliente (como aparece en su INE):
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Roberto Sánchez Gómez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-sm text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clave de Elector / INE o CURP:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SNZG890214HDFRLL01"
                  value={customerIne}
                  onChange={(e) => setCustomerIne(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Número de WhatsApp (10 dígitos):
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Ej. 5589201928"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPreQualifying}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition"
              >
                {isPreQualifying ? (
                  <span>Consultando API PayJoy...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Precalificar Cliente Ahora</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Evaluation, Device & Down Payment Details */
          <div className="mt-5 space-y-4">
            {/* Approved Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wide block">
                    ¡Cliente Precalificado con Éxito!
                  </span>
                  <span className="text-xs text-emerald-700">
                    Línea de crédito autorizada hasta $15,000 MXN para {customerName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreQualified(false)}
                className="text-[11px] text-emerald-800 font-bold underline"
              >
                Cambiar datos
              </button>
            </div>

            {/* Device Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Selecciona el Smartphone a Financiar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {phoneProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        if (p.availableImeis && p.availableImeis.length > 0) {
                          setSelectedImei(p.availableImeis[0]);
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {p.name}
                        </span>
                        <span className="text-xs font-black text-purple-700">
                          ${p.price.toLocaleString('es-MX')} MXN
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Stock: {p.stock} pzas
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* IMEI Binding */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                IMEI del Equipo (15 dígitos para bloqueo PayJoy):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={18}
                  placeholder="Ej. 864902047819201"
                  value={selectedImei}
                  onChange={(e) => setSelectedImei(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-800"
                />
                {selectedProduct?.availableImeis && selectedProduct.availableImeis.length > 0 && (
                  <select
                    onChange={(e) => setSelectedImei(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  >
                    <option value="">IMEIs en Almacén</option>
                    {selectedProduct.availableImeis.map((im) => (
                      <option key={im} value={im}>
                        {im}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Terms & Down payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Enganche Inicial (Cobro en Caja):
                </label>
                <div className="flex gap-1.5">
                  {[300, 500, 800, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDownPayment(amt)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                        downPayment === amt
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Plazo del Crédito:
                </label>
                <div className="flex gap-1.5">
                  {[26, 39, 52].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setTermWeeks(w)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                        termWeeks === w
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {w} sem
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loan Calculation Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-purple-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Enganche a Cobrar</span>
                  <span className="text-lg font-black text-purple-700">
                    ${downPayment.toLocaleString('es-MX')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Pago Semanal</span>
                  <span className="text-lg font-black text-slate-900">
                    ${calculatedWeekly.toLocaleString('es-MX')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{termWeeks} semanas</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Comisión Tienda</span>
                  <span className="text-lg font-black text-emerald-600">
                    +${storeCommission.toLocaleString('es-MX')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompletePayJoySale}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cobrar Enganche (${downPayment}) &amp; Entregar Equipo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
