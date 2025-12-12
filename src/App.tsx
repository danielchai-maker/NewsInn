import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import AddNews from "./pages/AddNews";
import Bookmarks from "./pages/Bookmark";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* FILTER KATEGORI */}
          <Route path="/kategori/:category" element={<Home />} />

          {/* FILTER SUMBER */}
          <Route path="/source/:source" element={<Home />} />

          {/* FILTER SUMBER + KATEGORI */}
          <Route path="/source/:source/:category" element={<Home />} />

          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/add" element={<AddNews />} />
          <Route path="/bookmark" element={<Bookmarks />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
};

export default App;
