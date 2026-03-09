/**
 * FnB Merchant - FnB order model (incoming orders for merchant)
 */
export interface FnBOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface FnBOrder {
  id: string;
  items: FnBOrderItem[];
  total: number;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FnBOrderFilters {
  status?: FnBOrder['status'];
  limit?: number;
  offset?: number;
}
