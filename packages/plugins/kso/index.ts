/**
 * KSO Plugin
 * Kerja Sama Operasional (Operational Cooperation) management
 */

import { createPluginModule } from '@core/config';

export { KSOScreen, KsoListScreen, KsoDetailScreen, KsoCreateScreen, KsoEditScreen, KsoTransactionScreen, KsoHistoryScreen } from './components/screens';
export { useKsoList, useKso, useKsoSettlements } from './hooks';
export { ksoService } from './services/ksoService';
export type { KsoAgreement, KsoAgreementCreatePayload, KsoAgreementUpdatePayload, KsoAgreementFilters, KsoSettlement } from './models';

const manifest = require('./plugin.manifest.json');

const componentLoaders: Record<string, () => Promise<any>> = {
  KSOScreen: () => import('./components/screens/KSOScreen'),
  KsoListScreen: () => import('./components/screens/KsoListScreen'),
  KsoDetailScreen: () => import('./components/screens/KsoDetailScreen'),
  KsoCreateScreen: () => import('./components/screens/KsoCreateScreen'),
  KsoEditScreen: () => import('./components/screens/KsoEditScreen'),
  KsoTransactionScreen: () => import('./components/screens/KsoTransactionScreen'),
  KsoHistoryScreen: () => import('./components/screens/KsoHistoryScreen'),
};

export default createPluginModule(manifest, componentLoaders);
