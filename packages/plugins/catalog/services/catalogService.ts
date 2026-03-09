/**
 * Catalog - Catalog Service
 * CRUD products and categories. Uses mock data when API is not available.
 */

import { axiosInstance } from '@core/config';
import type {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductFilters,
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '../models';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Produk Contoh 1',
    sku: 'SKU-001',
    description: 'Deskripsi produk contoh',
    price: 25000,
    categoryId: 'cat1',
    stock: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    name: 'Produk Contoh 2',
    price: 50000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Umum', slug: 'umum', sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat2', name: 'Makanan', slug: 'makanan', sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
];

let mockProducts = [...MOCK_PRODUCTS];
let mockCategories = [...MOCK_CATEGORIES];

const USE_MOCK = true; // Set false when backend is ready

export interface CatalogService {
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(payload: ProductCreatePayload): Promise<Product>;
  updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(payload: CategoryCreatePayload): Promise<Category>;
  updateCategory(id: string, payload: CategoryUpdatePayload): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

class CatalogServiceImpl implements CatalogService {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    if (USE_MOCK) {
      let list = [...mockProducts];
      if (filters?.categoryId) list = list.filter(p => p.categoryId === filters.categoryId);
      if (filters?.isActive !== undefined) list = list.filter(p => p.isActive === filters.isActive);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
      }
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      return list.slice(offset, offset + limit);
    }
    const { data } = await axiosInstance.get<Product[]>('/merchant/catalog/products', { params: filters });
    return Array.isArray(data) ? data : [];
  }

  async getProduct(id: string): Promise<Product | null> {
    if (USE_MOCK) {
      return mockProducts.find(p => p.id === id) ?? null;
    }
    try {
      const { data } = await axiosInstance.get<Product>(`/merchant/catalog/products/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    if (USE_MOCK) {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        name: payload.name,
        sku: payload.sku,
        description: payload.description,
        price: payload.price,
        categoryId: payload.categoryId,
        imageUrl: payload.imageUrl,
        stock: payload.stock ?? 0,
        isActive: payload.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProducts.push(newProduct);
      return newProduct;
    }
    const { data } = await axiosInstance.post<Product>('/merchant/catalog/products', payload);
    return data;
  }

  async updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
    if (USE_MOCK) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      mockProducts[idx] = { ...mockProducts[idx], ...payload, updatedAt: new Date() };
      return mockProducts[idx];
    }
    const { data } = await axiosInstance.put<Product>(`/merchant/catalog/products/${id}`, payload);
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    if (USE_MOCK) {
      mockProducts = mockProducts.filter(p => p.id !== id);
      return;
    }
    await axiosInstance.delete(`/merchant/catalog/products/${id}`);
  }

  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      return [...mockCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    const { data } = await axiosInstance.get<Category[]>('/merchant/catalog/categories');
    return Array.isArray(data) ? data : [];
  }

  async getCategory(id: string): Promise<Category | null> {
    if (USE_MOCK) {
      return mockCategories.find(c => c.id === id) ?? null;
    }
    try {
      const { data } = await axiosInstance.get<Category>(`/merchant/catalog/categories/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async createCategory(payload: CategoryCreatePayload): Promise<Category> {
    if (USE_MOCK) {
      const newCat: Category = {
        id: `cat${Date.now()}`,
        name: payload.name,
        slug: payload.slug ?? payload.name.toLowerCase().replace(/\s+/g, '-'),
        parentId: payload.parentId,
        sortOrder: payload.sortOrder ?? mockCategories.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCategories.push(newCat);
      return newCat;
    }
    const { data } = await axiosInstance.post<Category>('/merchant/catalog/categories', payload);
    return data;
  }

  async updateCategory(id: string, payload: CategoryUpdatePayload): Promise<Category> {
    if (USE_MOCK) {
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      mockCategories[idx] = { ...mockCategories[idx], ...payload, updatedAt: new Date() };
      return mockCategories[idx];
    }
    const { data } = await axiosInstance.put<Category>(`/merchant/catalog/categories/${id}`, payload);
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    if (USE_MOCK) {
      mockCategories = mockCategories.filter(c => c.id !== id);
      return;
    }
    await axiosInstance.delete(`/merchant/catalog/categories/${id}`);
  }
}

export const catalogService = new CatalogServiceImpl();
