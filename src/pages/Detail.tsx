import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
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
}

const Detail: React.FC = () => {
  const { id } = useParams<DetailParams>();
  const location = useLocation();
  const initialData = location.state as Partial<NewsItem> | undefined;

  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();
  const bookmarked = isBookmarked(id || "");

  const [news, setNews] = useState<NewsItem | null>(
    initialData
      ? {
          id: id!,
          title: initialData.title!,
          image:
            initialData.image?.trim() !== ""
              ? initialData.image!
              : "https://via.placeholder.com/800x400?text=No+Image",
          summary: initialData.summary ?? "",
          content: initialData.summary ?? "",
          category: initialData.category ?? "",
          link: initialData.link!,
          date: initialData.date,
        }
      : null
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/getByLink?url=${id}`
        );
        const data = await res.json();
        if (data.error) return console.error(data.error);

        setNews((prev) => ({
          id: id!,
          title: data.title,
          image:
            data.image?.trim() !== ""
              ? data.image
              : prev?.image ||
                "https://via.placeholder.com/800x400?text=No+Image",
          summary: data.summary ?? prev?.summary ?? "",
          content: data.content ?? data.summary ?? prev?.content ?? "",
          category: data.category ?? prev?.category ?? "",
          link: data.link,
          date: data.date,
        }));
      } catch (error) {
        console.error("Error fetch detail:", error);
      }
    };

    fetchDetail();
  }, [id]);

  if (!news) return <p className="text-center py-10">Memuat berita...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 text-sm hover:underline">
        ← Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold mt-4">{news.title}</h1>

      <button
        onClick={() =>
          bookmarked
            ? removeBookmark(id!)
            : addBookmark({
                id: id!,
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

      <p className="mt-6 leading-relaxed text-gray-700 whitespace-pre-line">
        {news.content}
      </p>

      <a
        href={news.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 underline text-blue-600 font-semibold"
      >
        Baca Selengkapnya di Sumber Asli
      </a>
    </div>
  );
};

export default Detail;
