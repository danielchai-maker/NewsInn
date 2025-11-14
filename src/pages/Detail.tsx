import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
  link: string;
  date?: string;
}

const Detail: React.FC = () => {
  const { id, category } = useParams<{ id: string; category?: string }>();

  const [news, setNews] = useState<NewsItem | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [related, setRelated] = useState<string[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!id) return;

    const source = category === "cnn" ? "cnn" : "tempo";

    fetch(`http://localhost:5000/api/rss/${source}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any, index: number) => ({
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

        setNewsList(mapped);

        const found = mapped.find((i: NewsItem) => i.id === Number(id));
        setNews(found || null);

        if (found) fetchRelated(found.title);
      });
  }, [id, category]);

  const fetchRelated = async (title: string) => {
    setLoadingRelated(true);
    try {
      const res = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      setRelated(data.recommendations || []); // array string
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRelated(false);
    }
  };

  if (!news) return <p className="text-center py-10">Memuat berita...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 text-sm hover:underline">
        ← Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold mt-4">{news.title}</h1>
      <p className="text-gray-500 mt-1">
        {news.category} —{" "}
        {news.date ? new Date(news.date).toLocaleDateString("id-ID") : ""}
      </p>

      <img
        src={news.image}
        alt={news.title}
        className="rounded-lg mt-6 shadow-md w-full"
      />

      <p className="mt-6 leading-relaxed text-gray-700 whitespace-pre-line">
        {news.content}
      </p>

      {/* Rekomendasi AI */}
      <h2 className="text-2xl font-semibold mt-12 mb-4">Berita Serupa</h2>

      {loadingRelated ? (
        <p className="text-gray-500">AI sedang menganalisis judul...</p>
      ) : related.length > 0 ? (
        <ul className="space-y-3">
          {related.map((text, idx) => (
            <li
              key={idx}
              className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 cursor-pointer transition"
            >
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Tidak ada rekomendasi berita serupa</p>
      )}
    </div>
  );
};

export default Detail;
