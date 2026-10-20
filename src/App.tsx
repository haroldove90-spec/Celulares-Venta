import React, { useState, useEffect } from 'react';
import { UserRole, Product, SaleTransaction, PayJoyApplication, ShiftRegister, StoreConfig } from './types/pos';
import { StorageService } from './services/storage';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar, AppModule } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { POSScreen } from './components/pos/POSScreen';
import { InventoryManager } from './components/inventory/InventoryManager';
import { PayJoyManager } from './components/payjoy/PayJoyManager';
import { ShiftManager } from './components/shifts/ShiftManager';
import { AdminSettings } from './components/admin/AdminSettings';
import { ReportsView } from './components/reports/ReportsView';

export default function App() {
  // Session & navigation state
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [currentModule, setCurrentModule] = useState<AppModule>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Core application data (persisted)
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [payjoyApps, setPayjoyApps] = useState<PayJoyApplication[]>([]);
  const [currentShift, setCurrentShift] = useState<ShiftRegister | null>(null);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftRegister[]>([]);
  const [config, setConfig] = useState<StoreConfig>(StorageService.getConfig());

  // Initialize data on mount
  useEffect(() => {
    setProducts(StorageService.getProducts());
    setSales(StorageService.getSales());
    setPayjoyApps(StorageService.getPayJoyApplications());
    setCurrentShift(StorageService.getCurrentShift());
    setShiftsHistory(StorageService.getShiftsHistory());
    setConfig(StorageService.getConfig());

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update handlers with persistent save
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    StorageService.saveProducts(newProducts);
  };

  const handleRecordSale = (newSale: SaleTransaction) => {
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    StorageService.saveSales(updatedSales);

    // Update active shift if open
    if (currentShift && currentShift.status === 'abierto') {
      let nextCash = currentShift.cashSales;
      let nextPayJoy = currentShift.payjoyDownPayments;
      let nextAirtime = currentShift.airtimeSales;
      let nextCard = currentShift.cardSales;

      if (newSale.airtimeDetails) {
        nextAirtime += newSale.total;
      } else if (newSale.paymentMethod === 'payjoy') {
        nextPayJoy += newSale.total;
      } else if (newSale.paymentMethod === 'efectivo') {
        nextCash += newSale.total;
      } else if (newSale.paymentMethod === 'tarjeta') {
        nextCard += newSale.total;
      }

      const updatedShift: ShiftRegister = {
        ...currentShift,
        cashSales: nextCash,
        payjoyDownPayments: nextPayJoy,
        airtimeSales: nextAirtime,
        cardSales: nextCard,
        totalCashExpected: currentShift.initialFund + nextCash + nextPayJoy + nextAirtime,
      };

      setCurrentShift(updatedShift);
      StorageService.saveCurrentShift(updatedShift);
    }
  };

  const handleRecordPayJoy = (newApp: PayJoyApplication) => {
    const updatedApps = [newApp, ...payjoyApps];
    setPayjoyApps(updatedApps);
    StorageService.savePayJoyApplications(updatedApps);
  };

  const handleUpdatePayJoyStatus = (id: string, status: any) => {
    const updated = payjoyApps.map((a) => (a.id === id ? { ...a, status } : a));
    setPayjoyApps(updated);
    StorageService.savePayJoyApplications(updated);
  };

  const handleOpenShift = (initialFund: number, cashierName: string) => {
    const newShift: ShiftRegister = {
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      cashierName,
      initialFund,
      cashSales: 0,
      payjoyDownPayments: 0,
      airtimeSales: 0,
      cardSales: 0,
      transferSales: 0,
      totalCashExpected: initialFund,
      status: 'abierto',
    };
    setCurrentShift(newShift);
    StorageService.saveCurrentShift(newShift);
  };

  const handleCloseShift = (countedCash: number, difference: number, notes: string) => {
    if (!currentShift) return;
    const closed: ShiftRegister = {
      ...currentShift,
      closedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalCashCounted: countedCash,
      cashDifference: difference,
      notes,
      status: 'cerrado',
    };

    const newHistory = [closed, ...shiftsHistory];
    setShiftsHistory(newHistory);
    StorageService.saveShiftsHistory(newHistory);

    setCurrentShift(null);
    StorageService.saveCurrentShift(null);
    alert('Corte de caja registrado exitosamente.');
  };

  const handleUpdateConfig = (newConfig: StoreConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
  };

  const handleUpdateAirtimeBalance = (newBalance: number) => {
    const updated = { ...config, airtimeBalance: newBalance };
    setConfig(updated);
    StorageService.saveConfig(updated);
  };

  // Permanent Wipe of Sample Data
  const handleWipeSampleData = () => {
    const res = StorageService.wipeAllSampleData();
    setProducts([]);
    setSales([]);
    setPayjoyApps([]);
    setCurrentShift(null);
    setShiftsHistory([]);
    const updatedCfg = StorageService.getConfig();
    setConfig(updatedCfg);
    alert('¡Datos de muestra borrados exitosamente! El navegador no volverá a mostrarlos.');
  };

  // Restore sample demo data
  const handleRestoreDemoData = () => {
    StorageService.restoreDemoData();
    setProducts(StorageService.getProducts());
    setSales(StorageService.getSales());
    setPayjoyApps(StorageService.getPayJoyApplications());
    setCurrentShift(StorageService.getCurrentShift());
    setConfig(StorageService.getConfig());
  };

  // Role Selection
  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    // Cashier goes straight into minimalist POS
    if (role === 'cajero') {
      setCurrentModule('pos');
    } else {
      setCurrentModule('pos');
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
    setCurrentModule('pos');
  };

  // Render Role Selection screen at start
  if (!activeRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans antialiased text-slate-800">
      {/* Cabecera Institucional Unificada */}
      <Header
        activeRole={activeRole}
        config={config}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isOnline={isOnline}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menú Lateral Desplegable en Escritorio */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(m) => setCurrentModule(m)}
          activeRole={activeRole}
          config={config}
          isOpen={isSidebarOpen}
          onLogout={handleLogout}
          onClearSampleData={handleWipeSampleData}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
          {currentModule === 'pos' && (
            <POSScreen
              products={products}
              config={config}
              activeRole={activeRole}
              onExitPOS={() => {
                if (activeRole === 'cajero') {
                  setCurrentModule('shifts');
                } else {
                  setCurrentModule('inventory');
                }
              }}
              onRecordSale={handleRecordSale}
              onRecordPayJoy={handleRecordPayJoy}
              onUpdateProducts={handleUpdateProducts}
              onUpdateAirtimeBalance={handleUpdateAirtimeBalance}
              currentShift={currentShift}
            />
          )}

          {currentModule === 'inventory' && (
            <InventoryManager
              products={products}
              onUpdateProducts={handleUpdateProducts}
            />
          )}

          {currentModule === 'payjoy' && (
            <PayJoyManager
              applications={payjoyApps}
              onUpdateStatus={handleUpdatePayJoyStatus}
            />
          )}

          {currentModule === 'shifts' && (
            <ShiftManager
              currentShift={currentShift}
              sales={sales}
              activeRole={activeRole}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
              shiftsHistory={shiftsHistory}
            />
          )}

          {currentModule === 'reports' && (
            <ReportsView
              sales={sales}
              payjoyApps={payjoyApps}
            />
          )}

          {currentModule === 'settings' && (
            <AdminSettings
              config={config}
              onUpdateConfig={handleUpdateConfig}
              sales={sales}
              payjoyApps={payjoyApps}
              onWipeSampleData={handleWipeSampleData}
              onRestoreDemoData={handleRestoreDemoData}
            />
          )}
        </main>
      </div>

      {/* Navegación Móvil y Tablet (Bottom Bar) */}
      <BottomBar
        currentModule={currentModule}
        onSelectModule={(m) => setCurrentModule(m)}
        activeRole={activeRole}
      />
    </div>
  );
}
