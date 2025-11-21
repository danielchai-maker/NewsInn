import NewsCard from "../components/Newscard";
import { useBookmark } from "../context/BookmarkContext";

const Bookmarks: React.FC = () => {
  const { bookmarks } = useBookmark();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📌 Bookmark Saya</h1>

      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">
          Belum ada berita yang dibookmark.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((item) => (
            <NewsCard key={item.id} {...item} fromBookmark />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
