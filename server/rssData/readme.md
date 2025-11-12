Berikut versi markdown-nya siap pakai sebagai **`README.md`** 👇

---

````markdown
# 📰 RSS Parser with Bun

Proyek ini menggunakan [`rss-parser`](https://www.npmjs.com/package/rss-parser) untuk mengambil dan membaca RSS feed dari berbagai sumber berita seperti **Tempo** dan **CNN Indonesia**.  
Kode ditulis dengan **TypeScript** dan dijalankan menggunakan runtime **[Bun](https://bun.sh)**.

---

## 📦 Persyaratan

Pastikan kamu sudah menginstal **Bun** di sistemmu.

### Instal Bun

Jika belum terpasang:

```bash
curl -fsSL https://bun.sh/install | bash
```
````

Lalu pastikan berhasil:

```bash
bun --version
```

---

## 🚀 Instalasi Proyek

Clone repositori ini (atau salin file-nya) lalu jalankan perintah:

```bash
bun install
```

## ▶️ Menjalankan Script

### Jalankan langsung dengan Bun

Kamu bisa langsung menjalankan file TypeScript tanpa build:

```bash
bun run rssData/index.ts
```

Atau jika file kamu bernama lain (misalnya `rssParser.ts`):

```bash
bun run rssData/rssParser.ts
```

---

## 🧩 Output Contoh

Setelah dijalankan, Bun akan menampilkan log seperti ini di terminal:

```
┌─────────┬───────────────────────────────┬──────────────┬────────────────────────────────────────┐
│ (index) │            title              │     date     │                  link                   │
├─────────┼───────────────────────────────┼──────────────┼────────────────────────────────────────┤
│    0    │ 'Jokowi Buka Konferensi XYZ' │ 'Wed, 12 Nov 2025 09:30:00 +0700' │ 'https://www.cnnindon...' │
│    1    │ 'IHSG Dibuka Naik 0.3%'      │ 'Wed, 12 Nov 2025 08:00:00 +0700' │ 'https://www.cnnindon...' │
│    2    │ 'Cuaca Hari Ini Cerah'       │ 'Wed, 12 Nov 2025 07:45:00 +0700' │ 'https://www.cnnindon...' │
└─────────┴───────────────────────────────┴──────────────┴────────────────────────────────────────┘
```

---

## ⚙️ Cara pakai di controller atau di file index.ts

```ts
const rssData = await rssParser({ source: 'tempo' });
```
