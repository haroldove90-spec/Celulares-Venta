import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Smartphone, PhoneCall, Zap, Receipt, ShieldAlert } from 'lucide-react';
import { TouchGrid } from './TouchGrid';
import { TicketAndKeypad } from './TicketAndKeypad';
import { PinModal } from './PinModal';
import { ImeiSelectorModal } from './ImeiSelectorModal';
import { AirtimeModal } from './AirtimeModal';
import { PayJoyModal } from './PayJoyModal';
import { ReceiptModal } from './ReceiptModal';
import { 
  Product, 
  ProductCategory, 
  CartItem, 
  PaymentMethod, 
  SaleTransaction, 
  PayJoyApplication, 
  AirtimeCarrier, 
  StoreConfig, 
  UserRole,
  ShiftRegister
} from '../../types/pos';

interface Props {
  products: Product[];
  config: StoreConfig;
  activeRole: UserRole;
  onExitPOS: () => void;
  onRecordSale: (sale: SaleTransaction) => void;
  onRecordPayJoy: (app: PayJoyApplication) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateAirtimeBalance: (newBalance: number) => void;
  currentShift: ShiftRegister | null;
}

export const POSScreen: React.FC<Props> = ({
  products,
  config,
  activeRole,
  onExitPOS,
  onRecordSale,
  onRecordPayJoy,
  onUpdateProducts,
  onUpdateAirtimeBalance,
  currentShift,
}) => {
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>('celulares');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPhoneForImei, setSelectedPhoneForImei] = useState<Product | null>(null);
  const [showAirtimeModal, setShowAirtimeModal] = useState(false);
  const [showPayJoyModal, setShowPayJoyModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Cashier name display
  const cashierName =
    activeRole === 'cajero'
      ? 'Juan Pérez (Cajero)'
      : activeRole === 'supervisor'
      ? 'Supervisor de Turno'
      : 'Administrador';

  // Handle product click
  const handleProductClick = (product: Product) => {
    // If it's a mobile phone that requires an IMEI, open IMEI selector modal
    if (product.requiresImei) {
      setSelectedPhoneForImei(product);
      return;
    }

    // Add 1 to cart
    addProductToCart(product);
  };

  const addProductToCart = (product: Product, imei?: string) => {
    setCart((prevCart) => {
      // If product requires IMEI, create distinct line for each device
      if (product.requiresImei && imei) {
        return [
          ...prevCart,
          {
            id: `item-${product.id}-${Date.now()}`,
            product,
            quantity: 1,
            unitPrice: product.price,
            selectedImei: imei,
          },
        ];
      }

      // Standard item
      const existing = prevCart.find((item) => item.product.id === product.id && !item.selectedImei);
      if (existing) {
        return prevCart.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: `item-${product.id}-${Date.now()}`,
          product,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  };

  const handleConfirmImei = (imei: string) => {
    if (selectedPhoneForImei) {
      addProductToCart(selectedPhoneForImei, imei);
      setSelectedPhoneForImei(null);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && confirm('¿Estás seguro de vaciar el ticket actual?')) {
      setCart([]);
    }
  };

  // Checkout regular sale
  const handleCheckout = (method: PaymentMethod, cashReceived: number, change: number) => {
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const folio = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      folio,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      role: activeRole,
      cashierName,
      items: [...cart],
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod: method,
      cashReceived,
      changeGiven: change,
    };

    // Deduct stock for sold items
    const updatedProducts = products.map((prod) => {
      const soldItem = cart.find((i) => i.product.id === prod.id);
      if (soldItem) {
        const nextStock = Math.max(0, prod.stock - soldItem.quantity);
        let nextImeis = prod.availableImeis ? [...prod.availableImeis] : [];
        if (soldItem.selectedImei) {
          nextImeis = nextImeis.filter((im) => im !== soldItem.selectedImei);
        }
        return { ...prod, stock: nextStock, availableImeis: nextImeis };
      }
      return prod;
    });

    onUpdateProducts(updatedProducts);
    onRecordSale(newSale);
    setCompletedSale(newSale);
    setShowReceiptModal(true);
    setCart([]);
  };

  // Airtime Recharge confirmed
  const handleConfirmAirtime = (carrier: AirtimeCarrier, phoneNumber: string, amount: number) => {
    const authCode = `AUT-${Math.floor(100000 + Math.random() * 900000)}`;
    const folio = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSale: SaleTransaction = {
      id: `sale-ta-${Date.now()}`,
      folio,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      role: activeRole,
      cashierName,
      items: [],
      subtotal: amount,
      discount: 0,
      total: amount,
      paymentMethod: 'efectivo',
      cashReceived: amount,
      changeGiven: 0,
      airtimeDetails: {
        carrier: carrier.name,
        phoneNumber,
        amount,
        authCode,
      },
    };

    // Deduct from airtime bag
    const newBalance = Math.max(0, config.airtimeBalance - amount);
    onUpdateAirtimeBalance(newBalance);

    onRecordSale(newSale);
    setCompletedSale(newSale);
    setShowReceiptModal(true);
  };

  // PayJoy Credit confirmed
  const handleConfirmPayJoy = (app: PayJoyApplication) => {
    onRecordPayJoy(app);

    // Also create a sale transaction for down payment received in register
    const folio = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const matchedProduct = products.find((p) => p.name === app.deviceModel);

    const newSale: SaleTransaction = {
      id: `sale-pj-${Date.now()}`,
      folio,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      role: activeRole,
      cashierName,
      items: matchedProduct
        ? [
            {
              id: `item-pj-${matchedProduct.id}`,
              product: matchedProduct,
              quantity: 1,
              unitPrice: matchedProduct.price,
              selectedImei: app.deviceImei,
            },
          ]
        : [],
      subtotal: matchedProduct ? matchedProduct.price : app.devicePrice,
      discount: 0,
      total: app.downPayment, // Enganche collected in cash register
      paymentMethod: 'payjoy',
      payjoyContractId: app.folio,
      cashReceived: app.downPayment,
      changeGiven: 0,
      notes: `Venta crédito PayJoy Folio ${app.folio}. Enganche cobrado: $${app.downPayment}. Pagos semanales: $${app.weeklyPayment}.`,
    };

    // Deduct stock and bound IMEI
    if (matchedProduct) {
      const updatedProducts = products.map((prod) => {
        if (prod.id === matchedProduct.id) {
          const nextStock = Math.max(0, prod.stock - 1);
          const nextImeis = prod.availableImeis
            ? prod.availableImeis.filter((im) => im !== app.deviceImei)
            : [];
          return { ...prod, stock: nextStock, availableImeis: nextImeis };
        }
        return prod;
      });
      onUpdateProducts(updatedProducts);
    }

    onRecordSale(newSale);
    setCompletedSale(newSale);
    setShowReceiptModal(true);
  };

  // Handle Exit to System
  const handleExitClick = () => {
    // If cashier profile, requires supervisor PIN to exit
    if (activeRole === 'cajero') {
      setShowPinModal(true);
    } else {
      onExitPOS();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-100 select-none">
      {/* Top POS Action & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-5 py-2 flex items-center justify-between gap-3 shadow-2xs z-10">
        {/* [ <-- Salir / Menú de Rol ] */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitClick}
            title={activeRole === 'cajero' ? 'Salir requiere PIN de Supervisor' : 'Salir al Menú'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 border border-slate-300/80"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Salir al Sistema</span>
            {activeRole === 'cajero' && (
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1 py-0.2 rounded border border-amber-200 ml-1">
                PIN
              </span>
            )}
          </button>

          {/* Shift status */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Caja Activa:</span>
            <span className="font-bold text-slate-800">
              ${(currentShift?.totalCashExpected || 0).toLocaleString('es-MX')} MXN
            </span>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Quick PayJoy Trigger */}
          <button
            onClick={() => setShowPayJoyModal(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Crédito PayJoy</span>
          </button>

          {/* Quick Airtime Trigger */}
          <button
            onClick={() => setShowAirtimeModal(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 text-xs font-bold transition active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
            <span>Tiempo Aire</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column POS Body */}
      {/* Left: Touch Category Tabs + Visual Products Grid */}
      {/* Right: Ticket + Integrated Calculator / Keypad + Direct Checkout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Grid Area */}
        <TouchGrid
          products={products}
          currentCategory={currentCategory}
          onSelectCategory={(cat) => setCurrentCategory(cat)}
          onProductClick={handleProductClick}
          onOpenAirtime={() => setShowAirtimeModal(true)}
          onOpenPayJoy={() => setShowPayJoyModal(true)}
          gridSize={config.gridSize}
        />

        {/* Right Ticket & Calculator */}
        <TicketAndKeypad
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          onOpenPayJoy={() => setShowPayJoyModal(true)}
          onOpenAirtime={() => setShowAirtimeModal(true)}
        />
      </div>

      {/* Supervisor PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          onExitPOS();
        }}
        expectedPin={config.supervisorPin}
        title="PIN de Supervisor para Salir del POS"
      />

      {/* IMEI Selector Modal */}
      {selectedPhoneForImei && (
        <ImeiSelectorModal
          product={selectedPhoneForImei}
          isOpen={!!selectedPhoneForImei}
          onClose={() => setSelectedPhoneForImei(null)}
          onConfirm={handleConfirmImei}
        />
      )}

      {/* Airtime Recharge Modal */}
      <AirtimeModal
        isOpen={showAirtimeModal}
        onClose={() => setShowAirtimeModal(false)}
        airtimeBalance={config.airtimeBalance}
        onConfirmRecharge={handleConfirmAirtime}
      />

      {/* PayJoy Loan Application Modal */}
      <PayJoyModal
        isOpen={showPayJoyModal}
        onClose={() => setShowPayJoyModal(false)}
        products={products}
        onConfirmCredit={handleConfirmPayJoy}
        cashierName={cashierName}
      />

      {/* Receipt Thermal Printer Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        sale={completedSale}
        config={config}
      />
    </div>
  );
};
