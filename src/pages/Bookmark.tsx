import { useBookmark } from "../context/BookmarkContext";
import NewsCard from "../components/Newscard";
import { useEffect, useState } from "react";
import { BookmarkCheck } from "lucide-react";

export default function Bookmark() {
  const { bookmarks } = useBookmark();
  const [list, setList] = useState(bookmarks);

  useEffect(() => {
    setList(bookmarks);
  }, [bookmarks]);

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="w-full text-black dark:text-white animate-fadeIn">
      {/* TITLE */}
      <div className="flex items-center gap-2 px-4 mb-6">
        <BookmarkCheck size={28} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold">Bookmark</h2>
      </div>

      {/* FULL WIDTH WRAPPER (PERSIS SEPERTI HOME) */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 px-2 sm:px-4">
        {/* GRID */}
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
          {list.map((item, i) => (
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
                fromBookmark={true}
                onDeleteSuccess={handleDelete}
              />
            </div>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <div className="text-center py-10 text-gray-400 animate-fadeIn">
          Tidak ada bookmark.
        </div>
      )}
    </div>
  );
}
