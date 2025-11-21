import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import NewsCard from "../components/Newscard";

interface ApiNewsItem {
  title: string;
  snippet?: string;
  image?: string;
  link: string;
  date?: string;
}

interface NewsItem {
  id: string;
  title: string;
  image: string;
  summary?: string;
  content?: string;
  link: string;
  date?: string;
  source: string; // CNN / TEMPO
}

const Home: React.FC = () => {
  const { source } = useParams(); // 🔥 menangkap /source/cnn
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ============================================
  // FETCH NEWS FROM BOTH SOURCES
  // ============================================
  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      const sources = ["cnn", "tempo"];
      let allNews: NewsItem[] = [];

      for (const src of sources) {
        try {
          const res = await fetch(`http://localhost:5000/api/rss/${src}`);
          const data: ApiNewsItem[] = await res.json();

          const mappedNews = data.map((item) => ({
            id: item.link,
            title: item.title,
            image:
              item.image && item.image.trim() !== ""
                ? item.image
                : "https://via.placeholder.com/600x400?text=No+Image",
            summary: item.snippet || "",
            link: item.link,
            date: item.date,
            source: src, // simpan asal sumber
          }));

          allNews = [...allNews, ...mappedNews];
        } catch (err) {
          console.error(`Error fetching from ${src}`, err);
        }
      }

      // Sort dari terbaru → lama
      allNews.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setNews(allNews);
      setLoading(false);
    };

    fetchAllNews();
  }, []);

  // ============================================
  // FILTER BY SOURCE (CNN / TEMPO)
  // ============================================
  const filteredNews = useMemo(() => {
    if (!source) return news; // halaman Home → semua berita

    return news.filter(
      (item) => item.source.toLowerCase() === source.toLowerCase()
    );
  }, [source, news]);

  // ============================================
  // SLIDER (only show on HOME)
  // ============================================
  const featuredNews = filteredNews.slice(0, 5);

  useEffect(() => {
    if (!featuredNews.length || source) return; // jangan tampilkan slider di halaman /source/...

    setCurrentSlide(0);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredNews.length, source]);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="text-center py-10 text-xl font-semibold">
        Memuat berita...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:text-white">
      {/* =============================== */}
      {/* SLIDER — Only for Home */}
      {/* =============================== */}
      {!source && featuredNews.length > 0 && (
        <div className="relative w-full h-96 mb-10 overflow-hidden rounded-2xl shadow-lg">
          {featuredNews.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-50 p-4 text-white text-xl font-bold">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4">
        {!source
          ? "Semua Berita"
          : source.toUpperCase() === "CNN"
          ? "Berita CNN Indonesia"
          : "Berita Tempo.co"}
      </h2>

      {/* GRID NEWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Tidak ada berita untuk sumber ini.
        </div>
      )}
    </div>
  );
};

export default Home;
