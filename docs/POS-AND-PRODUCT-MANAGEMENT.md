# POS & Manajemen Produk — FnB & Marketplace

Dokumen ini mendeskripsikan kebutuhan **Point of Sale (POS)** dan **Manajemen Produk** untuk sisi **merchant** pada FnB dan Marketplace, serta hubungannya dengan plugin dan backend yang ada.

---

## 1. Ringkasan

| Aspek | FnB | Marketplace |
|-------|-----|-------------|
| **POS** | Kasir di toko/resto: input pesanan (dine-in/take away), pilih menu, variant/addon, hitung total, terima pembayaran (QR/tunai), cetak/antar ke dapur. | Kasir/order masuk: lihat pesanan dari channel (app/website), konfirmasi, proses pembayaran, pack & ship. |
| **Manajemen Produk** | Menu (item), kategori, variant (size), addon, jam operasional, pengaturan delivery. Satu “toko” = satu merchant FnB. | Katalog toko: produk, kategori, stok (opsional), harga; multi-toko per merchant (opsional). |
| **Plugin terkait (consumer)** | `marketplace-fnb` | `marketplace` |
| **Plugin yang dibutuhkan (merchant)** | Catalog (menu/toko) + Order (pesanan masuk) + Payment (terima bayar). | Catalog (produk/toko) + Order (pesanan masuk) + Payment. |

---

## 2. POS (Point of Sale)

### 2.1 Definisi

**POS** = tempat merchant menerima order, menginput/konfirmasi item, menerima pembayaran, dan mengeluarkan bukti (struk/nota) atau mengirim order ke dapur/warehouse.

### 2.2 POS FnB

**Skenario:**

- **Dine-in**: Pelanggan scan QR meja → order dari app → merchant terima di POS (tablet/HP), konfirmasi, terima bayar (QR/balance), kirim ke dapur, status “sedang dibuat” → “siap”.
- **Take away**: Pelanggan order dari app (take away) → merchant lihat di POS, konfirmasi, terima bayar, notifikasi “siap diambil”.
- **Delivery**: Mirip take away; merchant input/konfirmasi alamat, assign driver (jika ada), lacak sampai selesai.

**Fitur POS FnB:**

| Fitur | Keterangan |
|-------|------------|
| Daftar order masuk | List order baru (per toko), filter status: menunggu konfirmasi / diproses / siap diambil / selesai. |
| Detail order | Item, variant, addon, catatan, meja (dine-in), alamat (delivery). |
| Konfirmasi / Tolak | Terima order → status “diproses”; tolak dengan alasan (opsional). |
| Terima pembayaran | Link ke terima bayar (QR merchant, VA, link bayar) atau tandai “dibayar di kasir” (tunai). |
| Update status | Menunggu → Diproses → Siap diambil / Diantar → Selesai. |
| Notifikasi | Order baru, pembayaran masuk (push/in-app). |
| Laporan singkat | Transaksi hari ini, order per status (opsional di fase awal). |

**Alur (high-level):**

```
[Customer order di app] → [Backend simpan order]
       → [Merchant POS: list order baru]
       → [Merchant konfirmasi] → [Customer bayar]
       → [Merchant update status: diproses → siap/selesai]
```

**Data yang sudah ada (consumer):**

- Model: `FnBOrder`, `FnBOrderItem`, `FnBStore`, `FnBItem`, `FnBVariant`, `FnBAddon`, `OrderStatus`, `OrderType` (dine-in / take away / delivery).
- Plugin `marketplace-fnb` sudah punya layar: FnBOrderStatus, FnBOrderTracking, FnBOrderHistory (sisi customer). Sisi merchant = **belum ada**; yang dibutuhkan: layar POS merchant (list order, detail, konfirmasi, update status).

### 2.3 POS Marketplace

**Skenario:**

