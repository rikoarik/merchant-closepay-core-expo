# Tutorial: Perubahan dari Member ke Merchant

Panduan langkah demi langkah mengubah/ membuat aplikasi **Merchant** dari codebase Member (monorepo Closepay Expo), termasuk **perbedaan tampilan** dan konfigurasi.

---

## Daftar isi

1. [Ringkasan perbedaan Member vs Merchant](#1-ringkasan-perbedaan-member-vs-merchant)
2. [Persiapan: clone & struktur folder](#2-persiapan-clone--struktur-folder)
3. [Perubahan konfigurasi (app.config)](#3-perubahan-konfigurasi-appconfig)
4. [Entry point (index.tsx)](#4-entry-point-indextsx)
5. [Bootstrap plugin](#5-bootstrap-plugin)
6. [Tampilan: Home / Dashboard merchant](#6-tampilan-home--dashboard-merchant)
7. [Navigator & layar yang didaftar](#7-navigator--layar-yang-didaftar)
8. [Tenant config untuk merchant](#8-tenant-config-untuk-merchant)
9. [Root App.tsx (satu repo vs dua repo)](#9-root-apptsx-satu-repo-vs-dua-repo)
10. [Checklist & ringkasan diff](#10-checklist--ringkasan-diff)
11. [Hapus semua yang berhubungan dengan member di merchant](#11-hapus-semua-yang-berhubungan-dengan-member-di-merchant)

---

## 1. Ringkasan perbedaan Member vs Merchant

| Aspek | Member | Merchant |
|-------|--------|----------|
| **Tujuan** | Konsumen: bayar, top-up, transfer, belanja, FnB order, donasi, dll. | Pemilik toko: terima pembayaran, lihat transaksi, kelola invoice, (nanti) POS & produk. |
| **Home** | Beberapa tab: FnB, Beranda, Berita; widget saldo, akses cepat (Top Up, Transfer, FnB, Marketplace, Invoice, Donasi), berita. | Satu dashboard: saldo, ringkasan transaksi hari ini, tombol Terima Pembayaran, shortcut Invoice & Riwayat Transaksi; **tanpa** tab FnB/Beranda/Berita. |
| **Quick menu / Akses cepat** | Top Up, Transfer, Kartu Virtual, Tarik Tunai, Marketplace, FnB, Invoice, Donasi. | Terima Pembayaran, Transaksi, Invoice, Penarikan, Pengaturan. |
| **Plugin diaktifkan** | balance, payment, card-transaction, marketplace, marketplace-fnb, invoice, donasi-zakat. | balance, payment, invoice (minimal); tambah catalog/order saat siap. |
| **Layar khusus** | Scan QR (bayar), FnB, Marketplace, Cart, Donasi, dll. | Terima Pembayaran (QR merchant / link), Riwayat Transaksi, (nanti) POS, Kelola Produk. |
| **Branding** | Nama app mis. "Member Base App", warna hijau. | Nama app mis. "Merchant Closepay", warna/logo bisa beda. |
| **homeVariant** | `'member'` (multi-tab Beranda). | `'dashboard'` (satu layar dashboard). |

---

## 2. Persiapan: clone & struktur folder

**Opsi A – Satu monorepo (member + merchant dalam satu repo)**

- Buat folder app baru: `apps/merchant-base/`.
- Copy isi `apps/member-base/` ke `apps/merchant-base/` (config, src, bootstrap, assets, loadFonts, SecurityProviderWrapper, dll).
- Nanti di root `App.tsx` pilih entry: member-base atau merchant-base (lewat env atau ganti import).

**Opsi B – Dua repo (repo merchant terpisah)**

- Clone repo member ke repo baru (mis. `merchant-closepay-expo`).
- Ganti isi `apps/member-base/` menjadi app merchant (atau rename folder jadi `merchant-base` dan ubah root entry ke `./apps/merchant-base`).
- Tidak perlu folder `member-base` di repo merchant.

Struktur target untuk app merchant (dalam monorepo):

```
apps/merchant-base/
├── config/
│   ├── app.config.ts      ← konfigurasi merchant
│   └── theme.color.ts     ← optional, beda warna
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       ← bisa ganti ke MerchantHomeScreen
│   │   └── ...
│   └── components/
├── bootstrap/
│   └── plugins.ts        ← hanya plugin merchant
├── index.tsx             ← entry merchant
├── loadFonts.ts
└── SecurityProviderWrapper.tsx
```

---

## 3. Perubahan konfigurasi (app.config)

File: `apps/merchant-base/config/app.config.ts`

### 3.1 Identitas & segment

```ts
companyInitial: 'MB',
companyId: 'merchant-base',
companyName: 'Merchant Closepay',
tenantId: 'merchant-base',
segmentId: 'balance-management',
```

### 3.2 Modul yang diaktifkan (hanya yang dipakai merchant)

```ts
enabledModules: {
  balance: true,
  payment: true,
  invoice: true,
  // Jangan aktifkan: marketplace, marketplace-fnb, donasi-zakat, card-transaction
  // Nanti tambah: catalog, order (setelah plugin siap)
},
```

### 3.3 UI: homeVariant & homeTabs

Agar tampilan **berbeda** dari member (tanpa tab FnB/Beranda/Berita), pakai **dashboard** dan satu tab saja:

```ts
homeVariant: 'dashboard',

homeTabs: [
  {
    id: 'dashboard',
    label: 'Dashboard',
    visible: true,
    order: 1,
  },
],
```

Ini membuat HomeScreen hanya punya **satu tab** berisi konten dashboard (lihat [Bagian 6](#6-tampilan-home--dashboard-merchant)).

### 3.4 Quick menu (Akses Cepat) – isi merchant

```ts
quickAccessMenu: [
  { id: 'receive-payment', route: 'ReceivePayment', labelKey: 'merchant.receivePayment', icon: 'qr', order: 1 },
  { id: 'transactions', route: 'TransactionHistory', labelKey: 'merchant.transactions', icon: 'wallet', order: 2 },
  { id: 'invoice', route: 'Invoice', labelKey: 'merchant.invoice', icon: 'invoice', order: 3 },
  { id: 'withdraw', route: 'Withdraw', labelKey: 'merchant.withdraw', icon: 'withdraw', order: 4 },
],
```

- `route` harus nama layar yang benar-benar didaftar di navigator (ReceivePayment bisa placeholder dulu jika belum ada).
- Tambah key i18n `merchant.receivePayment`, `merchant.transactions`, dll. di `packages/core/i18n/locales/`.

### 3.5 Menu bawah / menuConfig (opsional)

```ts
menuConfig: [
  { id: 'home', label: 'Beranda', icon: 'home', route: 'Home', visible: true, order: 1 },
  { id: 'transactions', label: 'Transaksi', icon: 'wallet', route: 'TransactionHistory', visible: true, order: 2 },
  { id: 'profile', label: 'Profil', icon: 'user', route: 'Profile', visible: true, order: 3 },
],
```

### 3.6 Branding

```ts
branding: {
  logo: 'assets/logo-merchant.png',
  appName: 'Merchant Closepay',
  primaryColor: '#1E40AF', // contoh: biru, beda dari member
},
```

### 3.7 Lain-lain

- **showQrButton**: untuk merchant bisa `true` (ke layar Terima Pembayaran / QR merchant) atau `false` jika akses lewat quick menu saja.
- **berandaWidgets**: untuk merchant cukup mis. `[{ id: 'balance-card', visible: true, order: 1 }, { id: 'quick-access', visible: true, order: 2 }]`.
- **showQuickMenuSettingsInProfile**: bebas (true/false).

---

## 4. Entry point (index.tsx)

File: `apps/merchant-base/index.tsx`

### 4.1 Import config merchant

```ts
import { appConfig } from './config/app.config';
```

Pastikan file config yang di-import adalah `apps/merchant-base/config/app.config.ts` (bukan member).

### 4.2 TenantId

```ts
const Navigator = createAppNavigator({
  tenantId: 'merchant-base',  // sama dengan appConfig.tenantId
  HomeScreen: MerchantHomeScreen, // atau HomeScreen jika pakai satu tab dashboard
  appScreens: appScreens,
});
```

### 4.3 Inisialisasi (tetap sama)

```ts
configService.setBaseConfig(appConfig);
const tenantId = appConfig.tenantId ?? appConfig.companyId ?? 'default';
configService.setTenantOverride(resolveTenantConfig(tenantId));
setQuickMenuIconProvider(getMenuIconForQuickAccessMerchant); // provider icon merchant
bootstrapPlugins();   // dari ./bootstrap/plugins (merchant)
await initializePlugins();
```

### 4.4 Provider yang dibutuhkan

- Untuk merchant **tanpa** FnB/Marketplace belanja: tidak perlu `FnBCartProvider`, `FnBLocationProvider`, `FnBActiveOrderProvider`, `MarketplaceOrderProvider`.
- Tetap pakai: `SafeAreaProvider`, `ThemeProvider`, `I18nProvider`, `SecurityProviderWrapper`, `FontLoader`, `Toast`.

Contoh (tanpa provider FnB/Marketplace):

```tsx
return (
  <>
    <StatusBar ... />
    {!configLoaded || !pluginsInitialized ? (
      <LoadingView ... />
    ) : (
      <AppNavigator />
    )}
    <Toast config={toastConfig} />
  </>
);
```

### 4.5 appScreens (layar yang didaftar)

Daftar hanya layar yang relevan untuk merchant, contoh:

```tsx
const appScreens = (
  <>
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    <Stack.Screen name="ReceivePayment" component={ReceivePaymentPlaceholderScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen} />
    <Stack.Screen name="Account" component={ProfileScreen} />
    {/* Invoice dari plugin route jika invoice di-enabled */}
  </>
);
```

- Hapus/don’t register: Notifications, News, NewsDetail, Search, SearchResults, ScanQr (atau ganti ke Terima Pembayaran), RequestMoney, SplitBill, CardTopup, CardLimit, Reports (atau samakan ke TransactionHistory).
- Nama route harus konsisten dengan `quickAccessMenu` dan `menuConfig` (mis. `TransactionHistory`, `ReceivePayment`, `Invoice`).

---

## 5. Bootstrap plugin

File: `apps/merchant-base/bootstrap/plugins.ts`

Daftar hanya plugin yang merchant butuhkan:

```ts
import { PluginRegistry } from '@core/config';
import balance from '@plugins/balance';
import payment from '@plugins/payment';
import invoice from '@plugins/invoice';

export function bootstrapPlugins(): void {
  PluginRegistry.registerPlugins([
    balance,
    payment,
    invoice,
  ]);
  if (__DEV__) {
    PluginRegistry.validate();
  }
}
```

Jangan register: marketplace, marketplace-fnb, donasi-zakat, card-transaction (kecuali nanti dipakai untuk fitur tertentu).

---

## 6. Tampilan: Home / Dashboard merchant

Agar tampilan **jelas beda** dari member, ada dua pendekatan.

### Opsi A: Pakai HomeScreen yang ada + config saja

- Set `homeVariant: 'dashboard'` dan `homeTabs: [{ id: 'dashboard', label: 'Dashboard', visible: true, order: 1 }]`.
- HomeScreen tetap dipakai; karena cuma satu tab, yang tampil hanya isi **DashboardTab** (dari `HomeTabContentRouter`).
- **Kekurangan**: konten `DashboardTab` saat ini masih member-oriented (Top Up, Transfer, QRIS, Belanja). Perlu **edit** `DashboardTab` agar bisa menampilkan konten merchant (saldo, terima pembayaran, transaksi, invoice) atau tambah branch: jika tenant merchant → render komponen merchant.

### Opsi B (disarankan): Buat MerchantHomeScreen

- Buat komponen baru: `apps/merchant-base/src/screens/MerchantHomeScreen.tsx`.
- Layout:
  - **Header**: Logo/nama toko, notifikasi, menu profil (sama konsep TopBar).
  - **Kartu saldo** (pakai `BalanceCard` dari `@plugins/balance` atau custom).
  - **Ringkasan hari ini**: jumlah transaksi, nominal masuk (dummy/API).
  - **Akses cepat**: grid tombol (Terima Pembayaran, Transaksi, Invoice, Penarikan) — bisa pakai komponen quick menu yang ada atau grid custom.
  - **Daftar transaksi terakhir** (opsional): 5–10 transaksi terakhir, tap ke TransactionHistory.
- **Tidak** pakai: TabSwitcher (FnB/Beranda/Berita), FnB floating widget, QR FAB “Scan” (atau FAB dipakai untuk “Terima Pembayaran”).
- Di entry:

```ts
import MerchantHomeScreen from './src/screens/MerchantHomeScreen';
// ...
createAppNavigator({
  tenantId: 'merchant-base',
  HomeScreen: MerchantHomeScreen,
  appScreens: appScreens,
});
```

Ini membuat **seluruh layar utama** merchant berbeda dari member: satu halaman dashboard, tanpa tab FnB/Beranda/Berita.

### Perbedaan visual singkat

| Elemen | Member | Merchant |
|--------|--------|----------|
| Tab di home | FnB | Beranda | Berita | Tidak ada tab; satu layar dashboard |
| Widget utama | Saldo (sembunyikan), quick access, berita/promo | Saldo, ringkasan transaksi, tombol Terima Pembayaran & Invoice |
| FAB | Scan QR (bayar) | Bisa tidak ada atau “Terima Pembayaran” |
| Floating widget | FnB order (sedang pesan) | Tidak ada |
| Warna/logo | branding member | branding merchant (primaryColor, logo) |

---

## 7. Navigator & layar yang didaftar

- **Home**: `MerchantHomeScreen` (atau `HomeScreen` dengan config dashboard).
- **Core (dari createAppNavigator)**: Profile, EditProfile, LanguageSelection, ThemeSettings, QuickMenuSettings, HomeTabSettings.
- **App screens (appScreens)**: TransactionHistory, ReceivePayment (placeholder dulu jika belum ada), Settings, Account; plus layar dari plugin (mis. Invoice dari plugin invoice).
- **Plugin routes**: Hanya dari plugin yang di-register (balance, payment, invoice) — otomatis dari `createAppNavigator` + `PluginRegistry`.

Pastikan setiap `route` yang dipakai di `quickAccessMenu` dan `menuConfig` punya `Stack.Screen` yang sesuai (nama route sama).

---

## 8. Tenant config untuk merchant

Agar `resolveTenantConfig('merchant-base')` mengembalikan override untuk merchant (opsional):

- Di `packages/core/config/tenantResolver.ts`:

```ts
if (tenantId === 'merchant-base') {
  return {
    homeVariant: 'dashboard',
    theme: {
      primaryColor: '#1E40AF',
      appName: 'Merchant Closepay',
    },
  };
}
```

Atau simpan tenant config di backend dan load lewat `configRefreshService`; kalau belum ada, override di resolver cukup untuk membedakan merchant.

---

## 9. Root App.tsx (satu repo vs dua repo)

**Satu monorepo (dua app)**

- Pilih entry lewat env atau build:

```tsx
// App.tsx
const AppEntry = process.env.EXPO_PUBLIC_APP === 'merchant'
  ? require('./apps/merchant-base').default
  : require('./apps/member-base').default;
export default function App() {
  return (
    <AppErrorBoundary>
      <StatusBar style="auto" />
      <AppEntry />
    </AppErrorBoundary>
  );
}
```

- Atau untuk sementara ganti import:

```tsx
import MerchantbaseApp from './apps/merchant-base';
// import MemberbaseApp from './apps/member-base';
```

**Dua repo**

- Di repo merchant, root entry tetap satu:

```tsx
import MerchantbaseApp from './apps/merchant-base';
// ...
<MerchantbaseApp />
```

---

## 10. Checklist & ringkasan diff

### Checklist

- [ ] Copy/buat `apps/merchant-base/` (config, src, bootstrap, index, loadFonts, SecurityProviderWrapper).
- [ ] `config/app.config.ts`: companyId/tenantId merchant, enabledModules (balance, payment, invoice), homeVariant `'dashboard'`, homeTabs cuma dashboard, quickAccessMenu merchant, branding.
- [ ] `index.tsx`: tenantId `'merchant-base'`, HomeScreen = MerchantHomeScreen (atau HomeScreen + dashboard tab), appScreens merchant only, bootstrap plugins merchant only, hilangkan provider FnB/Marketplace jika tidak dipakai.
- [ ] `bootstrap/plugins.ts`: register balance, payment, invoice saja.
- [ ] Buat `MerchantHomeScreen` (dashboard: saldo, ringkasan, tombol Terima Pembayaran, Transaksi, Invoice) atau sesuaikan DashboardTab untuk merchant.
- [ ] Icon quick menu merchant: `setQuickMenuIconProvider(getMenuIconForQuickAccessMerchant)` dengan mapping icon yang dipakai di quickAccessMenu (receivePayment, transactions, invoice, withdraw).
- [ ] Tenant resolver: `resolveTenantConfig('merchant-base')` return override (theme, homeVariant) bila perlu.
- [ ] i18n: tambah key `merchant.receivePayment`, `merchant.transactions`, dll.
- [ ] Root `App.tsx`: pilih merchant entry (env atau ganti import).

### Ringkasan diff (file yang diubah/ditambah)

| File | Perubahan |
|------|-----------|
| `apps/merchant-base/config/app.config.ts` | Baru atau copy dari template; identitas merchant, enabledModules, homeVariant, homeTabs, quickAccessMenu, branding. |
| `apps/merchant-base/index.tsx` | tenantId, HomeScreen, appScreens, bootstrap, provider (tanpa FnB/Marketplace). |
| `apps/merchant-base/bootstrap/plugins.ts` | Hanya balance, payment, invoice. |
| `apps/merchant-base/src/screens/MerchantHomeScreen.tsx` | Baru: dashboard merchant (saldo, ringkasan, akses cepat). |
| `packages/core/config/tenantResolver.ts` | Tambah branch `merchant-base` (optional). |
| `packages/core/i18n/locales/id.ts` & `en.ts` | Tambah key merchant.*. |
| `App.tsx` (root) | Pilih merchant vs member entry. |

---

## 11. Hapus semua yang berhubungan dengan member di merchant

Setelah merchant app jalan, bersihkan **semua referensi dan kode member** di `apps/merchant-base/` agar tidak ada sisa layar, provider, atau konfigurasi konsumen.

### 11.1 Entry point: `index.tsx`

**Hapus import yang hanya untuk member:**

- `NotificationScreen` — boleh tetap jika merchant butuh notifikasi; kalau tidak, hapus.
- `NewsScreen`, `NewsDetailScreen` — hapus (berita untuk konsumen).
- `SearchScreen`, `SearchResultsScreen` dari `@plugins/marketplace` — hapus.
- `QrScreen` dari `@plugins/payment` — hapus (ini scan QR bayar; merchant pakai layar Terima Pembayaran).
- `PlaceholderScreen` — hapus atau tetap satu untuk placeholder route.
- `FnBCartProvider`, `FnBActiveOrderProvider`, `FnBLocationProvider` dari `@plugins/marketplace-fnb` — **hapus**.
- `MarketplaceOrderProvider` dari `@plugins/marketplace` — **hapus**.
- `getMenuIconForQuickAccess` (member) — ganti ke `getMenuIconForQuickAccessMerchant` atau fungsi icon merchant.
- `HomeScreen` — hapus jika pakai `MerchantHomeScreen` saja.

**Hapus dari `appScreens` (Stack.Screen):**

- `Notifications` — hapus kalau merchant tidak pakai; kalau pakai, tetap.
- `News`, `NewsDetail`, `Search`, `SearchResults` — **hapus**.
- `ScanQr` (konsumen bayar) — **hapus**.
- `RequestMoney`, `SplitBill`, `CardTopup`, `CardLimit` — **hapus**.
- `Reports` — bisa digabung ke satu layar TransactionHistory; hapus jika tidak dipakai.

**Hapus provider wrapper di JSX:**

- `<MarketplaceOrderProvider>`, `<FnBCartProvider>`, `<FnBLocationProvider>`, `<FnBActiveOrderProvider>` — **hapus** seluruh wrapper; di dalam langsung `AppNavigator` dan `Toast`.

### 11.2 Bootstrap: `bootstrap/plugins.ts`

**Jangan daftarkan plugin member:**

- Hapus import & register: `marketplace`, `marketplace-fnb`, `donasi-zakat`, `card-transaction`.
- Tetap hanya: `balance`, `payment`, `invoice` (dan nanti `catalog`, `order` bila ada).

### 11.3 Config: `config/app.config.ts`

**Hapus / jangan pakai konfigurasi member:**

- **homeTabs**: Hapus tab `fnb`, `beranda`, `news`, `analytics`, `marketplace`, `marketplace-general`, `marketplace-balance`, `marketplace-transaction`, `fnb-order`, `fnb-history`, `fnb-balance`, dan tab lain yang khusus member. Untuk merchant cukup satu tab `dashboard` (lihat [Bagian 3](#3-perubahan-konfigurasi-appconfig)).
- **quickAccessMenu**: Hapus item `topupva`, `transfermember`, `kartuvirtual`, `marketplace`, `fnb`, `donasizakat`, `sportcenter`. Ganti dengan item merchant (Terima Pembayaran, Transaksi, Invoice, Penarikan).
- **enabledModules**: Pastikan **tidak** ada `marketplace`, `marketplace-fnb`, `donasi-zakat`, `card-transaction`.
- **berandaWidgets**: Hapus widget yang hanya untuk member (mis. promo berita konsumen); untuk merchant cukup balance-card + quick-access.
- **menuConfig**: Hapus item yang mengarah ke layar member (Sport Center, Marketplace, FnB, Donasi, dll.). Hanya route yang ada di merchant (Home, TransactionHistory, Profile, Invoice, dll.).

### 11.4 File & folder di `src/` yang bisa dihapus (opsional)

Kalau pakai **MerchantHomeScreen** dan tidak pakai lagi tab Beranda/FnB/Berita:

| Path | Alasan hapus |
|------|----------------|
| `src/screens/NewsScreen.tsx` | Layar berita untuk konsumen. |
| `src/screens/NewsDetailScreen.tsx` | Detail berita untuk konsumen. |
| `src/components/home/TabContent/misc/NewsTab.tsx` | Tab berita. |
| `src/components/home/TabContent/beranda/BerandaTab.tsx` | Tab beranda member (widget saldo + quick access + berita). |
| `src/components/home/news/` (folder) | NewsItem, NewsItemSkeleton, dll. untuk berita. |
| `src/components/home/widgets/BerandaNewsInfo.tsx` | Widget berita di beranda. |
| `src/components/home/widgets/StoreNearby.tsx` | Toko terdekat (konsumen). |
| `src/components/home/widgets/ReferralBanner.tsx` | Referral konsumen. |
| `src/components/home/widgets/PromoBanner.tsx` | Bisa dipertahankan untuk promo merchant; kalau tidak dipakai, hapus. |
| `src/components/home/widgets/VoucherAvailable.tsx` | Voucher konsumen. |
| `src/components/home/widgets/RewardsPoints.tsx` | Rewards konsumen. |
| `src/components/home/stores/StoreCard.tsx` | Kartu toko (browsing konsumen). |
| `src/components/home/quick-actions/icons/IconFnB.tsx` | Icon FnB (konsumen). |
| `src/components/home/quick-actions/icons/IconTransferMember.tsx` | Transfer member. |
| `src/components/home/quick-actions/icons/IconKartuVirtual.tsx` | Kartu virtual. |
| `src/components/home/quick-actions/icons/IconTopUpVA.tsx` | Top up VA. |
| `src/components/home/quick-actions/icons/IconDonation.tsx`, `IconDonationBox.tsx` | Donasi. |
| `src/components/home/QrFab.tsx` | Bisa dipertahankan jika FAB dipakai untuk “Terima Pembayaran”; kalau tidak, hapus. |

**Tetap pertahankan (atau salin yang dipakai):**

- `TopBar.tsx` — header (notifikasi, menu) bisa dipakai merchant.
- `CustomToast.tsx` — toast global.
- `PlaceholderScreen.tsx` — untuk route yang belum ada layarnya.
- `ProfileScreen.tsx` — dari `@core/account` atau salinan; merchant tetap butuh Profil/Pengaturan.
- Hooks umum: `useTabSync`, `usePagerSync`, `useDoubleBackExit` — hanya perlu jika merchant masih pakai tab/swipe; kalau pakai MerchantHomeScreen saja, bisa hapus dependensi ke tab.
- `SecurityProviderWrapper.tsx`, `loadFonts.ts` — tetap dipakai.

### 11.5 Navigasi: jangan arahkan ke layar member

Di semua layar merchant (termasuk MerchantHomeScreen, Profil):

- Jangan ada `navigation.navigate('FnB')`, `navigation.navigate('Marketplace')`, `navigation.navigate('DonationHub')`, `navigation.navigate('VirtualCard')`, `navigation.navigate('TopUp')`, `navigation.navigate('TransferMember')`, `navigation.navigate('Qr')` (scan bayar), `navigation.navigate('News')`, `navigation.navigate('ScanQr')`.
- Hanya arahkan ke layar yang didaftar di merchant: `Home`, `TransactionHistory`, `ReceivePayment`, `Invoice`, `Profile`, `Settings`, `Account`, dll.

### 11.6 Icon quick menu (merchant)

- Buat file mis. `src/components/merchant/MerchantQuickMenuIcons.tsx` (atau di folder yang sama dengan MerchantHomeScreen) yang export `getMenuIconForQuickAccessMerchant`.
- Mapping hanya untuk id merchant: `receive-payment`, `transactions`, `invoice`, `withdraw`. Jangan include icon member (fnb, marketplace, topupva, transfermember, donasi, kartuvirtual).

### 11.7 Checklist bersihkan member

- [ ] `index.tsx`: hapus import & appScreens member; hapus provider FnB/Marketplace; ganti icon provider ke merchant.
- [ ] `bootstrap/plugins.ts`: hanya balance, payment, invoice.
- [ ] `config/app.config.ts`: homeTabs hanya dashboard; quickAccessMenu hanya item merchant; enabledModules tanpa marketplace, marketplace-fnb, donasi-zakat, card-transaction; menuConfig hanya route merchant.
- [ ] Hapus atau tidak copy file member-only di `src/` (News, NewsTab, BerandaTab, widget berita/referral/voucher/rewards, icon FnB/transfer/topup/donasi, StoreCard, dll.) sesuai [11.4](#114-file--folder-di-src-yang-bisa-dihapus-opsional).
- [ ] Cek seluruh `navigation.navigate(...)` di merchant: tidak ada yang ke layar member.
- [ ] Quick menu icon: hanya mapping merchant; tidak pakai getMenuIconForQuickAccess member.

Dengan ini, di merchant **tidak ada lagi** yang berhubungan dengan member: layar, plugin, config, provider, dan file yang khusus konsumen sudah dihapus atau dinonaktifkan.
