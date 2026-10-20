import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Receipt, 
  Zap, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CartItem, PaymentMethod } from '../../types/pos';

interface Props {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (method: PaymentMethod, cashReceived: number, change: number) => void;
  onOpenPayJoy: () => void;
  onOpenAirtime: () => void;
}

export const TicketAndKeypad: React.FC<Props> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onOpenPayJoy,
  onOpenAirtime,
}) => {
  const [cashInput, setCashInput] = useState<string>('');

  // Calculate Subtotal & Total
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const total = subtotal; // can expand with line discounts

  // Number typed or entered
  const receivedAmount = parseFloat(cashInput) || 0;
  const changeDue = Math.max(0, receivedAmount - total);
  const isEnoughCash = receivedAmount >= total && total > 0;

  // Calculadora keypad handlers
  const handleKeyClick = (key: string) => {
    if (key === 'C') {
      setCashInput('');
    } else if (key === '.') {
      if (!cashInput.includes('.')) {
        setCashInput(cashInput === '' ? '0.' : cashInput + '.');
      }
    } else {
      // Limit to 6 digits
      if (cashInput.length < 7) {
        setCashInput(cashInput === '0' ? key : cashInput + key);
      }
    }
  };

  const handleQuickBill = (amount: number) => {
    setCashInput(amount.toString());
  };

  const handleExactCash = () => {
    setCashInput(total.toString());
  };

  const handleCashPayment = () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al ticket.');
      return;
    }
    const finalReceived = receivedAmount > 0 ? receivedAmount : total;
    if (finalReceived < total) {
      alert(`El efectivo recibido ($${finalReceived}) es menor al total ($${total}).`);
      return;
    }
    onCheckout('efectivo', finalReceived, Math.max(0, finalReceived - total));
    setCashInput('');
  };

  const handleCardPayment = () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al ticket.');
      return;
    }
    onCheckout('tarjeta', total, 0);
    setCashInput('');
  };

  return (
    <div className="w-full lg:w-96 xl:w-[410px] flex flex-col h-full bg-white border-l border-slate-200 shadow-md z-20 select-none">
      {/* Ticket Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 leading-tight">Ticket de Venta</h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {cart.reduce((c, i) => c + i.quantity, 0)} artículos
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            title="Limpiar Ticket"
            className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Ticket Itemized List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[140px] max-h-[30vh] lg:max-h-none border-b border-slate-100">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {item.product.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-cyan-700">
                    ${item.unitPrice.toLocaleString('es-MX')}
                  </span>
                  {item.selectedImei && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      IMEI: ...{item.selectedImei.slice(-4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls: - 1 + */}
              <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-slate-800">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete item button */}
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Receipt className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
            <p className="text-xs font-bold text-slate-600">Ticket vacío</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Toca cualquier producto o accesorio para agregar.
            </p>
          </div>
        )}
      </div>

      {/* Total Banner */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex items-baseline justify-between shadow-inner">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL A COBRAR
          </span>
          <span className="text-2xl font-black tracking-tight">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <span className="text-xs font-bold text-cyan-400">MXN</span>
      </div>

      {/* Cash Received & Change Math Bar */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Efectivo:</span>
          <span className="font-mono font-black text-slate-900 text-sm">
            ${cashInput || '0.00'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Cambio:</span>
          <span
            className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
              isEnoughCash
                ? 'bg-emerald-100 text-emerald-800'
                : receivedAmount > 0
                ? 'bg-amber-100 text-amber-800'
                : 'text-slate-600'
            }`}
          >
            ${changeDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Integrated Calculadora & Quick Bills */}
      <div className="p-2.5 bg-slate-100/80 border-b border-slate-200 space-y-2">
        {/* Quick Bills Row: $100 | $200 | $500 | $1000 | Exacto */}
        <div className="grid grid-cols-5 gap-1">
          {[100, 200, 500, 1000].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleQuickBill(b)}
              className="py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs active:scale-95"
            >
              ${b}
            </button>
          ))}
          <button
            type="button"
            onClick={handleExactCash}
            className="py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-[11px] font-extrabold text-cyan-800 shadow-2xs active:scale-95"
          >
            Exacto
          </button>
        </div>

        {/* Numeric Keypad Grid: 3x4 */}
        <div className="grid grid-cols-3 gap-1.5">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '.'].map((key) => {
            const isClear = key === 'C';
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyClick(key)}
                className={`h-10 rounded-xl font-mono font-black text-base shadow-2xs active:scale-95 transition-all duration-100 ${
                  isClear
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main POS Action Buttons */}
      <div className="p-3 bg-white space-y-2">
        {/* [ COBRAR / EFECTIVO ] */}
        <button
          type="button"
          onClick={handleCashPayment}
          disabled={cart.length === 0}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <DollarSign className="w-5 h-5 stroke-[2.5]" />
          <span>COBRAR / EFECTIVO</span>
          {isEnoughCash && (
            <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded-md font-mono">
              Cambio ${changeDue.toFixed(0)}
            </span>
          )}
        </button>

        {/* Secondary Actions Grid: [ INICIAR PAYJOY ] & [ TARJETA ] */}
        <div className="grid grid-cols-2 gap-2">
          {/* [ INICIAR PAYJOY ] */}
          <button
            type="button"
            onClick={onOpenPayJoy}
            className="py-2.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>INICIAR PAYJOY</span>
          </button>

          {/* [ TARJETA / TRANSF ] */}
          <button
            type="button"
            onClick={handleCardPayment}
            disabled={cart.length === 0}
            className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>TARJETA / BANCO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
