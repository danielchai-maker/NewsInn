import { Link } from "react-router-dom";
import { useBookmark } from "../context/BookmarkContext";
import { Bookmark, BookmarkCheck, Trash } from "lucide-react";

interface NewsCardProps {
  id: string;
  title: string;
  image?: string;
  summary?: string;
  category?: string;
  link?: string;
  date?: string;
  source?: string;
  fromBookmark?: boolean;

  onDeleteSuccess?: (id: string) => void;
}

function formatCategory(cat?: string) {
  if (!cat) return "";
  const lower = cat.toLowerCase();
  if (lower === "lainnya") return "Lainnya";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  image,
  summary,
  category,
  link,
  date,
  source,
  fromBookmark = false,
  onDeleteSuccess,
}) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmark();

  const idStr = String(id);
  const bookmarked = isBookmarked(idStr);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark(idStr);

      if (fromBookmark && onDeleteSuccess) {
        onDeleteSuccess(idStr);
      }
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

  // ------------------------------------------------------------
  //           FULL WIDTH STYLE khusus BOOKMARK PAGE
  // ------------------------------------------------------------
  if (fromBookmark) {
    return (
      <div
        className="
        bg-white dark:bg-gray-800
        text-black dark:text-white
        rounded-xl shadow-md
        overflow-hidden
        w-full h-full
        flex flex-col
        hover:shadow-xl hover:-translate-y-1
        transition
      "
      >
        <img
          src={image && image.trim() !== "" ? image : "/no-image.png"}
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
        />

        <div className="p-4 flex flex-col flex-grow">
          <Link
            to={`/detail/${encodeURIComponent(idStr)}`}
            state={{
              id: idStr,
              title,
              image,
              summary,
              category,
              link,
              date,
              isLocal: source === "local",
            }}
          >
            <h3 className="font-bold text-md mb-1 line-clamp-2">{title}</h3>
          </Link>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">
            {summary}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {source === "local" ? "Berita Lokal" : formatCategory(category)}
            </span>

            <button
              onClick={handleBookmarkToggle}
              className="text-blue-600 dark:text-blue-400 transition"
              title="Unbookmark"
            >
              {bookmarked ? (
                <BookmarkCheck size={22} />
              ) : (
                <Bookmark size={22} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  //           DEFAULT STYLE (Home Page, kategori lain)
  // ------------------------------------------------------------
  return (
    <div
      className="
        bg-white dark:bg-gray-800
        text-black dark:text-white
        rounded-xl shadow-md
        overflow-hidden
        w-full h-full
        flex flex-col
        hover:shadow-xl hover:-translate-y-1
        transition
      "
    >
      <img
        src={image && image.trim() !== "" ? image : "/no-image.png"}
        alt={title}
        className="w-full h-48 object-cover"
        loading="lazy"
        onError={(e) => (e.currentTarget.src = "/no-image.png")}
      />

      <div className="p-4 flex flex-col flex-grow">
        <Link
          to={`/detail/${encodeURIComponent(idStr)}`}
          state={{
            id: idStr,
            title,
            image,
            summary,
            category,
            link,
            date,
            isLocal: source === "local",
          }}
        >
          <h3 className="font-bold text-md mb-1 line-clamp-2">{title}</h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">
          {summary}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {source === "local" ? "Berita Lokal" : formatCategory(category)}
          </span>

          {source === "local" ? (
            <button
              onClick={() => onDeleteSuccess && onDeleteSuccess(idStr)}
              className="text-red-500 dark:text-red-400 transition"
              title="Hapus berita lokal"
            >
              <Trash size={22} />
            </button>
          ) : (
            <button
              onClick={handleBookmarkToggle}
              className="text-blue-600 dark:text-blue-400 transition"
              title="Bookmark / Unbookmark"
            >
              {bookmarked ? (
                <BookmarkCheck size={22} />
              ) : (
                <Bookmark size={22} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
