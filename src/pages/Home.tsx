import { useEffect, useState } from "react";
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
  category?: string;
  content?: string;
  link: string;
  date?: string;
}

const Home: React.FC = () => {
  const { category } = useParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchAllNews = async () => {
      const sources = ["cnn", "tempo"];
      let allNews: NewsItem[] = [];

      for (const source of sources) {
        try {
          const res = await fetch(`http://localhost:5000/api/rss/${source}`);
          const data = await res.json();

          const mappedNews = (data as ApiNewsItem[]).map((item) => ({
            id: item.link,
            title: item.title,
            image:
              item.image && item.image.trim() !== ""
                ? item.image
                : "https://via.placeholder.com/600x400?text=No+Image",
            summary: item.snippet || "",
            link: item.link,
            date: item.date,
            category: source.toUpperCase(),
          }));

          allNews = [...allNews, ...mappedNews];
        } catch (err) {
          console.error(`Error fetching from ${source}`, err);
        }
      }

      setNews(allNews);
    };

    fetchAllNews();
  }, [category]);

  const featuredNews = news.slice(0, 5);

  // Auto Slide
  useEffect(() => {
    if (featuredNews.length === 0) return;

    setCurrentSlide(0); // Reset slide setiap data berubah

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredNews.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 transition-colors duration-300">
      {!category && featuredNews.length > 0 && (
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

      <h2 className="text-2xl font-bold mb-4">Semua Berita</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Home;
