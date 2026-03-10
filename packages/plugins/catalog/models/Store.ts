/**
 * Catalog - Store model (profil toko, jam operasional, delivery)
 * Used for both FnB and Marketplace merchant store profile.
 */

export interface OperatingHoursDay {
  open: string; // HH:mm
  close: string; // HH:mm
  closed: boolean; // if true, open/close ignored
}

export interface OperatingHours {
  monday?: OperatingHoursDay;
  tuesday?: OperatingHoursDay;
  wednesday?: OperatingHoursDay;
  thursday?: OperatingHoursDay;
  friday?: OperatingHoursDay;
  saturday?: OperatingHoursDay;
  sunday?: OperatingHoursDay;
}

export interface DeliverySettings {
  enabled: boolean;
  radiusKm?: number;
  deliveryFee?: number;
  minOrderFreeDelivery?: number;
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  operatingHours?: OperatingHours;
  delivery?: DeliverySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreUpdatePayload {
  name?: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  operatingHours?: OperatingHours;
  delivery?: DeliverySettings;
}
