/**
 * Catalog - Product model
 */
export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreatePayload {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {}

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
