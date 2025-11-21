import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sumber berita
  const sources = [
    { id: "cnn", label: "CNN Indonesia" },
    { id: "tempo", label: "Tempo" },
  ];

  // Klik di luar untuk close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LOGO */}
        <h1 className="text-2xl font-bold text-black dark:text-white">
          <Link to="/">NewsInn</Link>
        </h1>

        {/* MENU */}
        <nav className="space-x-4 hidden md:flex items-center text-black dark:text-white">
          <Link to="/" className="hover:underline">
            Home
          </Link>

          {/* DROPDOWN SUMBER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenDropdown((prev) => !prev)}
              className="flex items-center gap-1 hover:underline"
            >
              Sumber Berita
              <ChevronDown size={16} />
            </button>

            {openDropdown && (
              <div className="absolute left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-xl w-48 py-2 z-50 border border-gray-200 dark:border-gray-600 animate-fadeIn">
                {sources.map((src) => (
                  <Link
                    key={src.id}
                    to={`/source/${src.id}`}
                    onClick={() => setOpenDropdown(false)}
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

          <Link
            to="/add"
            className="hover:underline text-yellow-400 font-semibold"
          >
            Tambah Berita
          </Link>
        </nav>

        {/* DARK / LIGHT BUTTON */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-700 text-black dark:text-yellow-300 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
