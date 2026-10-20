export type UserRole = 'cajero' | 'supervisor' | 'admin' | 'tecnico';

export interface RoleInfo {
  id: UserRole;
  title: string;
  shortName: string;
  description: string;
  badgeColor: string;
  iconName: string;
}

export type ProductCategory = 
  | 'celulares' 
  | 'micas' 
  | 'fundas' 
  | 'cargadores' 
  | 'tiempo_aire' 
  | 'payjoy' 
  | 'audio';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  icon: string;
  imageUrl?: string;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  image: string;
  isFavorite?: boolean;
  order?: number;
  requiresImei?: boolean;
  brand?: string;
  barcode?: string;
  availableImeis?: string[];
}

export interface CartItem {
  id: string; // product id or unique cart item id
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedImei?: string;
  discount?: number; // monetary discount per line
}

export type PaymentMethod = 'efectivo' | 'payjoy' | 'tarjeta' | 'transferencia' | 'mixto';

export interface SaleTransaction {
  id: string;
  folio: string;
  timestamp: string;
  role: UserRole;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  payjoyContractId?: string;
  airtimeDetails?: {
    carrier: string;
    phoneNumber: string;
    amount: number;
    authCode: string;
  };
  notes?: string;
}

export type PayJoyStatus = 'precalificado' | 'pendiente_firma' | 'aprobado' | 'entregado' | 'rechazado';

export interface PayJoyApplication {
  id: string;
  folio: string;
  date: string;
  customerName: string;
  customerIne: string;
  customerPhone: string;
  deviceModel: string;
  deviceImei: string;
  devicePrice: number;
  downPayment: number; // Enganche
  weeklyPayment: number; // Semanalidad
  termWeeks: number; // e.g. 26 or 52
  commissionStore: number;
  status: PayJoyStatus;
  cashierName: string;
  notes?: string;
}

export interface AirtimeCarrier {
  id: string;
  name: string;
  logo: string;
  color: string;
  amounts: number[];
  prefix?: string;
}

export interface ShiftRegister {
  id: string;
  openedAt: string;
  closedAt?: string;
  cashierName: string;
  initialFund: number;
  cashSales: number;
  payjoyDownPayments: number;
  airtimeSales: number;
  cardSales: number;
  transferSales: number;
  totalCashExpected: number;
  totalCashCounted?: number;
  cashDifference?: number;
  notes?: string;
  status: 'abierto' | 'cerrado';
}

export interface StoreConfig {
  storeName: string;
  address: string;
  phone: string;
  rfc: string;
  gridSize: 'compact' | 'comfortable'; // 15"+ compact vs 10" tablet large
  supervisorPin: string;
  payjoyApiKey: string;
  payjoyApiSecret: string;
  payjoySandbox: boolean;
  airtimeBalance: number;
  airtimeMinAlert: number;
  sampleDataCleared: boolean;
  supabaseReady: boolean;
}
