/**
 * Catalog - Category model
 */
export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreatePayload {
  name: string;
  slug?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface CategoryUpdatePayload {
  name?: string;
  slug?: string;
  parentId?: string;
  sortOrder?: number;
}
