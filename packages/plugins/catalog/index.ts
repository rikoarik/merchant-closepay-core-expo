/**
 * Catalog Plugin
 * Product and category management for merchant
 */

import { createPluginModule } from '@core/config';

export { ProductScreen, ProductListScreen, ProductCreateScreen, ProductEditScreen, CategoryListScreen } from './components/screens';
export { useCatalogProducts, useCatalogCategories, useProduct } from './hooks';
export { catalogService } from './services/catalogService';
export type { Product, Category, ProductFilters } from './models';

const manifest = require('./plugin.manifest.json');

const componentLoaders: Record<string, () => Promise<any>> = {
  ProductScreen: () => import('./components/screens/ProductScreen'),
  ProductListScreen: () => import('./components/screens/ProductListScreen'),
  ProductCreateScreen: () => import('./components/screens/ProductCreateScreen'),
  ProductEditScreen: () => import('./components/screens/ProductEditScreen'),
  CategoryListScreen: () => import('./components/screens/CategoryListScreen'),
};

export default createPluginModule(manifest, componentLoaders);
