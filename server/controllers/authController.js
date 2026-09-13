import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Alert from "../models/Alert.js";
import Notification from "../models/Notification.js";
import { sendWhatsAppAlert } from "../services/whatsappService.js";
import { sweepAndCreateAlerts } from "./alertController.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sanitize(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, location: user.location, phone: user.phone };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, location, phone } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: "Name, phone and password are required" });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ success: false, message: "Number already registered" });

    const user = await User.create({ name, email, password, location, phone });
    const token = signToken(user);
    res.status(201).json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid phone number or password" });
    }
    const token = signToken(user);

    // If phone exists, send Active Heat Alert via WhatsApp
    if (user.phone) {
      const userLoc = user.location || "Lucknow";
      const loginTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });

      (async () => {
        try {
          // Look up active heat alerts for user's location
          let alerts = await Alert.find({
            location: { $regex: new RegExp(`^${userLoc}$`, "i") },
          })
            .sort({ createdAt: -1 })
            .limit(3)
            .catch(() => []);

          // Fallback to recent active alerts if location-specific not found
          if (!alerts || alerts.length === 0) {
            alerts = await Alert.find().sort({ createdAt: -1 }).limit(3).catch(() => []);
          }

          // If still empty (e.g. fresh DB), sweep to generate alerts
          if (!alerts || alerts.length === 0) {
            try {
              await sweepAndCreateAlerts();
              alerts = await Alert.find({
                location: { $regex: new RegExp(`^${userLoc}$`, "i") },
              })
                .sort({ createdAt: -1 })
                .limit(3)
                .catch(() => []);
              if (!alerts || alerts.length === 0) {
                alerts = await Alert.find().sort({ createdAt: -1 }).limit(3).catch(() => []);
              }
            } catch (e) {
              console.error("Alert sweep error on login:", e.message);
            }
          }

          let alertMsg = "";
          if (alerts && alerts.length > 0) {
            if (alerts.length === 1) {
              const a = alerts[0];
              alertMsg = `👋 *Hello ${user.name}!*

🚨 *SmartHeat AI - Active Heat Alert*
⚠️ *Alert*: ${a.title}
📍 *Location*: ${a.location}
🔥 *Severity*: ${a.severity}
⏰ *Time*: ${loginTime}

📝 *Advisory*:
${a.message}

💧 *Safety Guidance*:
• Stay hydrated and drink plenty of water
• Avoid direct sun exposure during peak hours (11 AM - 4 PM)
• Check on elderly family members and neighbors

Stay hydrated and safe! 🔥`;
            } else {
              const alertList = alerts
                .map((a, idx) => `${idx + 1}. ⚠️ *${a.title}* [${a.severity}]\n📍 ${a.location}: ${a.message}`)
                .join("\n\n");
              alertMsg = `👋 *Hello ${user.name}!*

🚨 *SmartHeat AI - Active Heat Alerts*
📍 *Location*: ${userLoc}
⏰ *Time*: ${loginTime}

${alertList}

💧 *Stay hydrated and safe!* 🔥`;
            }
          } else {
            alertMsg = `👋 *Hello ${user.name}!*

🌡️ *SmartHeat AI - Active Heat Status*
📍 *Location*: ${userLoc}
⏰ *Time*: ${loginTime}

✅ *Status*: No active heat alerts right now. Conditions are within a manageable range.

💧 *Stay hydrated and safe!* 🔥`;
          }

          const result = await sendWhatsAppAlert(user.phone, alertMsg);

          // Log notification record
          Notification.create({
            userId: user._id,
            alertId: alerts?.[0]?._id,
            location: alerts?.[0]?.location || userLoc,
            channel: "WHATSAPP",
            status: result.success ? "SENT" : "FAILED",
            message: alertMsg,
            sentAt: new Date(),
            providerMessageId: result.messageId,
            error: result.error,
          }).catch(() => {});
        } catch (err) {
          console.error("WhatsApp active heat alert error:", err.message);
        }
      })();
    } else {
      console.log(`User ${user.email || user.name} has no registered phone number, skipping WhatsApp alert.`);
    }

    res.json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: sanitize(req.user) });
}
