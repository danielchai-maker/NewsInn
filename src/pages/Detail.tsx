import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark, FaTrash } from "react-icons/fa";
import { useBookmark } from "../context/BookmarkContext";

type DetailParams = { id: string };

interface NewsItem {
  id: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
  link: string;
  date?: string;
  source?: string;
  isLocal?: boolean;
}

interface RecItem {
  title: string;
  url: string;
}

const Detail: React.FC = () => {
  const { id } = useParams<DetailParams>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = (location.state as Partial<NewsItem>) || null;

  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();
  const bookmarked = isBookmarked(id || "");

  const [recommendations, setRecommendations] = useState<RecItem[]>([]);

  const [news, setNews] = useState<NewsItem | null>(
    initialData
      ? {
          id: initialData.id ?? id!,
          title: initialData.title ?? "",
          image: initialData.image?.trim()
            ? initialData.image
            : "https://via.placeholder.com/800x400?text=No+Image",
          summary: initialData.summary ?? "",
          content: initialData.content ?? initialData.summary ?? "",
          category: initialData.category ?? "",
          link: initialData.link ?? "",
          date: initialData.date,
          source: initialData.source,
          isLocal: initialData.isLocal,
        }
      : null
  );

  // ===========================
  // FETCH DETAIL RSS ARTICLES
  // ===========================
  useEffect(() => {
    if (initialData) return;

    const loadDetail = async () => {
      try {
        const url = `http://localhost:5001/api/getByLink?url=${encodeURIComponent(
          id!
        )}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data || data.error) return;

        setNews({
          id: id!,
          title: data.title ?? "",
          image: data.image?.trim()
            ? data.image
            : "https://via.placeholder.com/800x400?text=No+Image",
          summary: data.summary ?? "",
          content: data.content ?? data.summary ?? "",
          category: data.category ?? "",
          link: data.link ?? id!,
          date: data.date,
          isLocal: false,
          source: data.source,
        });
      } catch (err) {
        console.error("❌ Gagal fetch detail RSS:", err);
      }
    };

    loadDetail();
  }, [id, initialData]);

  // ========================================
  // FETCH AI RECOMMENDATION
  // ========================================
  useEffect(() => {
    if (!news?.title) return;

    const fetchRec = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: news.title }),
        });

        const data = await res.json();

        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations.slice(0, 3));
        }
      } catch (err) {
        console.error("Error AI recommendation:", err);
      }
    };

    fetchRec();
  }, [news?.title]);

  // ===========================
  // DELETE LOCAL NEWS
  // ===========================
  const handleDelete = async () => {
    if (!news?.isLocal) {
      alert("Hanya berita lokal yang bisa dihapus.");
      return;
    }

    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/news/${encodeURIComponent(news.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Gagal menghapus: " + data.message);
        return;
      }

      alert("Berita berhasil dihapus!");
      navigate("/");
    } catch {
      alert("Terjadi kesalahan saat menghapus berita.");
    }
  };

  if (!news)
    return (
      <p className="text-center py-10 text-black dark:text-white">
        Memuat berita...
      </p>
    );

  const isCNN = news.link?.includes("cnnindonesia.com");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/"
        className="text-black dark:text-white text-sm hover:underline"
      >
        ← Kembali
      </Link>

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {news.title}
        </h1>

        {news.isLocal && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded flex gap-2 items-center hover:bg-red-700"
          >
            <FaTrash />
            Hapus
          </button>
        )}
      </div>

      <button
        onClick={() =>
          bookmarked
            ? removeBookmark(news.id)
            : addBookmark({
                id: news.id,
                title: news.title,
                image: news.image,
                summary: news.summary,
                category: news.category,
                link: news.link,
                date: news.date,
              })
        }
        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center gap-2"
      >
        {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
        {bookmarked ? "Hapus Bookmark" : "Simpan Bookmark"}
      </button>

      {/* CNN VIDEO MODE */}
      {isCNN ? (
        <div className="w-full h-[420px] mt-6 rounded-lg overflow-hidden shadow-md">
          <iframe
            src={news.link}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
            style={{ border: "none" }}
          ></iframe>
        </div>
      ) : (
        <img
          src={news.image}
          alt={news.title}
          className="rounded-lg mt-6 w-full shadow-md"
        />
      )}

      <p className="mt-6 leading-relaxed text-black dark:text-white whitespace-pre-line">
        {news.content}
      </p>

      {news.link && (
        <a
          href={news.link}
          target="_blank"
          className="inline-block mt-6 underline text-black dark:text-white font-semibold"
        >
          Baca Selengkapnya di Sumber Asli
        </a>
      )}

      {/* AI RECOMMENDATION */}
      {recommendations.length > 0 && (
        <div className="mt-10 bg-white dark:bg-gray-800 p-5 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-black dark:text-white">
            Rekomendasi Berita Lain
          </h2>

          <ul className="list-disc ml-5 text-black dark:text-white">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="my-2">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    rec.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-400"
                >
                  🔍 {rec.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Detail;
