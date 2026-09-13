import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Bell,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Flame,
  Thermometer,
  Activity,
  LogOut,
  Check,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  // Realistic fallback dummy user state if no auth user is logged in
  const defaultUser = {
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    location: "Lucknow, Uttar Pradesh",
    role: "user",
    createdAt: "June 2026",
  };

  const profile = {
    name: authUser?.name || defaultUser.name,
    phone: authUser?.phone || defaultUser.phone,
    email: authUser?.email || defaultUser.email,
    location: authUser?.location || defaultUser.location,
    role: authUser?.role || defaultUser.role,
  };

  const [testAlertSent, setTestAlertSent] = useState(false);

  // Notification channel toggles
  const [channels, setChannels] = useState({
    whatsapp: true,
    sms: true,
    extremeAlerts: true,
    dailySummary: false,
  });

  const toggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendTestAlert = () => {
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 3500);
  };

  const getInitials = (name) => {
    if (!name) return "SH";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sun-50/70 via-white to-sun-50/30 text-ink-900 pb-20">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Notification if Test alert dispatched */}
        <AnimatePresence>
          {testAlertSent && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-sun-400/30 bg-sun-50 px-5 py-3.5 text-sm text-sun-700 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-sun-500 animate-spin" />
                <span>
                  <strong>Test WhatsApp Alert dispatched</strong> to {profile.phone}! Check your phone.
                </span>
              </div>
              <span className="text-xs bg-sun-200/70 text-sun-700 px-2.5 py-0.5 rounded-full font-medium">
                Sent Just Now
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Header Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-ink-100/80 bg-white p-6 sm:p-8 shadow-soft"
        >
          {/* Subtle warm background accents */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sun-100/50 blur-3xl" />
          <div className="pointer-events-none absolute right-40 -bottom-20 h-48 w-48 rounded-full bg-sky-100/40 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sun-500 to-sun-400 text-2xl sm:text-3xl font-bold font-display text-white shadow-lg shadow-sun-500/20">
                {getInitials(profile.name)}
                <span
                  title="Protection Active"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-risk-low text-white shadow-sm"
                >
                  <Check size={13} strokeWidth={3} />
                </span>
              </div>

              {/* Name & Quick Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
                    {profile.name}
                  </h1>
                  <span className="rounded-full bg-sun-100 px-3 py-0.5 text-xs font-semibold capitalize text-sun-700 border border-sun-200">
                    {profile.role} Member
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-sun-500" />
                    {profile.location}
                  </span>
                  <span className="hidden sm:inline text-ink-200">•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={15} className="text-sun-500" />
                    {profile.phone}
                  </span>
                  <span className="hidden sm:inline text-ink-200">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-sun-500" />
                    Member since 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Out Button (if auth user exists) */}
            {authUser && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition hover:border-risk-extreme hover:text-risk-extreme hover:bg-risk-extreme/5 shadow-sm"
                  title="Sign out"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick KPI / Protection Status Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="rounded-2xl border border-ink-100/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>Heat Risk Status</span>
              <span className="flex h-2 w-2 rounded-full bg-risk-low animate-pulse" />
            </div>
            <p className="mt-2 text-xl font-bold font-display text-risk-low">Protected</p>
            <p className="text-xs text-ink-500 mt-0.5">24/7 Monitoring active</p>
          </div>

          <div className="rounded-2xl border border-ink-100/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>Alert Channels</span>
              <Bell size={14} className="text-sun-500" />
            </div>
            <p className="mt-2 text-xl font-bold font-display text-ink-900">
              {channels.whatsapp && channels.sms
                ? "WhatsApp & SMS"
                : channels.whatsapp
                  ? "WhatsApp Only"
                  : channels.sms
                    ? "SMS Only"
                    : "Disabled"}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">Real-time dispatches</p>
          </div>

          <div className="rounded-2xl border border-ink-100/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>Primary City</span>
              <MapPin size={14} className="text-sun-500" />
            </div>
            <p className="mt-2 text-xl font-bold font-display text-ink-900 truncate">
              {profile.location.split(",")[0]}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">Local station sync</p>
          </div>

          <div className="rounded-2xl border border-ink-100/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>Alerts Received</span>
              <Flame size={14} className="text-sun-500" />
            </div>
            <p className="mt-2 text-xl font-bold font-display text-sun-600">14 Alerts</p>
            <p className="text-xs text-ink-500 mt-0.5">Since June 2026</p>
          </div>
        </motion.div>

        {/* Main Content Grid: Personal Information & Alert Settings */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Profile Details View */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-2 rounded-3xl border border-ink-100/80 bg-white p-6 sm:p-7 shadow-soft"
          >
            <div className="flex items-center justify-between pb-5 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-100 text-sun-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">Personal Information</h2>
                  <p className="text-xs text-ink-500">Your account identity and contact credentials</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <User size={13} /> Full Name
                  </label>
                  <p className="mt-1.5 text-sm font-medium text-ink-900 bg-ink-50/60 rounded-xl px-4 py-2.5 border border-ink-100/50">
                    {profile.name}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <Phone size={13} /> Phone (WhatsApp & SMS)
                  </label>
                  <div className="mt-1.5 flex items-center justify-between text-sm font-medium text-ink-900 bg-ink-50/60 rounded-xl px-4 py-2.5 border border-ink-100/50">
                    <span>{profile.phone}</span>
                    <span className="text-[11px] font-semibold text-risk-low flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> Verified
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <Mail size={13} /> Email Address
                  </label>
                  <p className="mt-1.5 text-sm font-medium text-ink-900 bg-ink-50/60 rounded-xl px-4 py-2.5 border border-ink-100/50">
                    {profile.email || "Not specified"}
                  </p>
                </div>

                {/* Monitored Location */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <MapPin size={13} /> Monitored Location
                  </label>
                  <p className="mt-1.5 text-sm font-medium text-ink-900 bg-ink-50/60 rounded-xl px-4 py-2.5 border border-ink-100/50">
                    {profile.location}
                  </p>
                </div>
              </div>

              {/* Role & Account status */}
              <div className="mt-4 pt-4 border-t border-ink-100/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-ink-50/40 border border-ink-100/50">
                  <Shield size={20} className="text-sun-500" />
                  <div>
                    <p className="text-xs text-ink-400">Account Access Role</p>
                    <p className="text-sm font-semibold text-ink-900 capitalize">{profile.role} Access</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-ink-50/40 border border-ink-100/50">
                  <Activity size={20} className="text-risk-low" />
                  <div>
                    <p className="text-xs text-ink-400">Heatwave Advisory Engine</p>
                    <p className="text-sm font-semibold text-risk-low">Active & Linked</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Alert Channels & Quick Test */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Channels & Preferences Card */}
            <div className="rounded-3xl border border-ink-100/80 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-100 text-sun-600">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink-900">Alert Preferences</h2>
                  <p className="text-xs text-ink-500">Manage your dispatch channels</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {/* WhatsApp Channel */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-ink-100/70 hover:border-sun-200 transition bg-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-risk-low/10 text-risk-low">
                      <MessageSquare size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">WhatsApp Web Alert</p>
                      <p className="text-xs text-ink-400">Direct message to phone</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleChannel("whatsapp")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${channels.whatsapp ? "bg-sun-500" : "bg-ink-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channels.whatsapp ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* SMS Channel */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-ink-100/70 hover:border-sun-200 transition bg-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <Smartphone size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">SMS Alerts</p>
                      <p className="text-xs text-ink-400">Backup cellular dispatch</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleChannel("sms")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${channels.sms ? "bg-sun-500" : "bg-ink-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channels.sms ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* Extreme Alerts Filter */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-ink-100/70 hover:border-sun-200 transition bg-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-risk-extreme/10 text-risk-extreme">
                      <AlertTriangle size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">Critical Heat Warnings</p>
                      <p className="text-xs text-ink-400">Temp &gt; 42°C &amp; high humidity</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleChannel("extremeAlerts")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${channels.extremeAlerts ? "bg-sun-500" : "bg-ink-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channels.extremeAlerts ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Instant Test Alert Action */}
              <div className="mt-5 pt-4 border-t border-ink-100">
                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sun-500 to-sun-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sun-500/20 transition hover:from-sun-600 hover:to-sun-700 active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  Send Test WhatsApp Alert
                </button>
                <p className="mt-2 text-center text-[11px] text-ink-400">
                  Sends an instantaneous demo notification to {profile.phone}
                </p>
              </div>
            </div>

            {/* Weather Sensor Card */}
            <div className="rounded-3xl border border-ink-100/80 bg-gradient-to-br from-sun-50 to-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sun-500 text-white shadow-sm">
                  <Thermometer size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Station Telemetry</h3>
                  <p className="text-xs text-ink-500">{profile.location}</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-ink-900">41.2°C</p>
                  <p className="text-xs text-ink-500">Feels like 44.5°C</p>
                </div>
                <span className="rounded-full bg-risk-high/15 border border-risk-high/30 px-3 py-1 text-xs font-semibold text-risk-high">
                  High Risk Zone
                </span>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 block text-center rounded-xl bg-white border border-ink-100/80 py-2.5 text-xs font-medium text-sun-700 hover:border-sun-400 hover:bg-sun-50/50 transition"
              >
                View Full Heat Forecast &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
