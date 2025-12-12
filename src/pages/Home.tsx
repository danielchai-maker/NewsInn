import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import NewsCard from "../components/Newscard";
import { useAuth } from "../context/AuthContext";
import SliderItem from "../components/SliderItem";

interface ApiNewsItem {
  title: string;
  snippet?: string;
  image?: string;
  link: string;
  date?: string;
  category?: string;
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
  category?: string;
  source: string;
}

const Home: React.FC = () => {
  const { source, category } = useParams();
  const { user } = useAuth();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
        category: item.category?.toLowerCase(),
        link: `/detail/${item.id}`,
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
          category: item.category?.toLowerCase(),
          content: "",
          source: src,
        }));

        allNews = [...allNews, ...mappedNews];
      } catch (err) {
        console.error(`Error fetching RSS for ${src}:`, err);
      }
    }

    // SORTING BERDASARKAN TANGGAL
    allNews.sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });

    setNews(allNews);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, [user]);

  const handleDeleteLocalSuccess = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Anda harus login untuk menghapus berita.");

    try {
      const res = await fetch(`http://localhost:5000/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (result.success) {
        setNews((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus berita.");
      }
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const filteredNews = useMemo(() => {
    let data = news;

    if (source) {
      data = data.filter(
        (item) => item.source.toLowerCase() === source.toLowerCase()
      );
    }

    if (category && category.toLowerCase() !== "all") {
      data = data.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    return data;
  }, [news, source, category]);

  const featuredNews = filteredNews.slice(0, 5);

  // AUTOPLAY SLIDER
  useEffect(() => {
    if (!featuredNews.length || source || category) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredNews.length, source, category]);

  if (loading) {
    return (
      <div className="text-center py-10 text-xl font-semibold animate-fadeIn">
        Memuat berita...
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full text-white dark:text-white">
      {!source && !category && featuredNews.length > 0 && (
        <div className="relative w-full h-[800px] md:h-[420px] lg:h-[500px] mb-16 overflow-hidden rounded-none">
          {featuredNews.map((item, index) => (
            <div
              key={item.id}
              className={`
                absolute inset-0 transition-all duration-700
                ${
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }
              `}
            >
              <SliderItem id={item.id} title={item.title} image={item.image} />
            </div>
          ))}

          {/* Buttons */}
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? featuredNews.length - 1 : prev - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg"
          >
            {"<"}
          </button>

          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % featuredNews.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg"
          >
            {">"}
          </button>

          {/* Dots */}
          <div className="absolute bottom-1 w-full flex justify-center gap-2">
            {featuredNews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`
                  h-3 rounded-full transition-all
                  ${currentSlide === i ? "bg-blue-600 w-8" : "bg-gray-300 w-3"}
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4 animate-slideUp px-4">
        {!source && !category
          ? "Semua Berita"
          : source
          ? `Berita ${source.toUpperCase()}`
          : `Kategori: ${category}`}
      </h2>

      {/* FULL WIDTH GRID */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 px-2 sm:px-4">
        <div
          className="
          w-full
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          xl:grid-cols-5
          gap-4
        "
        >
          {filteredNews.map((item, i) => (
            <div
              key={item.id}
              className="
              w-full
              transition-all duration-500
              transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl
              rounded-xl
            "
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <NewsCard
                {...item}
                fromBookmark={false}
                {...(item.source === "local"
                  ? { onDeleteSuccess: () => handleDeleteLocalSuccess(item.id) }
                  : {})}
              />
            </div>
          ))}
        </div>
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-10 text-gray-400 animate-fadeIn">
          Tidak ada berita.
        </div>
      )}
    </div>
  );
};

export default Home;
