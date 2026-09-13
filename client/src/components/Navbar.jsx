import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Flame, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/forecast", label: "Forecast" },
  { to: "/risk-map", label: "Risk map" },
  { to: "/alerts", label: "Alerts" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-sun-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-500 text-sun-50">
            <Flame size={18} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">SmartHeat AI</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[15px] transition-colors ${isActive ? "text-sun-700 font-medium" : "text-ink-600 hover:text-ink-900"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `text-[15px] ${isActive ? "text-sun-700 font-medium" : "text-ink-600 hover:text-ink-900"}`}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="text-[15px] text-ink-600 hover:text-ink-900">{user.name?.split(" ")[0]}</Link>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="rounded-full border border-ink-100 px-4 py-2 text-sm text-ink-700 transition hover:border-sun-300 hover:text-sun-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[15px] text-ink-600 hover:text-ink-900">Sign in</Link>
              <Link to="/register" className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-sun-50 transition hover:bg-sun-600">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100/70 bg-sun-50 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-ink-700">
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && <NavLink to="/admin" onClick={() => setOpen(false)} className="text-ink-700">Admin</NavLink>}
            {user ? (
              <button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="text-left text-ink-700">Sign out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink-700">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-sun-700 font-medium">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
