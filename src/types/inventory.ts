export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category?: Category;
  description?: string;
  unit: string; // 'pcs', 'kg', 'box', 'litres', etc.
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_threshold: number;
  location?: string; // Warehouse A, Rack 3, etc.
  created_at: string;
  updated_at: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type MovementReason = 
  | 'purchase'
  | 'sale'
  | 'damaged'
  | 'return'
  | 'audit'
  | 'initial'
  | 'transfer';

export interface StockMovement {
  id: string;
  product_id: string;
  product?: Product;
  type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: MovementReason;
  reference?: string; // PO Number, Sales Receipt, etc.
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalCategories: number;
  totalStockUnits: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  recentMovementsCount: number;
}

export interface LowStockAlertItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  min_threshold: number;
  deficit: number;
  cost_price: number;
}

