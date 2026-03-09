/**
 * Order Plugin - Order Service
 * Merchant order management. Mock when API not available.
 */

import { axiosInstance } from '@core/config';
import { Order } from '../models/Order';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    items: [
      { productId: 'p1', productName: 'Produk Contoh 1', quantity: 2, price: 25000, subtotal: 50000 },
    ],
    subtotal: 50000,
    total: 50000,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ord2',
    items: [
      { productId: 'p2', productName: 'Produk Contoh 2', quantity: 1, price: 50000, subtotal: 50000 },
    ],
    subtotal: 50000,
    total: 50000,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
];

let mockOrders = MOCK_ORDERS.map(o => ({ ...o, items: [...o.items] }));

const USE_MOCK = true;

export interface OrderService {
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  getOrders(filters?: OrderFilters): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: Order['status']): Promise<Order>;
  cancelOrder(orderId: string): Promise<Order>;
}

export interface OrderFilters {
  status?: Order['status'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

function parseOrder(o: any): Order {
  return {
    ...o,
    createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
  };
}

class OrderServiceImpl implements OrderService {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    if (USE_MOCK) {
      const newOrder: Order = {
        ...order,
        id: `ord${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOrders = [newOrder, ...mockOrders];
      return newOrder;
    }
    const { data } = await axiosInstance.post<Order>('/merchant/orders', order);
    return parseOrder(data);
  }

  async getOrder(orderId: string): Promise<Order> {
    if (USE_MOCK) {
      const o = mockOrders.find(x => x.id === orderId);
      if (!o) throw new Error('Order not found');
      return { ...o, items: [...o.items] };
    }
    const { data } = await axiosInstance.get<Order>(`/merchant/orders/${orderId}`);
    return parseOrder(data);
  }

  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    if (USE_MOCK) {
      let list = [...mockOrders];
      if (filters?.status) list = list.filter(o => o.status === filters.status);
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      return list.slice(offset, offset + limit);
    }
    const { data } = await axiosInstance.get<Order[]>('/merchant/orders', { params: filters });
    return (Array.isArray(data) ? data : []).map(parseOrder);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    if (USE_MOCK) {
      const idx = mockOrders.findIndex(o => o.id === orderId);
      if (idx === -1) throw new Error('Order not found');
      mockOrders[idx] = { ...mockOrders[idx], status, updatedAt: new Date() };
      return mockOrders[idx];
    }
    const { data } = await axiosInstance.patch<Order>(`/merchant/orders/${orderId}/status`, { status });
    return parseOrder(data);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'cancelled');
  }
}

export const orderService: OrderService = new OrderServiceImpl();
