import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  content?: string;
  category: string;
  link: string;
  date?: string;
}

const Detail: React.FC = () => {
  const { id, category } = useParams<{ id: string; category?: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Gunakan sumber sesuai kategori di URL, default = tempo
    const source = category === "cnn" ? "cnn" : "tempo";
    const url = `http://localhost:5000/api/rss/${source}`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat berita");
        return res.json();
      })
      .then((data) => {
        const mappedNews = data.map((item: any, index: number) => ({
          id: index,
          title: item.title,
          image:
            item.image && item.image.trim() !== ""
              ? item.image
              : "https://via.placeholder.com/800x400?text=No+Image",
          summary: item.snippet || "",
          content: item.content || item.snippet || "",
          link: item.link,
          category: source.toUpperCase(),
          date: item.date,
        }));

        // Cari berita dengan id sesuai params
        const foundNews = mappedNews.find(
          (item: NewsItem) => item.id === Number(id)
        );
        if (!foundNews) throw new Error("Berita tidak ditemukan");

        setNews(foundNews);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, category]);

  if (loading)
    return <p className="text-center py-10">Memuat detail berita...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!news) return <p>Berita tidak ditemukan.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 text-sm hover:underline">
        ← Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold mt-4">{news.title}</h1>
      <p className="text-gray-500 mt-2">
        Kategori: {news.category} —{" "}
        {news.date
          ? new Date(news.date).toLocaleDateString("id-ID")
          : new Date().toLocaleDateString("id-ID")}
      </p>

      <img
        src={news.image}
        alt={news.title}
        className="rounded-lg mt-6 shadow-md w-full"
      />

      <p className="mt-6 leading-relaxed text-gray-700 whitespace-pre-line">
        {news.content}
      </p>

      {/* Navigasi ke berita sebelumnya & berikutnya */}
      <div className="flex justify-between mt-10">
        <Link
          to={`/detail/${Number(id) - 1}/${category || "tempo"}`}
          className={`${
            Number(id) === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:underline"
          }`}
        >
          ← Sebelumnya
        </Link>
        <Link
          to={`/detail/${Number(id) + 1}/${category || "tempo"}`}
          className="text-blue-600 hover:underline"
        >
          Berikutnya →
        </Link>
      </div>
    </div>
  );
};

export default Detail;
