import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface NewsItem {
  title: string;
  link: string;
  image?: string;
  snippet?: string;
  date?: string;
}

const CategoryPage: React.FC = () => {
  const { source, category } = useParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!source || !category) return;

    setLoading(true);

    fetch(`http://localhost:5000/api/rss/${source}/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      });
  }, [source, category]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-3">
      <h2 className="text-2xl font-bold mb-4 capitalize">
        {source} - {category}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              className="bg-white dark:bg-gray-800 border rounded-lg shadow hover:shadow-lg transition"
            >
              {item.image && (
                <img
                  src={item.image}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
              )}

              <div className="p-3">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-75">{item.snippet}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
