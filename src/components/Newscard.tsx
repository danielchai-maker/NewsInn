import { Link } from "react-router-dom";
import { useBookmark } from "../context/BookmarkContext";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface NewsCardProps {
  id: string;
  title: string;
  image?: string;
  summary?: string;
  category?: string;
  link: string;
  date?: string;
  fromBookmark?: boolean; // ← penting untuk akses detail lebih cepat
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  image,
  summary,
  category,
  link,
  date,
  fromBookmark = false, // default value supaya tidak undefined
}) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();
  const idStr = String(id);
  const bookmarked = isBookmarked(idStr);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(idStr);
    } else {
      addBookmark({
        id: idStr,
        title,
        image,
        summary,
        category,
        link,
        date,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />

      <div className="p-4 flex flex-col justify-between h-44">
        <Link
          to={`/detail/${encodeURIComponent(idStr)}`}
          state={{
            id,
            title,
            image,
            summary,
            category,
            link,
            date,
            fromBookmark,
          }}
        >
          <h3 className="font-bold text-md mb-1 line-clamp-2 dark:text-white">
            {title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {summary}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {category}
          </span>

          <button
            onClick={handleBookmark}
            className="text-blue-600 dark:text-blue-400 transition"
          >
            {bookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
