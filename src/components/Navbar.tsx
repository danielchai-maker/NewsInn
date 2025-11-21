import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-blue-700 dark:bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold">
          <Link to="/">NewsInn</Link>
        </h1>

        <nav className="space-x-4 hidden sm:flex items-center">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/bookmark" className="hover:underline">
            Bookmark
          </Link>
          <Link
            to="/add"
            className="hover:underline text-yellow-300 font-semibold"
          >
            Tambah Berita
          </Link>
        </nav>

        {/* BUTTON DARK/LIGHT */}
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
