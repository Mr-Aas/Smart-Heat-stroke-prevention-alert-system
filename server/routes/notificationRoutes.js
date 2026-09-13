import express from "express";
import {
  listNotifications,
  sendTestNotification,
  getWhatsAppClientStatus,
  triggerWhatsAppInit,
  sendDirectWhatsAppMessage,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", listNotifications);
router.post("/test", sendTestNotification);
router.get("/whatsapp/status", getWhatsAppClientStatus);
router.post("/whatsapp/init", triggerWhatsAppInit);
router.post("/whatsapp/send", sendDirectWhatsAppMessage);

export default router;
