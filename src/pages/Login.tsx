import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth(); // ⬅ PENTING!
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Login gagal");

      // ⬇⬇⬇ GANTI saveAuth() → pakai AuthContext
      login({
        token: data.data.token,
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
      });

      toast.success("Login berhasil! Selamat datang ✨");
      nav("/");
    } catch (error: any) {
      setErr(error.message);
      toast.error(error.message || "Login gagal");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
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

        <button className="px-4 py-2 bg-blue-600 text-white rounded w-full">
          Login
        </button>
      </form>

      {err && <p className="mt-3 text-red-400">{err}</p>}
    </div>
  );
};

export default Login;
