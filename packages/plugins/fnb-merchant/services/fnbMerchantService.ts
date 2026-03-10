/**
 * FnB Merchant - Service for menu and FnB orders. Mock when API not available.
 */

import { axiosInstance } from '@core/config';
import type { FnBMenuItem, FnBMenuItemCreatePayload, FnBMenuItemUpdatePayload } from '../models/FnBMenuItem';
import type { FnBOrder, FnBOrderFilters } from '../models/FnBOrder';

const MOCK_MENU: FnBMenuItem[] = [
  {
    id: 'fnb1',
    name: 'Nasi Goreng',
    price: 25000,
    category: 'Makanan',
    available: true,
    sortOrder: 0,
    variants: [
      { id: 'v1', name: 'Porsi Kecil', price: 0 },
      { id: 'v2', name: 'Porsi Besar', price: 5000 },
    ],
    addons: [
      { id: 'a1', name: 'Telur', price: 3000 },
      { id: 'a2', name: 'Ayam', price: 7000 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fnb2',
    name: 'Es Teh',
    price: 5000,
    category: 'Minuman',
    available: true,
    sortOrder: 1,
    variants: [
      { id: 'v3', name: 'Normal', price: 0 },
      { id: 'v4', name: 'Jumbo', price: 2000 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_FNB_ORDERS: FnBOrder[] = [
  {
    id: 'fo1',
    items: [
      {
        menuItemId: 'fnb1',
        name: 'Nasi Goreng',
        quantity: 1,
        price: 25000,
        subtotal: 35000,
        variant: { id: 'v2', name: 'Porsi Besar', price: 5000 },
        addons: [{ id: 'a1', name: 'Telur', price: 3000 }],
      },
    ],
    subtotal: 35000,
    total: 35000,
    status: 'pending',
    customerName: 'Pelanggan',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let mockMenu = [...MOCK_MENU];
let mockFnBOrders = [...MOCK_FNB_ORDERS];

const USE_MOCK = true;

export interface FnBMerchantService {
  getMenu(): Promise<FnBMenuItem[]>;
  createMenuItem(payload: FnBMenuItemCreatePayload): Promise<FnBMenuItem>;
  updateMenuItem(id: string, payload: FnBMenuItemUpdatePayload): Promise<FnBMenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  getOrders(filters?: FnBOrderFilters): Promise<FnBOrder[]>;
  getOrder(id: string): Promise<FnBOrder | null>;
  updateOrderStatus(id: string, status: FnBOrder['status']): Promise<FnBOrder>;
  rejectOrder(id: string, reason: string): Promise<FnBOrder>;
  getOrderPaymentLink(orderId: string): string;
}

function parseFnBOrder(o: any): FnBOrder {
  return {
    ...o,
    createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
  };
}

class FnBMerchantServiceImpl implements FnBMerchantService {
  async getMenu(): Promise<FnBMenuItem[]> {
    if (USE_MOCK) return [...mockMenu].sort((a, b) => a.sortOrder - b.sortOrder);
    const { data } = await axiosInstance.get<FnBMenuItem[]>('/merchant/fnb/menu');
    return Array.isArray(data) ? data : [];
  }

  async createMenuItem(payload: FnBMenuItemCreatePayload): Promise<FnBMenuItem> {
    if (USE_MOCK) {
      const item: FnBMenuItem = {
        id: `fnb${Date.now()}`,
        name: payload.name,
        price: payload.price,
        category: payload.category,
        imageUrl: payload.imageUrl,
        available: payload.available ?? true,
        sortOrder: payload.sortOrder ?? mockMenu.length,
        description: payload.description,
        variants: payload.variants?.length ? payload.variants.map((v, i) => ({ ...v, id: v.id || `v${Date.now()}_${i}` })) : undefined,
        addons: payload.addons?.length ? payload.addons.map((a, i) => ({ ...a, id: a.id || `a${Date.now()}_${i}` })) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockMenu.push(item);
      return item;
    }
    const { data } = await axiosInstance.post<FnBMenuItem>('/merchant/fnb/menu', payload);
    return data;
  }

  async updateMenuItem(id: string, payload: FnBMenuItemUpdatePayload): Promise<FnBMenuItem> {
    if (USE_MOCK) {
      const idx = mockMenu.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Menu item not found');
      mockMenu[idx] = { ...mockMenu[idx], ...payload, updatedAt: new Date() };
      return mockMenu[idx];
    }
    const { data } = await axiosInstance.put<FnBMenuItem>(`/merchant/fnb/menu/${id}`, payload);
    return data;
  }

  async deleteMenuItem(id: string): Promise<void> {
    if (USE_MOCK) {
      mockMenu = mockMenu.filter(m => m.id !== id);
      return;
    }
    await axiosInstance.delete(`/merchant/fnb/menu/${id}`);
  }

  async getOrders(filters?: FnBOrderFilters): Promise<FnBOrder[]> {
    if (USE_MOCK) {
      let list = [...mockFnBOrders];
      if (filters?.status) list = list.filter(o => o.status === filters.status);
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      return list.slice(offset, offset + limit);
    }
    const { data } = await axiosInstance.get<FnBOrder[]>('/merchant/fnb/orders', { params: filters });
    return (Array.isArray(data) ? data : []).map(parseFnBOrder);
  }

  async getOrder(id: string): Promise<FnBOrder | null> {
    if (USE_MOCK) return mockFnBOrders.find(o => o.id === id) ?? null;
    try {
      const { data } = await axiosInstance.get<FnBOrder>(`/merchant/fnb/orders/${id}`);
      return parseFnBOrder(data);
    } catch {
      return null;
    }
  }

  async updateOrderStatus(id: string, status: FnBOrder['status']): Promise<FnBOrder> {
    if (USE_MOCK) {
      const idx = mockFnBOrders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockFnBOrders[idx] = { ...mockFnBOrders[idx], status, updatedAt: new Date() };
      return mockFnBOrders[idx];
    }
    const { data } = await axiosInstance.patch<FnBOrder>(`/merchant/fnb/orders/${id}/status`, { status });
    return parseFnBOrder(data);
  }

  async rejectOrder(id: string, reason: string): Promise<FnBOrder> {
    if (USE_MOCK) {
      const idx = mockFnBOrders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockFnBOrders[idx] = {
        ...mockFnBOrders[idx],
        status: 'cancelled',
        rejectReason: reason.trim() || undefined,
        updatedAt: new Date(),
      };
      return mockFnBOrders[idx];
    }
    const { data } = await axiosInstance.patch<FnBOrder>(`/merchant/fnb/orders/${id}/reject`, { reason });
    return parseFnBOrder(data);
  }

  getOrderPaymentLink(orderId: string): string {
    return `closepay://pay/fnb/order/${orderId}`;
  }
}

export const fnbMerchantService = new FnBMerchantServiceImpl();
