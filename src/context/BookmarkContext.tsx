import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export interface BookmarkItem {
  id: string;
  title: string;
  image?: string;
  summary?: string;
  category?: string;
  link: string;
  date?: string;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  addBookmark: (item: BookmarkItem) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const stored = localStorage.getItem("bookmarks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (item: BookmarkItem) => {
    if (!isBookmarked(item.id)) {
      setBookmarks((prev) => [...prev, item]);
      toast.success("Berita ditambahkan ke Bookmark!");
    }
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((i) => i.id !== id));
    toast.error("Berita dihapus dari Bookmark!");
  };

  const isBookmarked = (id: string) => bookmarks.some((i) => i.id === id);

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmark = () => {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmark must be used inside BookmarkProvider");
  return ctx;
};
