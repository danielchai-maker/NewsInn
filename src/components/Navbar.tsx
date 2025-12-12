import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState<
    "source" | "profile" | "category" | null
  >(null);
  const [categories, setCategories] = useState<string[]>([]);

  const { category } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const sourceRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // FETCH KATEGORI
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data: string[]) => setCategories(data))
      .catch((err) => console.error("Gagal fetch kategori:", err));
  }, []);

  // CLOSE DROPDOWN KETIKA KLIK LUAR
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        sourceRef.current &&
        !sourceRef.current.contains(e.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const sources = [
    { id: "cnn", label: "CNN Indonesia" },
    { id: "tempo", label: "Tempo" },
  ];

  const activeCategory = category || "";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 w-full">
      {/* FULL WIDTH WRAPPER */}
      <div className="w-full px-4 md:px-6 flex items-center justify-between py-3">
        {/* LOGO KIRI */}
        <h1 className="text-2xl font-bold text-black dark:text-white">
          <Link to="/">NewsInn</Link>
        </h1>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-black dark:text-white">
          <Link to="/" className="hover:underline">
            Home
          </Link>

          {/* KATEGORI */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() =>
                setOpenMenu(openMenu === "category" ? null : "category")
              }
              className="flex items-center gap-1 hover:underline"
            >
              Kategori <ChevronDown size={16} />
            </button>

            {openMenu === "category" && (
              <div className="absolute left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-xl w-48 py-2 z-50 border dark:border-gray-600 animate-fadeIn">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/kategori/${cat.toLowerCase()}`}
                    onClick={() => setOpenMenu(null)}
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md ${
                      activeCategory.toLowerCase() === cat.toLowerCase()
                        ? "font-bold text-blue-600"
                        : ""
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SUMBER */}
          <div className="relative" ref={sourceRef}>
            <button
              onClick={() =>
                setOpenMenu(openMenu === "source" ? null : "source")
              }
              className="flex items-center gap-1 hover:underline"
            >
              Sumber Berita <ChevronDown size={16} />
            </button>

            {openMenu === "source" && (
              <div className="absolute left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-xl w-48 py-2 z-50 border dark:border-gray-600 animate-fadeIn">
                {sources.map((src) => (
                  <Link
                    key={src.id}
                    to={`/source/${src.id}`}
                    onClick={() => setOpenMenu(null)}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    {src.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/bookmark" className="hover:underline">
            Bookmark
          </Link>

          {user && (
            <Link
              to="/add"
              className="hover:underline text-yellow-400 font-semibold"
            >
              Tambah Berita
            </Link>
          )}
        </nav>

        {/* KANAN */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-700 text-black dark:text-yellow-300 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Masuk
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Daftar
              </Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() =>
                  setOpenMenu(openMenu === "profile" ? null : "profile")
                }
                className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold"
              >
                {user?.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </button>

              {openMenu === "profile" && (
                <div className="absolute right-0 mt-3 bg-white dark:bg-gray-700 shadow-lg rounded-xl w-44 py-2 z-50 border dark:border-gray-600 animate-fadeIn">
                  <p className="px-4 py-2 text-sm border-b dark:border-gray-600">
                    {user.name ?? user.email}
                  </p>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
