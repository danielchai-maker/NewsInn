export interface TempoResponse {
  items: ItemTempo[];
  title: string;
  description: string;
  link: string;
  language: string;
}

export interface ItemTempo {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  isoDate: string;

  // 🔹 Tambahan properti dari customFields agar TypeScript mengenali
  "content:encoded"?: string; // bentuk mentah dari RSS
  contentEncoded?: string; // hasil mapping dari rss-parser
  "content:encodedSnippet"?: string;
  contentEncodedSnippet?: string;
  enclosure?: { url?: string }; // kalau suatu saat Tempo juga kirim gambar
}
