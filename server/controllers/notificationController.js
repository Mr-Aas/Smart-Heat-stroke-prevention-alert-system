import Notification from "../models/Notification.js";
import {
  sendHeatAlert,
  sendWhatsAppAlert,
  getWhatsAppStatus,
  // initWhatsApp,
} from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50).catch(() => []);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function getWhatsAppClientStatus(req, res, next) {
  try {
    const status = getWhatsAppStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function triggerWhatsAppInit(req, res, next) {
  try {
    // initWhatsApp();
    const status = getWhatsAppStatus();
    res.json({ success: true, message: "WhatsApp client initialization triggered", data: status });
  } catch (err) {
    next(err);
  }
}

export async function sendDirectWhatsAppMessage(req, res, next) {
  try {
    const { to, toNumber, message, messageText } = req.body;
    const targetNumber =  to  || toNumber ;
    const alertMessage =  message || messageText ;

    if (!targetNumber || !alertMessage) {
      return res.status(400).json({
        success: false,
        message: "target phone number (to / toNumber) and message (message / messageText) are required",
      });
    }

    const result = await sendWhatsAppAlert(targetNumber, alertMessage);
    
    // Save to Notification history
    Notification.create({
      userId: req.user?._id,
      channel: "WHATSAPP",
      status: result.success ? "SENT" : "FAILED",
      message: alertMessage,
      sentAt: new Date(),
      providerMessageId: result.messageId,
      error: result.error,
    }).catch(() => {});

    if (!result.success) {
      return res.status(500).json({ success: false, ...result });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function sendTestNotification(req, res, next) {
  try {
    const { location = "Lucknow", severity = "HIGH", channel = "WHATSAPP", to } = req.body;

    const fakeAlert = {
      _id: `test-${Date.now()}`,
      location,
      severity,
      title: `Test ${severity} Heat Alert`,
      message: `This is a test heat advisory for ${location}. Stay hydrated and take precautions during peak hours.`,
    };

    const targetNumber = to || process.env.DEFAULT_ALERT_PHONE_NUMBER || "+910000000000";

    const result = await sendHeatAlert({
      to: targetNumber,
      alert: fakeAlert,
      channel,
      userId: req.user?._id,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
