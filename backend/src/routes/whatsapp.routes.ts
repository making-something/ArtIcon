import { Router } from 'express';
import whatsappController from '@/controllers/whatsapp.controller';

const router: Router = Router();

/**
 * WhatsApp Webhook Routes
 */
router.get('/webhook', whatsappController.verifyWebhook.bind(whatsappController));
router.post('/webhook', whatsappController.handleWebhook.bind(whatsappController));

/**
 * WhatsApp Automation Routes
 */
router.post('/send-opt-in', whatsappController.sendOptInRequest.bind(whatsappController));
router.post('/generate-qr', whatsappController.generateOptInQR.bind(whatsappController));
router.post('/send-text', whatsappController.sendTextMessage.bind(whatsappController));
router.post('/send-template', whatsappController.sendTemplateMessage.bind(whatsappController));
router.post('/send-list', whatsappController.sendListMessage.bind(whatsappController));
router.get('/opt-in-link', whatsappController.getOptInLink.bind(whatsappController));

export default router;