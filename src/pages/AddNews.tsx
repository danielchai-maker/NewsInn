import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const res = await fetch("http://localhost:5000/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah berita");

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
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Tambah Berita Baru 📰
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 shadow rounded-lg"
      >
        <input
          name="title"
          placeholder="Judul Berita"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <input
          name="image"
          placeholder="URL Gambar (https://...)"
          value={form.image}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <input
          name="summary"
          placeholder="Ringkasan Berita"
          value={form.summary}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <textarea
          name="content"
          placeholder="Isi Lengkap Berita"
          value={form.content}
          onChange={handleChange}
          className="w-full p-3 border rounded h-32"
          required
        />
        <input
          name="category"
          placeholder="Kategori (contoh: Otomotif, Finansial)"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Tambah Berita"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
};

export default AddNews;
