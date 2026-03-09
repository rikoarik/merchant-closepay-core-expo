/**
 * KSO Plugin - KsoAgreement model
 */
export type KsoAgreementType = 'revenue_share' | 'fee';
export type KsoAgreementStatus = 'active' | 'inactive' | 'pending';

export interface KsoAgreement {
  id: string;
  partnerName: string;
  partnerCode?: string;
  type?: KsoAgreementType;
  status: KsoAgreementStatus;
  revenueSharePercent?: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KsoAgreementCreatePayload {
  partnerName: string;
  partnerCode?: string;
  type?: KsoAgreementType;
  status?: KsoAgreementStatus;
  revenueSharePercent?: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface KsoAgreementUpdatePayload extends Partial<KsoAgreementCreatePayload> {}

export interface KsoAgreementFilters {
  status?: KsoAgreementStatus;
  type?: KsoAgreementType;
  search?: string;
  limit?: number;
  offset?: number;
}
