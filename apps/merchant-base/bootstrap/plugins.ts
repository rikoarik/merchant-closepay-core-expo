/**
 * Plugin bootstrap — merchant: balance, payment, invoice, catalog, order, fnb-merchant.
 */

import { PluginRegistry } from '@core/config';

import balance from '@plugins/balance';
import payment from '@plugins/payment';
import invoice from '@plugins/invoice';
import catalog from '@plugins/catalog';
import order from '@plugins/order';
import fnbMerchant from '@plugins/fnb-merchant';
import kso from '@plugins/kso';

export function bootstrapPlugins(): void {
  PluginRegistry.registerPlugins([balance, payment, invoice, catalog, order, fnbMerchant, kso]);

  if (__DEV__) {
    PluginRegistry.validate();
  }
}
