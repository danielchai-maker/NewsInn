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

const Detail: React.FC = () => {
  const { id } = useParams<DetailParams>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = (location.state as Partial<NewsItem>) || null;

  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();
  const bookmarked = isBookmarked(id || "");

  const [recommendations, setRecommendations] = useState<string[]>([]);
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

  // 🔍 DEBUG — Log semua data penting
  console.log("----- DETAIL DEBUG -----");
  console.log("URL id:", id);
  console.log("Initial Data from state:", initialData);
  console.log("Final news.id:", news?.id);
  console.log("news.isLocal:", news?.isLocal);
  console.log("Bookmarked:", bookmarked);
  console.log("-------------------------");

  // ======================================================
  // FETCH DETAIL RSS (hanya jika bukan local news)
  // ======================================================
  useEffect(() => {
    if (initialData) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/getByLink?url=${encodeURIComponent(id!)}`
        );

        const data = await res.json();
        if (data.error) return;

        setNews((prev) => ({
          id: id!,
          title: data.title ?? prev?.title ?? "",
          image: data.image?.trim()
            ? data.image
            : prev?.image ??
              "https://via.placeholder.com/800x400?text=No+Image",
          summary: data.summary ?? prev?.summary ?? "",
          content: data.content ?? data.summary ?? prev?.content ?? "",
          category: data.category ?? prev?.category ?? "",
          link: data.link ?? prev?.link ?? "",
          date: data.date ?? prev?.date,
          isLocal: false,
          source: prev?.source,
        }));
      } catch {
        console.error("Gagal fetch detail RSS");
      }
    };

    fetchDetail();
  }, [id]);

  // ======================================================
  // FETCH AI RECOMMENDATION
  // ======================================================
  useEffect(() => {
    if (!news?.title) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: news.title }),
        });

        const data = await res.json();
        if (data.recommendations) setRecommendations(data.recommendations);
      } catch (error) {
        console.error("Error AI recommendation:", error);
      }
    };

    fetchRecommendations();
  }, [news?.title]);

  // ======================================================
  // DELETE LOCAL NEWS
  // ======================================================
  const handleDelete = async () => {
    if (!news?.isLocal) {
      alert("Hanya berita lokal yang bisa dihapus.");
      return;
    }

    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;

    try {
      const realId = String(news.id);
      const token = localStorage.getItem("token");

      console.log("📌 FE DELETE TOKEN:", token); // DEBUG

      const res = await fetch(
        `http://localhost:5000/api/news/${encodeURIComponent(realId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("DELETE RESPONSE:", data);

      if (!res.ok) {
        alert("Gagal menghapus berita: " + data.message);
        return;
      }

      alert("Berita berhasil dihapus!");
      navigate("/");
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  if (!news) return <p className="text-center py-10">Memuat berita...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/"
        className="text-black dark:text-white text-sm hover:underline"
      >
        ← Kembali ke Beranda
      </Link>

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {news.title}
        </h1>

        {news.isLocal && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600 rounded text-black dark:text-white text-sm flex gap-2 items-center hover:bg-red-700 transition"
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

      <img
        src={news.image}
        alt={news.title}
        className="rounded-lg mt-6 w-full shadow-md"
      />

      <p className="mt-6 leading-relaxed text-black dark:text-white whitespace-pre-line">
        {news.content}
      </p>

      {news.link && (
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 underline text-black dark:text-white font-semibold"
        >
          Baca Selengkapnya di Sumber Asli
        </a>
      )}

      {recommendations.length > 0 && (
        <div className="mt-10 bg-white dark:bg-gray-800 p-5 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-black dark:text-white">
            Rekomendasi Berita Lain
          </h2>
          <ul className="list-disc ml-5 text-black dark:text-white">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Detail;
