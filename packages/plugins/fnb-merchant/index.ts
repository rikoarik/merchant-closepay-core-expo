/**
 * FnB Merchant Plugin
 * FnB menu and order management for merchant
 */

import { createPluginModule } from '@core/config';

export { FnBScreen, FnBMenuManageScreen, FnBOrderInboxScreen, FnBOrderDetailScreen } from './components/screens';
export { useFnBMenu, useFnBOrders, useFnBOrderDetail } from './hooks';
export { fnbMerchantService } from './services/fnbMerchantService';
export type { FnBMenuItem, FnBOrder } from './models';

const manifest = require('./plugin.manifest.json');

const componentLoaders: Record<string, () => Promise<any>> = {
  FnBScreen: () => import('./components/screens/FnBScreen'),
  FnBMenuManageScreen: () => import('./components/screens/FnBMenuManageScreen'),
  FnBOrderInboxScreen: () => import('./components/screens/FnBOrderInboxScreen'),
  FnBOrderDetailScreen: () => import('./components/screens/FnBOrderDetailScreen'),
};

export default createPluginModule(manifest, componentLoaders);
