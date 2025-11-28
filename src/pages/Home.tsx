import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import NewsCard from "../components/Newscard";
import { useAuth } from "../context/AuthContext";

interface ApiNewsItem {
  title: string;
  snippet?: string;
  image?: string;
  link: string;
  date?: string;
}

interface LocalNewsItem {
  id: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
  date: string;
}

interface NewsItem {
  id: string;
  title: string;
  image: string;
  summary?: string;
  content?: string;
  link?: string;
  date?: string;
  source: string; // cnn / tempo / local
}

const Home: React.FC = () => {
  const { source } = useParams();
  const { user } = useAuth();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // FETCH NEWS (LOCAL + RSS)
  const loadNews = async () => {
    setLoading(true);
    let allNews: NewsItem[] = [];

    // LOCAL NEWS
    try {
      const res = await fetch("http://localhost:5000/api/news");
      const localData: LocalNewsItem[] = await res.json();

      const mappedLocal = localData.map((item) => ({
        id: String(item.id),
        title: item.title,
        image: item.image?.trim() || "/no-image.png",
        summary: item.summary,
        content: item.content,
        date: item.date,
        source: "local",
      }));

      allNews = [...allNews, ...mappedLocal];
    } catch (err) {
      console.error("Error loading local news:", err);
    }

    // RSS NEWS
    const rssSources = ["cnn", "tempo"];

    for (const src of rssSources) {
      try {
        const res = await fetch(`http://localhost:5000/api/rss/${src}`);
        const data: ApiNewsItem[] = await res.json();

        const mappedNews = data.map((item) => ({
          id: item.link,
          title: item.title,
          image: item.image?.trim() || "/no-image.png",
          summary: item.snippet || "",
          link: item.link,
          date: item.date,
          source: src,
        }));

        allNews = [...allNews, ...mappedNews];
      } catch (err) {
        console.error(`Error fetching RSS for ${src}:`, err);
      }
    }

    // SORT
    allNews.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    setNews(allNews);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, [user]);

  // DELETE LOCAL NEWS (frontend triggers server DELETE here)
  const handleDeleteLocalSuccess = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk menghapus berita.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/news/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log("DELETE RESPONSE:", result);

      if (result.success) {
        // update UI immediate
        setNews((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(result.message || "Gagal menghapus berita.");
      }
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Gagal menghapus berita (network/error).");
    }
  };

  // FILTER
  const filteredNews = useMemo(() => {
    if (!source) return news;
    return news.filter(
      (item) => item.source.toLowerCase() === source.toLowerCase()
    );
  }, [news, source]);

  // SLIDER
  const featuredNews = filteredNews.slice(0, 5);

  useEffect(() => {
    if (!featuredNews.length || source) return;

    setCurrentSlide(0);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredNews.length, source]);

  // LOADING
  if (loading) {
    return (
      <div className="text-center py-10 text-xl font-semibold text-white">
        Memuat berita...
      </div>
    );
  }

  // RENDER
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-white dark:text-white">
      {/* SLIDER */}
      {!source && featuredNews.length > 0 && (
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
              <div className="absolute bottom-0 w-full bg-black bg-opacity-50 p-4 text-xl font-bold">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-4">
        {!source
          ? "Semua Berita"
          : source.toUpperCase() === "CNN"
          ? "Berita CNN Indonesia"
          : source.toUpperCase() === "TEMPO"
          ? "Berita Tempo.co"
          : "Berita Lokal"}
      </h2>

      {/* LIST NEWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => (
          <NewsCard
            key={item.id}
            {...item}
            fromBookmark={false}
            {...(item.source === "local"
              ? { onDeleteSuccess: () => handleDeleteLocalSuccess(item.id) }
              : {})}
          />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-10 text-gray-400">Tidak ada berita.</div>
      )}
    </div>
  );
};

export default Home;
