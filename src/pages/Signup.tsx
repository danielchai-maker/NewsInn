import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../authClient";
import { toast } from "react-toastify";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Register gagal");

      saveAuth({
        token: data.data.token,
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
      });

      toast.success("Berhasil daftar! Selamat datang 👋");
      nav("/");
    } catch (error: any) {
      setErr(error.message);
      toast.error(error.message || "Register gagal");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Daftar</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Lengkap"
          required
          className="w-full p-2 border rounded"
        />

        <input
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          className="w-full p-2 border rounded"
        />

        <button className="px-4 py-2 bg-green-600 text-white rounded w-full">
          Daftar
        </button>
      </form>

      {err && <p className="mt-3 text-red-400">{err}</p>}
    </div>
  );
};

export default Signup;
