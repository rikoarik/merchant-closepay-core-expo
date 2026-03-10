/**
 * FnB Merchant - FnB order model (incoming orders for merchant)
 */
export interface FnBOrderItemVariant {
  id?: string;
  name: string;
  price: number;
}

export interface FnBOrderItemAddon {
  id?: string;
  name: string;
  price: number;
}

export interface FnBOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: FnBOrderItemVariant;
  addons?: FnBOrderItemAddon[];
}

export interface FnBOrder {
  id: string;
  items: FnBOrderItem[];
  total: number;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName?: string;
  notes?: string;
  rejectReason?: string;
  paymentLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FnBOrderFilters {
  status?: FnBOrder['status'];
  limit?: number;
  offset?: number;
}
