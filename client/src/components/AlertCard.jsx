import React, { useState } from "react";
import { AlertTriangle, Send, Check, Loader2, Share2 } from "lucide-react";
import { riskMeta } from "../utils/risk.js";
import { useAuth } from "../context/AuthContext.jsx";
import { sendWhatsAppNotification } from "../services/notificationApi.js";

export default function AlertCard({ alert }) {
  const meta = riskMeta(alert.severity);
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState(null); // 'success' | 'error' | null

  const formattedMsg = `👋 *Hello ${user?.name || "User"}!*\n\n🚨 *SmartHeat AI - Active Heat Alert*\n⚠️ *${alert.title}* [${alert.severity}]\n📍 *Location*: ${alert.location}\n⏰ *Time*: ${new Date(alert.startTime || alert.createdAt).toLocaleString()}\n\n📝 *Advisory*:\n${alert.message}\n\n💧 *Stay hydrated and safe!* 🔥`;

  async function handleSendWhatsApp() {
    if (sending) return;

    if (user?.phone) {
      setSending(true);
      setSentStatus(null);
      try {
        const res = await sendWhatsAppNotification({
          to: user.phone,
          message: formattedMsg,
        });
        if (res?.success) {
          setSentStatus("success");
          setTimeout(() => setSentStatus(null), 4000);
        } else {
          // Fallback to wa.me if server client isn't ready
          window.open(`https://wa.me/?text=${encodeURIComponent(formattedMsg)}`, "_blank");
          setSentStatus("success");
          setTimeout(() => setSentStatus(null), 4000);
        }
      } catch {
        // Fallback open WhatsApp link directly
        window.open(`https://wa.me/?text=${encodeURIComponent(formattedMsg)}`, "_blank");
        setSentStatus("success");
        setTimeout(() => setSentStatus(null), 4000);
      } finally {
        setSending(false);
      }
    } else {
      // If no registered phone number, open WhatsApp Web share directly
      window.open(`https://wa.me/?text=${encodeURIComponent(formattedMsg)}`, "_blank");
    }
  }

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-2xl border p-5 transition hover:shadow-sm"
      style={{ borderColor: meta.color + "33", background: meta.bg }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} style={{ color: meta.color }} className="mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-900">{alert.title}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
              style={{ background: meta.color + "22", color: meta.color }}
            >
              {alert.severity}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">{alert.message}</p>
          <p className="mt-2 text-xs text-ink-400">
            {alert.location} · {new Date(alert.startTime || alert.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={handleSendWhatsApp}
          disabled={sending}
          title={user?.phone ? `Send alert to ${user.phone}` : "Share alert on WhatsApp"}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition active:scale-95 disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 size={14} className="animate-spin text-emerald-600" />
              <span>Sending…</span>
            </>
          ) : sentStatus === "success" ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span>Sent to WhatsApp!</span>
            </>
          ) : (
            <>
              <Send size={13} className="text-emerald-600" />
              <span>Send to WhatsApp</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(formattedMsg)}`, "_blank")}
          title="Share via WhatsApp Web"
          className="rounded-xl border border-emerald-500/30 bg-white p-1.5 text-emerald-700 hover:bg-emerald-50 transition"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
}

