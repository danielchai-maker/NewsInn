Berikut **dokumentasi lengkap (README.md)** untuk file `geminiAgent.ts` — siap kamu letakkan berdampingan dengan proyek RSS parser tadi agar terintegrasi dengan baik 👇

---

```markdown
# 🤖 Gemini Agent with Bun

Modul ini menggunakan **Google Gemini API (via @google/generative-ai)** untuk menghasilkan teks berdasarkan prompt yang diberikan.  
Didesain agar ringan, langsung bisa dijalankan di **Bun runtime**, dan mudah diintegrasikan dengan sistem kamu seperti bot, analitik, atau aplikasi Web3 backend.
```

jika kamu ingin memastikan semua dependensi terinstal:

```bash
npm install
```

---

## ⚙️ Konfigurasi

Sebelum menjalankan, buat file `.env` di root proyekmu dan isi dengan:

```bash
GEMINI_API_KEY=your-gemini-api-key
```

Lalu ubah sedikit kode agar lebih aman:

```ts
const API_KEY: string = process.env.GEMINI_API_KEY!;
```

> ❗ Jangan commit API key ke repository publik.

---

## ▶️ Menjalankan Script

Kamu bisa langsung menjalankan fungsi Gemini agent di file TypeScript kamu, misalnya:

```ts
import { geminiAgent } from './geminiAgent';

const run = async () => {
  const result = await geminiAgent('Tuliskan ringkasan berita hari ini tentang ekonomi Indonesia.');
  console.log('🧠 Gemini Output:\n', result);
};

run();
```

Lalu jalankan dengan Bun:

```bash
npm run server/index.ts
```

---

## 🧩 Contoh Output

```
🧠 Gemini Output:
Ekonomi Indonesia menunjukkan pertumbuhan stabil pada kuartal keempat 2025...
```

---

## 💡 Penjelasan Fungsi

```ts
export const geminiAgent = async (prompt: string)
```

| Parameter | Tipe     | Deskripsi                                                         |
| --------- | -------- | ----------------------------------------------------------------- |
| `prompt`  | `string` | Teks instruksi atau pertanyaan yang ingin dikirim ke model Gemini |

### 📤 Output

Mengembalikan `string` hasil teks dari Gemini API.

### ⚠️ Error Handling

Jika terjadi error (misalnya API key salah atau jaringan gagal), akan dilempar error dengan pesan:

```
Error calling Gemini API: ...
Failed to generate content from Gemini AI
```

---

## 🧠 Tips Integrasi

1. **Integrasi dengan RSS Parser**
   Kamu bisa gunakan Gemini untuk membuat ringkasan otomatis dari berita yang diambil:

   ```ts
   const news = await rssParser({ source: 'cnn' });
   const summary = await geminiAgent(
     `Buat ringkasan singkat dari berita berikut:\n${JSON.stringify(news.slice(0, 3))}`,
   );
   console.log(summary);
   ```

2. **Gunakan Model Lain**
   Ubah model dengan:

   ```ts
   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
   ```

3. **Multi-Part Prompt**
   Gemini juga bisa menerima input multimodal (teks + gambar), misalnya:

   ```ts
   const parts: Part[] = [
     { text: 'Apa isi gambar ini?' },
     { inlineData: { mimeType: 'image/png', data: base64Image } },
   ];
   ```

---
