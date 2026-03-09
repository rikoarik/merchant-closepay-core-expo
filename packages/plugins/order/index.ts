/**
 * Order Plugin
 * Order processing, tracking, and management for merchant
 */

import { createPluginModule } from '@core/config';

export * from './models/Order';
export * from './models/OrderItem';
export * from './models/Cart';
export * from './models/Invoice';
export * from './models/Installment';
export * from './services/orderService';
export * from './services/cartService';
export * from './services/invoiceService';
export * from './components/CartView';
export * from './components/OrderList';
export * from './components/CartItemSkeleton';
export { OrderScreen, OrderListScreen, OrderDetailScreen } from './components/screens';
export { useOrders, useOrderDetail } from './hooks';

const manifest = require('./plugin.manifest.json');

const componentLoaders: Record<string, () => Promise<any>> = {
  OrderScreen: () => import('./components/screens/OrderScreen'),
  OrderListScreen: () => import('./components/screens/OrderListScreen'),
  OrderDetailScreen: () => import('./components/screens/OrderDetailScreen'),
};

export default createPluginModule(manifest, componentLoaders);
