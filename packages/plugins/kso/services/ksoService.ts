/**
 * KSO Plugin - KSO Service
 * Mock when API not available.
 */

import { axiosInstance } from '@core/config';
import type {
  KsoAgreement,
  KsoAgreementCreatePayload,
  KsoAgreementUpdatePayload,
  KsoAgreementFilters,
  KsoSettlement,
} from '../models';

const MOCK_AGREEMENTS: KsoAgreement[] = [
  {
    id: 'kso1',
    partnerName: 'Partner A',
    partnerCode: 'PTR-A',
    type: 'revenue_share',
    status: 'active',
    revenueSharePercent: 30,
    startDate: new Date('2024-01-01'),
    notes: 'Kerja sama operasional lapangan',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'kso2',
    partnerName: 'Partner B',
    type: 'fee',
    status: 'pending',
    startDate: new Date('2024-06-01'),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
];

const MOCK_SETTLEMENTS: KsoSettlement[] = [
  {
    id: 'set1',
    ksoId: 'kso1',
    amount: 1500000,
    type: 'payout',
    status: 'paid',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    description: 'Pembagian Januari 2024',
    createdAt: new Date(),
  },
  {
    id: 'set2',
    ksoId: 'kso1',
    amount: 1200000,
    type: 'payout',
    status: 'pending',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    createdAt: new Date(Date.now() - 86400000),
  },
];

let mockAgreements: KsoAgreement[] = MOCK_AGREEMENTS.map(a => ({ ...a, startDate: new Date(a.startDate), endDate: a.endDate ? new Date(a.endDate) : undefined, createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt) }));
let mockSettlements: KsoSettlement[] = MOCK_SETTLEMENTS.map(s => ({ ...s, periodStart: new Date(s.periodStart), periodEnd: new Date(s.periodEnd), createdAt: new Date(s.createdAt) }));

const USE_MOCK = true;

function parseAgreement(o: any): KsoAgreement {
  return {
    ...o,
    startDate: o.startDate ? new Date(o.startDate) : new Date(),
    endDate: o.endDate ? new Date(o.endDate) : undefined,
    createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
  };
}

function parseSettlement(o: any): KsoSettlement {
  return {
    ...o,
    periodStart: o.periodStart ? new Date(o.periodStart) : new Date(),
    periodEnd: o.periodEnd ? new Date(o.periodEnd) : new Date(),
    createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
  };
}

export interface KsoService {
  getKsoList(filters?: KsoAgreementFilters): Promise<KsoAgreement[]>;
  getKso(id: string): Promise<KsoAgreement | null>;
  createKso(payload: KsoAgreementCreatePayload): Promise<KsoAgreement>;
  updateKso(id: string, payload: KsoAgreementUpdatePayload): Promise<KsoAgreement>;
  deleteKso(id: string): Promise<void>;
  getSettlements(ksoId?: string | null): Promise<KsoSettlement[]>;
}

class KsoServiceImpl implements KsoService {
  async getKsoList(filters?: KsoAgreementFilters): Promise<KsoAgreement[]> {
    if (USE_MOCK) {
      let list = [...mockAgreements];
      if (filters?.status) list = list.filter(a => a.status === filters.status);
      if (filters?.type) list = list.filter(a => a.type === filters.type);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(a =>
          a.partnerName.toLowerCase().includes(q) ||
          (a.partnerCode && a.partnerCode.toLowerCase().includes(q))
        );
      }
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      return list.slice(offset, offset + limit);
    }
    const { data } = await axiosInstance.get<KsoAgreement[]>('/merchant/kso/agreements', { params: filters });
    return (Array.isArray(data) ? data : []).map(parseAgreement);
  }

  async getKso(id: string): Promise<KsoAgreement | null> {
    if (USE_MOCK) {
      const a = mockAgreements.find(x => x.id === id);
      return a ? { ...a } : null;
    }
    try {
      const { data } = await axiosInstance.get<KsoAgreement>(`/merchant/kso/agreements/${id}`);
      return parseAgreement(data);
    } catch {
      return null;
    }
  }

  async createKso(payload: KsoAgreementCreatePayload): Promise<KsoAgreement> {
    if (USE_MOCK) {
      const newAgreement: KsoAgreement = {
        ...payload,
        id: `kso${Date.now()}`,
        status: payload.status ?? 'pending',
        startDate: payload.startDate instanceof Date ? payload.startDate : new Date(payload.startDate),
        endDate: payload.endDate ? (payload.endDate instanceof Date ? payload.endDate : new Date(payload.endDate)) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAgreements = [newAgreement, ...mockAgreements];
      return newAgreement;
    }
    const { data } = await axiosInstance.post<KsoAgreement>('/merchant/kso/agreements', payload);
    return parseAgreement(data);
  }

  async updateKso(id: string, payload: KsoAgreementUpdatePayload): Promise<KsoAgreement> {
    if (USE_MOCK) {
      const idx = mockAgreements.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('KSO not found');
      const base = mockAgreements[idx];
      const updated: KsoAgreement = {
        ...base,
        ...payload,
        id: base.id,
        startDate: payload.startDate ? (payload.startDate instanceof Date ? payload.startDate : new Date(payload.startDate)) : base.startDate,
        endDate: payload.endDate !== undefined ? (payload.endDate ? (payload.endDate instanceof Date ? payload.endDate : new Date(payload.endDate)) : undefined) : base.endDate,
        updatedAt: new Date(),
      };
      mockAgreements[idx] = updated;
      return updated;
    }
    const { data } = await axiosInstance.put<KsoAgreement>(`/merchant/kso/agreements/${id}`, payload);
    return parseAgreement(data);
  }

  async deleteKso(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = mockAgreements.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('KSO not found');
      mockAgreements = mockAgreements.filter(a => a.id !== id);
      return;
    }
    await axiosInstance.delete(`/merchant/kso/agreements/${id}`);
  }

  async getSettlements(ksoId?: string | null): Promise<KsoSettlement[]> {
    if (USE_MOCK) {
      let list = [...mockSettlements];
      if (ksoId) list = list.filter(s => s.ksoId === ksoId);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const params = ksoId ? { ksoId } : {};
    const { data } = await axiosInstance.get<KsoSettlement[]>('/merchant/kso/settlements', { params });
    return (Array.isArray(data) ? data : []).map(parseSettlement);
  }
}

export const ksoService: KsoService = new KsoServiceImpl();
