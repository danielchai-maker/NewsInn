import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/news/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Berita tidak ditemukan");
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
  }, [id]);

  if (loading)
    return <p className="text-center py-10">Memuat detail berita...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!news) return <p>Berita tidak ditemukan.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 text-sm hover:underline">
        ← Kembali
      </Link>
      <h1 className="text-3xl font-bold mt-4">{news.title}</h1>
      <p className="text-gray-500 mt-2">
        Kategori: {news.category} — Dipublikasikan pada{" "}
        {new Date().toLocaleDateString()}
      </p>
      <img
        src={news.image}
        alt={news.title}
        className="rounded-lg mt-6 shadow-md"
      />
      <p className="mt-6 leading-relaxed text-gray-700">{news.content}</p>

      {/* Navigasi ke berita sebelumnya & berikutnya */}
      <div className="flex justify-between mt-10">
        <Link
          to={`/detail/${Number(id) - 1}`}
          className="text-blue-600 hover:underline disabled:text-gray-400"
        >
          ← Sebelumnya
        </Link>
        <Link
          to={`/detail/${Number(id) + 1}`}
          className="text-blue-600 hover:underline disabled:text-gray-400"
        >
          Berikutnya →
        </Link>
      </div>
    </div>
  );
};

export default Detail;
