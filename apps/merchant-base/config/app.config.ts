/**
 * Merchant Base App Configuration
 *
 * Konfigurasi aplikasi untuk Merchant Closepay (merchant-only).
 */

import type { AppConfig } from '../../../packages/core/config/types/AppConfig';
import Config from '../../../packages/core/native/Config';

export const appConfig: AppConfig = {
  // ============================================================================
  // COMPANY & TENANT IDENTIFICATION
  // ============================================================================
  companyInitial: 'MB',
  companyId: 'merchant-base',
  companyName: 'Merchant Closepay',
  tenantId: 'merchant-base',
  segmentId: 'balance-management',

  // ============================================================================
  // FEATURES & MODULES (merchant: balance, payment, invoice; optional: catalog, order, fnb-merchant)
  // ============================================================================
  enabledFeatures: [],
  enabledModules: {
    balance: true,
    payment: true,
    invoice: true,
    catalog: true,
    order: true,
    'fnb-merchant': true,
    kso: true,
  },

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================
  homeVariant: 'dashboard',
  homeTabs: [
    { id: 'dashboard', label: 'Dashboard', visible: true, order: 1 },
  ],

  menuConfig: [
    { id: 'home', label: 'Beranda', icon: 'home', route: 'Home', visible: true, order: 1 },
    { id: 'transactions', label: 'Transaksi', icon: 'wallet', route: 'Balance', visible: true, order: 2 },
    { id: 'profile', label: 'Profil', icon: 'user', route: 'Profile', visible: true, order: 3 },
  ],

  showQrButton: true,

  berandaWidgets: [
    { id: 'balance-card', visible: true, order: 1 },
    { id: 'quick-access', visible: true, order: 2 },
  ],

  quickAccessMenu: [
    { id: 'receive-payment', route: 'ReceivePayment', labelKey: 'merchant.receivePayment', icon: 'qr', order: 1 },
    { id: 'transactions', route: 'Balance', labelKey: 'merchant.transactions', icon: 'wallet', order: 2 },
    { id: 'invoice', route: 'Invoice', labelKey: 'merchant.invoice', icon: 'invoice', order: 3 },
    { id: 'withdraw', route: 'Withdraw', labelKey: 'merchant.withdraw', icon: 'withdraw', order: 4 },
    { id: 'products', route: 'Product', labelKey: 'merchant.products', icon: 'products', order: 5 },
    { id: 'orders', route: 'Order', labelKey: 'merchant.orders', icon: 'orders', order: 6 },
    { id: 'fnb-manage', route: 'FnB', labelKey: 'merchant.fnbManage', icon: 'fnb', order: 7 },
    { id: 'kso', route: 'KSO', labelKey: 'merchant.kso', icon: 'document', order: 8 },
  ],

  quickMenu: {
    enableDrag: true,
    fixedTopCount: 3,
  },

  showQuickMenuSettingsInProfile: true,

  // ============================================================================
  // BRANDING
  // ============================================================================
  branding: {
    logo: 'assets/logo.png',
    appName: 'Merchant Closepay',
    primaryColor: '#1E40AF',
  },

  // ============================================================================
  // BALANCE CARD COLORS CONFIGURATION
  // ============================================================================
  /**
   * Background colors for different balance card types.
   * Maps balance account title to background color.
   * If not specified, uses branding.primaryColor as default.
   */
  balanceCardColors: {
    'Saldo Utama': '#076409', // Green (default/primary)
    'Saldo Plafon': '#3B82F6', // Blue
    'Saldo Makan': '#10B981', // Green (lighter shade)
  },

  // ============================================================================
  // PAYMENT CONFIGURATION
  // ============================================================================
  paymentMethods: [
    'balance',
    'bank_transfer',
    'virtual_account',
  ],

  // ============================================================================
  // AUTHENTICATION CONFIGURATION
  // ============================================================================
  login: {
    showSignUp: true, // Show/hide sign up link
    showSocialLogin: true, // Show/hide social login buttons
    socialLoginProviders: ['google'], // Available providers: 'google' (Facebook tidak didukung)
  },

  // ============================================================================
  // SERVICES CONFIGURATION
  // ============================================================================
  services: {
    // API Configuration
    api: {
      // Base URL dari environment variable (.env.staging atau .env.production)
      // Fallback ke production URL untuk safety
      baseUrl: Config.API_BASE_URL || 'https://api.solusiuntuknegeri.com',
      timeout: 30000, // Request timeout dalam milliseconds
    },

    // Authentication Service
    auth: {
      useMock: true, // Gunakan mock data (no API calls) untuk development
    },

    // Feature Flags
    features: {
      pushNotification: true, // Enable push notifications
      analytics: true, // Enable analytics tracking
      crashReporting: false, // Enable crash reporting
    },
  },

  // ============================================================================
  // SUPPORT CONFIGURATION
  // ============================================================================
  support: {
    whatsappNumber: Config.SUPPORT_WHATSAPP_NUMBER || '6289526643223', // Format: country code + number tanpa +
    email: Config.SUPPORT_EMAIL || 'support@closepay.com',
  },
};
