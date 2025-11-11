import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import AddNews from "./pages/AddNews";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<Home />} />{" "}
        {/* ✅ untuk filter */}
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/add" element={<AddNews />} />
      </Routes>
    </Router>
  );
};

export default App;
