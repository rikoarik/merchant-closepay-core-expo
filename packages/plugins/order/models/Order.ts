/**
 * Features Order - Order Model
 * Generic order model (Marketplace: pending → paid → packing → shipped → completed)
 */

import { OrderItem } from './OrderItem';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'packing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface ShippingAddress {
  recipientName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  status: OrderStatus;
  invoiceId?: string;
  metadata?: Record<string, any>;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  courier?: string;
  createdAt: Date;
  updatedAt: Date;
}