- Pelanggan belanja di app (marketplace) → checkout → order masuk ke backend.
- Merchant lihat order di “POS” / dashboard merchant: daftar pesanan, detail (produk, qty, alamat pengiriman), konfirmasi, pilih kurir, input resi, tandai “dikirim” / “selesai”.

**Fitur POS Marketplace:**

| Fitur | Keterangan |
|-------|------------|
| Daftar order masuk | Per toko; filter status: menunggu bayar / dibayar / dipacking / dikirim / selesai. |
| Detail order | Produk, qty, harga, alamat, metode pengiriman. |
| Konfirmasi pembayaran | Tandai “dibayar” (jika bayar di tempat) atau otomatis dari payment gateway. |
| Update status | Dibayar → Dipacking → Dikirim (input no resi) → Selesai. |
| Notifikasi | Order baru, pembayaran. |

**Alur:**

```
[Customer checkout] → [Order + payment]
       → [Merchant: list order] → [Konfirmasi / packing]
       → [Input resi, status “dikirim”] → [Selesai]
```

**Plugin `marketplace`** punya `MarketplaceOrderDetailScreen` (consumer). Sisi merchant: daftar order toko + aksi konfirmasi/update status = **belum ada**; bisa ditambah di plugin yang sama atau plugin `order`.

---

## 3. Manajemen Produk

### 3.1 Siapa yang mengelola

- **Merchant** (pemilik toko/resto) mengelola:
  - **FnB**: data toko (nama, alamat, jam buka, delivery), **menu** (item, kategori, variant, addon), ketersediaan (isAvailable).
  - **Marketplace**: data **toko** (nama, alamat), **produk** (nama, deskripsi, harga, gambar, kategori, stok opsional).

Akses hanya untuk akun merchant (role `merchant`) atau staff toko yang diotorisasi.

### 3.2 Model & entitas yang relevan

**FnB (sudah ada di consumer):**

| Entitas | File / plugin | Keterangan |
|---------|----------------|------------|
| FnBStore | `marketplace-fnb/models/FnBStore.ts` | id, name, address, operatingHours, delivery, orderTypes. |
| FnBItem | `marketplace-fnb/models/FnBItem.ts` | id, name, price, category, imageUrl, variants, addons, isAvailable, preparationTime. |
| FnBVariant / FnBAddon | Di FnBItem | Size, topping, dll. |
| FnBCategory | Dipakai di UI | Kategori menu (Makanan, Minuman, dll). |

**Marketplace (consumer):**

| Entitas | Keterangan |
|---------|------------|
| Product | `ProductCard.tsx` (interface Product): id, name, price, image, category, storeId, dll. |
| Store | Toko punya daftar produk; route StoreDetail, StoreProductSearch. |

Backend harus menyediakan API CRUD untuk:

- **FnB merchant**: Store (update profile, jam buka, delivery), Categories, Items (create/update/delete, variant, addon), availability.
- **Marketplace merchant**: Store (create/update), Products (CRUD, kategori, stok), Categories.

### 3.3 Plugin Catalog

Di monorepo ini, **plugin `catalog`** belum ada di `packages/plugins/`; hanya dirujuk di:

- `apps/member-base/tools/app-manager/plugins.json` (label: "Product/catalog management").
- `packages/plugins/order/plugin.manifest.json` (dependency: `catalog`).

**Rekomendasi:**

- **Catalog** = satu plugin (atau dua: `catalog-fnb` & `catalog-marketplace` jika ingin pisah ketat) yang menyediakan:
  - **Service/API layer**: panggilan ke backend untuk CRUD toko, kategori, menu/produk.
  - **Model/types**: dipakai FnB & Marketplace (bisa share atau extend per segment).
  - **Screens (merchant)**:
    - FnB: Kelola Toko, Kelola Kategori Menu, Kelola Menu (item + variant + addon), Jam Operasional, Pengaturan Delivery.
    - Marketplace: Kelola Toko, Kelola Kategori, Kelola Produk (nama, harga, gambar, stok).
  - **Manifest**: `plugin.manifest.json` dengan `routes` untuk layar merchant tersebut; permission mis. `catalog:manage`, `catalog:read`.

