import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewsCard from "../components/Newscard";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  category: string;
  content: string;
}

const Home: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 🔹 Ambil data berita dari backend
  useEffect(() => {
    const url = category
      ? `http://localhost:5000/api/news/category/${category}`
      : `http://localhost:5000/api/news`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat berita");
        return res.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  // 🔹 Slider otomatis (setiap 10 detik) — hanya aktif jika tidak di kategori
  useEffect(() => {
    if (category || news.length === 0) return; // ⛔ tidak aktif di halaman kategori

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(news.length, 5));
    }, 10000);
    return () => clearInterval(interval);
  }, [news, category]);

  // 🔹 Navigasi manual
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(news.length, 5));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.min(news.length, 5) - 1 : prev - 1
    );
  };

  // 🔹 Hapus berita
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`http://localhost:5000/api/news/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus berita");

      setNews((prev) => prev.filter((item) => item.id !== id));
      alert("✅ Berita berhasil dihapus");
    } catch {
      alert("❌ Terjadi kesalahan saat menghapus berita");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-center py-10">Memuat berita...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const featuredNews = news.slice(0, 5);
  const allNews = news;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 🧭 SLIDER hanya muncul jika tidak di halaman kategori */}
      {!category && featuredNews.length > 0 && (
        <div className="relative w-full h-96 mb-10 overflow-hidden rounded-2xl shadow-lg">
          {featuredNews.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-6">
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="text-sm mt-2 line-clamp-2">{item.summary}</p>
              </div>
            </div>
          ))}

          {/* Tombol navigasi */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
          >
            →
          </button>

          {/* Indikator titik */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {featuredNews.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-gray-400 hover:bg-gray-300"
                }`}
              ></span>
            ))}
          </div>
        </div>
      )}

      {/* 📰 SEMUA BERITA */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {category ? `Berita ${category}` : "Semua Berita"}
      </h2>
      <section className="grid gap-6 md:grid-cols-3">
        {allNews.length > 0 ? (
          allNews.map((item) => (
            <NewsCard
              key={item.id}
              {...item}
              onDelete={handleDelete}
              deleting={deletingId === item.id}
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-3 text-center">
            Tidak ada berita.
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
