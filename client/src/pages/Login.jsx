import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import { loginUser } from "../services/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Sign in</h1>
          <p className="mt-2 text-ink-600">Track heat risk for your location and manage alerts.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink-100 px-4 py-3 outline-none focus:border-sun-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink-100 px-4 py-3 outline-none focus:border-sun-400"
              />
            </div>
            {error && <p className="text-sm text-risk-extreme">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="mt-2 rounded-full bg-sun-500 px-6 py-3 font-medium text-white transition hover:bg-sun-600 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-sm text-ink-500">
            No account? <Link to="/register" className="font-medium text-sun-700">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
