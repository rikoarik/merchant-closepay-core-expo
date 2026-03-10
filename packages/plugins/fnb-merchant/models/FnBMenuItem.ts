/**
 * FnB Merchant - Menu item model (with variant & addon)
 */
export interface FnBVariant {
  id: string;
  name: string;
  price: number; // extra price (0 = same as base)
}

export interface FnBAddon {
  id: string;
  name: string;
  price: number;
}

export interface FnBMenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available: boolean;
  sortOrder: number;
  description?: string;
  variants?: FnBVariant[];
  addons?: FnBAddon[];
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
  variants?: FnBVariant[];
  addons?: FnBAddon[];
}

export interface FnBMenuItemUpdatePayload extends Partial<FnBMenuItemCreatePayload> {}
