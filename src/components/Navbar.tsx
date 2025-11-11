import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold flex items-center gap-2 group">
          <Link to="/" className="flex items-center gap-2">
            NewsInn
            <span className="relative w-6 h-6 inline-block">
              {}
              <span className="absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                😊
              </span>
              {}
              <span className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                😲
              </span>
            </span>
          </Link>
        </h1>

        <nav className="space-x-4 hidden sm:block">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/category/otomotif" className="hover:underline">
            Otomotif
          </Link>
          <Link to="/category/finansial" className="hover:underline">
            Finansial
          </Link>
          <Link to="/category/teknologi" className="hover:underline">
            Teknologi
          </Link>

          {/* ✅ Tambahkan baris ini */}
          <Link
            to="/add"
            className="hover:underline font-semibold text-yellow-300"
          >
            Tambah Berita
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
