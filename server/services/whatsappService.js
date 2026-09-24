// ```
import "dotenv/config";

// /**
//  * WhatsApp Cloud API Service
//  *
//  * Required .env variables:
//  *
//  * WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
//  * WHATSAPP_ACCESS_TOKEN=your_access_token
//  * WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
//  *
//  * Optional:
//  *
//  * WHATSAPP_API_VERSION=v23.0
//  */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

// // Keep the API version configurable.
// // Change this according to the Graph API version currently
// // supported by your Meta application.
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";

const API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

/**
 * Validate that the required environment variables exist.
 */
function validateConfig() {
  const missing = [];

  if (!PHONE_NUMBER_ID) {
    missing.push("WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!ACCESS_TOKEN) {
    missing.push("WHATSAPP_ACCESS_TOKEN");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing WhatsApp environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Convert a phone number into the format required by
 * WhatsApp Cloud API.
 *
 * Examples:
 *
 * +91 98765 43210  -> 919876543210
 * 09876543210      -> 919876543210
 * 919876543210     -> 919876543210
 *
 * IMPORTANT:
 * For numbers without a country code, the default country
 * code is used.
 */
export function formatWhatsAppNumber(
  toNumber,
  defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91"
) {
  if (!toNumber) {
    return null;
  }

  let digits = String(toNumber).trim();

  // Remove everything except digits.
  digits = digits.replace(/\D/g, "");

  // Remove leading zero(s).
  digits = digits.replace(/^0+/, "");

  // If it looks like an Indian/local 10-digit number,
  // prepend the configured country code.
  if (digits.length === 10 && defaultCountryCode) {
    const countryCode = String(defaultCountryCode).replace(/\D/g, "");
    digits = `${countryCode}${digits}`;
  }

  return digits;
}

/**
 * Send a normal text message using WhatsApp Cloud API.
 *
 * @param {string} toNumber
 * @param {string} messageText
 * @returns {Promise<object>}
 */
export async function sendWhatsAppAlert(toNumber, messageText) {
  try {
    validateConfig();

    if (!toNumber) {
      throw new Error("Target WhatsApp number is required.");
    }

    if (!messageText) {
      throw new Error("Message text is required.");
    }

    const recipient = formatWhatsAppNumber(toNumber);

    if (!recipient) {
      throw new Error("Invalid WhatsApp phone number.");
    }

    console.log(`📨 Sending WhatsApp message to: ${recipient}`);

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to: recipient,

        type: "text",

        text: {
          preview_url: false,
          body: messageText,
        },
      }),
    });

    const data = await response.json();

    /**
     * Meta returns a non-2xx response when something goes wrong.
     */
    if (!response.ok) {
      console.error("❌ WhatsApp Cloud API Error:", data);

      const apiError =
        data?.error?.message ||
        data?.error?.error_data?.details ||
        "WhatsApp Cloud API request failed.";

      throw new Error(apiError);
    }

    const messageId = data?.messages?.[0]?.id || null;

    console.log("✅ WhatsApp message sent successfully!");
    console.log(`📱 Recipient: ${recipient}`);
    console.log(`🆔 Message ID: ${messageId}`);

    return {
      success: true,
      toNumber: recipient,
      messageId,
      response: data,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.message);

    return {
      success: false,
      toNumber,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Send a WhatsApp template message.
 *
 * Use this when your production messaging flow requires
 * a WhatsApp-approved template.
 *
 * Example:
 *
 * await sendWhatsAppTemplate(
 *   "919876543210",
 *   "order_confirmation",
 *   "en_US",
 *   [
 *      { type: "body", parameters: [...] }
 *   ]
 * );
 */
export async function sendWhatsAppTemplate(
  toNumber,
  templateName,
  languageCode = "en_US",
  components = []
) {
  try {
    validateConfig();

    if (!toNumber) {
      throw new Error("Target WhatsApp number is required.");
    }

    if (!templateName) {
      throw new Error("WhatsApp template name is required.");
    }

    const recipient = formatWhatsAppNumber(toNumber);

    if (!recipient) {
      throw new Error("Invalid WhatsApp phone number.");
    }

    console.log(
      `📨 Sending WhatsApp template "${templateName}" to ${recipient}`
    );

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to: recipient,

        type: "template",

        template: {
          name: templateName,

          language: {
            code: languageCode,
          },

          ...(components.length > 0 && {
            components,
          }),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ WhatsApp Template API Error:", data);

      const apiError =
        data?.error?.message ||
        data?.error?.error_data?.details ||
        "WhatsApp template request failed.";

      throw new Error(apiError);
    }

    const messageId = data?.messages?.[0]?.id || null;

    console.log("✅ WhatsApp template sent successfully!");
    console.log(`📱 Recipient: ${recipient}`);
    console.log(`🆔 Message ID: ${messageId}`);

    return {
      success: true,
      toNumber: recipient,
      templateName,
      messageId,
      response: data,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(
      "❌ Failed to send WhatsApp template:",
      error.message
    );

    return {
      success: false,
      toNumber,
      templateName,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Check whether the WhatsApp service has been configured.
 *
 * Useful for startup health checks.
 */
export function getWhatsAppStatus() {
  return {
    configured: Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN),

    phoneNumberIdConfigured: Boolean(PHONE_NUMBER_ID),

    accessTokenConfigured: Boolean(ACCESS_TOKEN),

    businessAccountIdConfigured: Boolean(BUSINESS_ACCOUNT_ID),

    apiVersion: API_VERSION,

    apiUrlConfigured: Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN),
  };
}

/**
 * Export service methods.
 */
export default {
  sendWhatsAppAlert,
  sendWhatsAppTemplate,
  formatWhatsAppNumber,
  getWhatsAppStatus,
};