- **Order plugin** (sudah ada, routes kosong) bisa diisi dengan:
  - Layar **POS FnB**: List order toko, detail order, konfirmasi, update status (bergantung data order dari backend).
  - Layar **POS Marketplace**: List order toko, detail, konfirmasi, input resi, update status.

Order plugin tetap depend on `catalog` (untuk nama produk/menu saat tampil di order).

### 3.4 Fitur Manajemen Produk — FnB

| Fitur | Deskripsi |
|-------|-----------|
| Profil toko | Nama, alamat, foto, deskripsi; jam operasional per hari; tutup libur. |
| Pengaturan delivery | Aktif/nonaktif, radius (km), ongkir, minimal order gratis ongkir. |
| Kategori menu | CRUD kategori (Makanan, Minuman, Snack, dll); urutan tampil. |
| Menu (item) | CRUD item: nama, deskripsi, harga, foto, kategori, waktu penyajian (menit), ketersediaan (isAvailable). |
| Variant | Per item: mis. Ukuran (S/M/L), harga per variant. |
| Addon | Per item: topping/opsi tambahan, harga per addon. |
| QR toko/meja | Generate/tampil QR untuk closepay://fnb/{storeId} atau closepay://fnb/{storeId}/table/{no}. |

### 3.5 Fitur Manajemen Produk — Marketplace

| Fitur | Deskripsi |
|-------|-----------|
| Profil toko | Nama, alamat, logo, deskripsi. |
| Kategori produk | CRUD kategori toko (atau pakai kategori global). |
| Produk | CRUD: nama, deskripsi, harga, gambar (multi), kategori, stok (opsional), status aktif/nonaktif. |
| Bulk edit | Upload CSV / edit banyak (opsional fase lanjut). |

---

## 4. Backend & integrasi

- **Auth**: User dengan role `merchant` (atau staff toko); token dipakai untuk semua API merchant.
- **API yang dibutuhkan (ringkas)**:
  - **Catalog**:  
    - FnB: `GET/PUT store`, `GET/POST/PUT/DELETE categories`, `GET/POST/PUT/DELETE menu/items` (dengan variant/addon).  
    - Marketplace: `GET/PUT store`, `GET/POST/PUT/DELETE products`, `GET/POST/PUT/DELETE categories`.
  - **Order**:  
    - FnB: `GET orders?storeId=...&status=...`, `GET order/:id`, `PATCH order/:id` (status, dll).  
    - Marketplace: `GET orders?storeId=...`, `GET order/:id`, `PATCH order/:id` (status, resi).
  - **Payment**: Terima pembayaran (QR merchant, callback notifikasi) sudah di ranah payment; POS hanya menampilkan “sudah dibayar” dan status order.
- **Notifikasi**: Order baru & pembayaran masuk ke app merchant (push/in-app) agar POS bisa real-time atau on refresh.

---

## 5. Ringkasan aksi (untuk tim)

1. **Backend**: Sediakan API catalog (toko, kategori, menu/produk) dan order (list/detail/update status) untuk merchant; auth per merchant/store.
2. **Plugin catalog**: Tambah plugin `catalog` (atau catalog-fnb + catalog-marketplace) di `packages/plugins/`, dengan layar manajemen toko & produk/menu; daftar di bootstrap app merchant.
3. **Plugin order**: Isi routes dengan layar POS: list order, detail, konfirmasi, update status (FnB + Marketplace); depend on `catalog` dan payment.
4. **App merchant**: Aktifkan module `catalog` dan `order` di config; navigasi ke layar POS dan Kelola Produk/Menu dari dashboard merchant.

Dokumen ini bisa dipakai sebagai acuan spesifikasi dan breakdown task (backend, catalog plugin, order plugin, app merchant).
