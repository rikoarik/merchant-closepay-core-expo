/**
 * FnB Merchant - Menu item model
 */
export interface FnBMenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available: boolean;
  sortOrder: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FnBMenuItemCreatePayload {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available?: boolean;
  sortOrder?: number;
  description?: string;
}

export interface FnBMenuItemUpdatePayload extends Partial<FnBMenuItemCreatePayload> {}
