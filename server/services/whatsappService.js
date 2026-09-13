import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import puppeteer from "puppeteer";

let clientInstance = null;
let isReady = false;
let isInitializing = false;
let lastQr = null;

/**
 * Initializes the WhatsApp Web client with local authentication persistence.
 * QR code will be printed to the terminal on initial login.
 */
export function initWhatsApp() {
  if (clientInstance || isInitializing) {
    return clientInstance;
  }

  isInitializing = true;
  console.log("🔄 Initializing WhatsApp Web Client...");

  try {
    clientInstance = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_AUTH_PATH || "./.wwebjs_auth",
      }),
      puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      },
    });

    // 1. Handle QR code generation in terminal
    clientInstance.on("qr", (qr) => {
      lastQr = qr;
      isReady = false;
      console.log("\n========================================");
      console.log("📱 Scan the QR code below with WhatsApp to log in:");
      console.log("========================================\n");
      qrcode.generate(qr, { small: true });
      console.log("\n========================================\n");
    });

    // 2. Handle successful authentication
    clientInstance.on("authenticated", () => {
      console.log("🔐 WhatsApp Client authenticated successfully!");
      lastQr = null;
    });

    clientInstance.on("auth_failure", (msg) => {
      console.error("❌ WhatsApp Authentication failure:", msg);
      isReady = false;
    });

    // 3. Handle ready event
    clientInstance.on("ready", () => {
      isReady = true;
      isInitializing = false;
      lastQr = null;
      console.log("✅ WhatsApp Client is ready to send alerts!");
    });

    // 4. Handle disconnect
    clientInstance.on("disconnected", (reason) => {
      console.warn("⚠️ WhatsApp Client disconnected:", reason);
      isReady = false;
      isInitializing = false;
      clientInstance = null;
    });

    clientInstance.initialize().catch((err) => {
      console.error("❌ Error during WhatsApp client initialization:", err.message);
      isInitializing = false;
      clientInstance = null;
    });

    return clientInstance;
  } catch (err) {
    console.error("❌ Failed to create WhatsApp client:", err.message);
    isInitializing = false;
    return null;
  }
}

/**
 * Returns the current status of the WhatsApp Web client.
 */
export function getWhatsAppStatus() {
  return {
    isReady,
    isInitializing,
    hasQr: Boolean(lastQr),
    qr: lastQr,
  };
}

/**
 * Returns the active WhatsApp client instance.
 */
export function getWhatsAppClient() {
  return clientInstance;
}

/**
 * Clean and format any phone number into a valid WhatsApp JID format.
 * Handles inputs like:
 *   "+91 98765 43210" -> "919876543210@c.us"
 *   "09876543210"     -> "919876543210@c.us" (if default country code applies)
 *   "919876543210@c.us" -> "919876543210@c.us"
 *   "123456789-123456@g.us" -> "123456789-123456@g.us" (groups)
 */
export function formatWhatsAppNumber(toNumber, defaultCountryCode = "91") {
  if (!toNumber) return null;

  let cleaned = String(toNumber).trim();

  // If already contains JID suffix (@c.us or @g.us), return as is
  if (cleaned.includes("@")) {
    return cleaned;
  }

  // Remove non-digit characters
  let digits = cleaned.replace(/\D/g, "");

  // Remove leading 0 (common in local mobile dialing)
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  // If standard 10-digit number without country code, prepend default country code (e.g. 91 for India)
  if (digits.length === 10 && defaultCountryCode) {
    digits = `${defaultCountryCode}${digits}`;
  }

  return `${digits}@c.us`;
}

/**
 * Reusable WhatsApp Alert function.
 * 
 * Can be imported and called from anywhere in the project:
 * e.g.:
 *   import { sendWhatsAppAlert } from "./services/whatsappService.js";
 *   await sendWhatsAppAlert("919876543210", "🔥 Heatwave Alert for Lucknow!");
 *
 * @param {string} toNumber - Target phone number (e.g., "919876543210", "+919876543210", or "9876543210")
 * @param {string} messageText - The alert message text to send
 * @param {object} [options] - Optional settings (e.g. { defaultCountryCode: "91" })
 * @returns {Promise<{ success: boolean, messageId?: string, chatId?: string, error?: string }>}
 */
export async function sendWhatsAppAlert(toNumber, messageText, options = {}) {
  try {
    if (!toNumber || !messageText) {
      throw new Error("Target phone number (toNumber) and message text (messageText) are required.");
    }

    if (!clientInstance || !isReady) {
      const statusMsg = !clientInstance
        ? "WhatsApp client is not initialized. Call initWhatsApp() first."
        : "WhatsApp client is not ready yet. Please scan the QR code in the terminal.";
      console.warn(`⚠️ ${statusMsg}`);
      return {
        success: false,
        error: statusMsg,
        status: isInitializing ? "INITIALIZING" : (lastQr ? "AWAITING_QR_SCAN" : "DISCONNECTED"),
      };
    }

    console.log(`📨 Attempting to send message to: ${toNumber}`);

    const defaultCode = options.defaultCountryCode || process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91";
    const formattedNumber = formatWhatsAppNumber(toNumber, defaultCode);

    console.log(`📱 Formatted number: ${formattedNumber}`);

    // If it's a group chat (@g.us), we skip getNumberId check
    let chatId = formattedNumber;
    if (formattedNumber.endsWith("@c.us")) {
      const registeredUser = await clientInstance.getNumberId(formattedNumber);
      if (!registeredUser) {
        throw new Error(
          `Number (${formattedNumber}) is not registered on WhatsApp. Make sure the number has WhatsApp and country code is correct.`
        );
      }
      chatId = registeredUser._serialized;
    }

    console.log(`💬 Chat ID: ${chatId}`);

    // Send the message via WhatsApp Web
    const response = await clientInstance.sendMessage(chatId, messageText);
    console.log("✅ Alert Sent successfully!");

    return {
      success: true,
      chatId,
      toNumber,
      messageId: response?.id?._serialized || response?.id?.id || `WA-${Date.now()}`,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Failed to send alert:", error.message);
    return {
      success: false,
      error: error.message,
      toNumber,
    };
  }
}

export default {
  initWhatsApp,
  getWhatsAppStatus,
  getWhatsAppClient,
  formatWhatsAppNumber,
  sendWhatsAppAlert,
};
