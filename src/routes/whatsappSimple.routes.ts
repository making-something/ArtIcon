import { Router } from 'express';
import whatsappSimpleController from '@/controllers/whatsappSimple.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';

const router: Router = Router();

/**
 * Admin Messaging Routes
 */
router.post('/send/phone', authenticateAdmin, whatsappSimpleController.sendMessageToPhone.bind(whatsappSimpleController));
router.post('/send/participant', authenticateAdmin, whatsappSimpleController.sendMessageToParticipant.bind(whatsappSimpleController));
router.post('/send/category', authenticateAdmin, whatsappSimpleController.sendMessageToCategory.bind(whatsappSimpleController));
router.post('/send/all', authenticateAdmin, whatsappSimpleController.sendMessageToAll.bind(whatsappSimpleController));
router.post('/send/bulk', authenticateAdmin, whatsappSimpleController.sendBulkMessages.bind(whatsappSimpleController));
router.post('/test', whatsappSimpleController.testMessage.bind(whatsappSimpleController));

/**
 * Management Routes
 */
router.get('/participants', authenticateAdmin, whatsappSimpleController.getParticipants.bind(whatsappSimpleController));
router.get('/status', authenticateAdmin, whatsappSimpleController.getServiceStatus.bind(whatsappSimpleController));

/**
 * Scheduler Management Routes
 */
router.get('/scheduler/jobs', authenticateAdmin, whatsappSimpleController.getSchedulerJobs.bind(whatsappSimpleController));
router.post('/scheduler/custom', authenticateAdmin, whatsappSimpleController.scheduleCustomMessage.bind(whatsappSimpleController));
router.post('/scheduler/cancel', authenticateAdmin, whatsappSimpleController.cancelSchedulerJob.bind(whatsappSimpleController));
router.post('/scheduler/restart', authenticateAdmin, whatsappSimpleController.restartScheduler.bind(whatsappSimpleController));
router.post('/scheduler/categories', authenticateAdmin, whatsappSimpleController.sendCategoryMessages.bind(whatsappSimpleController));

/**
 * Webhook Routes
 */
router.get('/webhook', whatsappSimpleController.verifyWebhook.bind(whatsappSimpleController));
router.post('/webhook', whatsappSimpleController.handleWebhook.bind(whatsappSimpleController));

export default router;