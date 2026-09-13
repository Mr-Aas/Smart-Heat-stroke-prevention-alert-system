import Notification from "../models/Notification.js";
import {
  sendWhatsAppAlert,
  getWhatsAppStatus,
  initWhatsApp,
  formatWhatsAppNumber,
} from "./whatsappService.js";

let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  // Lazy import so the app runs fine without the twilio package configured
  return import("twilio").then((mod) => {
    twilioClient = mod.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
  });
}

function isLiveTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.DEMO_MODE !== "true"
  );
}

async function saveNotification(doc) {
  try {
    return await Notification.create(doc);
  } catch {
    return { ...doc, _id: `demo-${Date.now()}` };
  }
}

export async function sendSMS({ to, message, alertId, userId, location }) {
  if (!isLiveTwilioConfigured()) {
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "SIMULATED_SENT",
      message, sentAt: new Date(), providerMessageId: `SIM-SMS-${Date.now()}`,
    });
  }
  try {
    const client = await getTwilioClient();
    const res = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "SENT",
      message, sentAt: new Date(), providerMessageId: res.sid,
    });
  } catch (err) {
    return saveNotification({
      userId, alertId, location, channel: "SMS", status: "FAILED", message, error: err.message,
    });
  }
}

export async function sendWhatsApp({ to, message, alertId, userId, location }) {
  const waStatus = getWhatsAppStatus();

  // 1. Preferred: WhatsApp Web client (whatsapp-web.js)
  if (waStatus.isReady) {
    const result = await sendWhatsAppAlert(to, message);
    if (result.success) {
      return saveNotification({
        userId,
        alertId,
        location,
        channel: "WHATSAPP",
        status: "SENT",
        message,
        sentAt: new Date(),
        providerMessageId: result.messageId,
      });
    } else {
      return saveNotification({
        userId,
        alertId,
        location,
        channel: "WHATSAPP",
        status: "FAILED",
        message,
        error: result.error,
      });
    }
  }

  // 2. Secondary fallback: Twilio WhatsApp if configured
  if (isLiveTwilioConfigured() && process.env.TWILIO_WHATSAPP_NUMBER) {
    try {
      const client = await getTwilioClient();
      const res = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`,
      });
      return saveNotification({
        userId, alertId, location, channel: "WHATSAPP", status: "SENT",
        message, sentAt: new Date(), providerMessageId: res.sid,
      });
    } catch (err) {
      return saveNotification({
        userId, alertId, location, channel: "WHATSAPP", status: "FAILED", message, error: err.message,
      });
    }
  }

  // 3. Fallback: Simulated send (demo / offline)
  return saveNotification({
    userId,
    alertId,
    location,
    channel: "WHATSAPP",
    status: "SIMULATED_SENT",
    message,
    sentAt: new Date(),
    providerMessageId: `SIM-WA-${Date.now()}`,
    error: waStatus.hasQr ? "Awaiting QR scan on WhatsApp Web" : "WhatsApp client not ready / Twilio not configured",
  });
}

export async function sendHeatAlert({ to, alert, channel = "WHATSAPP", userId }) {
  const message = `🔥 SmartHeat AI - ${alert.title}\n📍 Location: ${alert.location}\n⚠️ Severity: ${alert.severity || "HIGH"}\n\n${alert.message}\n\nStay hydrated & safe.`;
  if (channel === "WHATSAPP") {
    return sendWhatsApp({ to, message, alertId: alert._id, userId, location: alert.location });
  }
  return sendSMS({ to, message, alertId: alert._id, userId, location: alert.location });
}

export {
  sendWhatsAppAlert,
  initWhatsApp,
  getWhatsAppStatus,
  formatWhatsAppNumber,
  isLiveTwilioConfigured as isLiveNotifyConfigured,
};
