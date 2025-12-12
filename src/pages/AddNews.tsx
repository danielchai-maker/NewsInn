import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../authClient";

const AddNews: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    image: "",
    summary: "",
    content: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = getToken(); // <-- ambil token login user

      const res = await fetch("http://localhost:5000/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- DITAMBAHKAN
        },
        body: JSON.stringify(form),
      });

      // ---- FIX NOT_FOUND (backend mengirim plain text) ----
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text); // backend mungkin kirim text biasa
      }

      if (!res.ok)
        throw new Error(data.error || data.message || "Gagal menambah berita");

      setMessage("✅ Berita berhasil ditambahkan!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
        Tambah Berita Baru 📰
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-grey-900 p-6 shadow rounded-lg"
      >
        <input
          name="title"
          placeholder="Judul Berita"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded  text-black dark:text-white"
          required
        />
        <input
          name="image"
          placeholder="URL Gambar (https://...)"
          value={form.image}
          onChange={handleChange}
          className="w-full p-3 border rounded  text-black dark:text-white"
          required
        />
        <input
          name="summary"
          placeholder="Ringkasan Berita"
          value={form.summary}
          onChange={handleChange}
          className="w-full p-3 border rounded text-black dark:text-white"
          required
        />
        <textarea
          name="content"
          placeholder="Isi Lengkap Berita"
          value={form.content}
          onChange={handleChange}
          className="w-full p-3 border rounded h-32 text-black dark:text-white"
          required
        />
        <input
          name="category"
          placeholder="Kategori (contoh: Otomotif, Finansial)"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded text-black dark:text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50 dark:hover:bg-gray-500"
        >
          {loading ? "Mengirim..." : "Tambah Berita"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-black dark:text-white">{message}</p>
      )}
    </div>
  );
};

export default AddNews;
