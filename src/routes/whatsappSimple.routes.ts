import { Router } from 'express';
import whatsappSimpleController from '@/controllers/whatsappSimple.controller';

const router: Router = Router();

/**
 * Admin Messaging Routes
 */
router.post('/send/phone', whatsappSimpleController.sendMessageToPhone.bind(whatsappSimpleController));
router.post('/send/participant', whatsappSimpleController.sendMessageToParticipant.bind(whatsappSimpleController));
router.post('/send/category', whatsappSimpleController.sendMessageToCategory.bind(whatsappSimpleController));
router.post('/send/all', whatsappSimpleController.sendMessageToAll.bind(whatsappSimpleController));
router.post('/send/bulk', whatsappSimpleController.sendBulkMessages.bind(whatsappSimpleController));
router.post('/test', whatsappSimpleController.testMessage.bind(whatsappSimpleController));

/**
 * Management Routes
 */
router.get('/participants', whatsappSimpleController.getParticipants.bind(whatsappSimpleController));
router.get('/status', whatsappSimpleController.getServiceStatus.bind(whatsappSimpleController));

/**
 * Scheduler Management Routes
 */
router.get('/scheduler/jobs', whatsappSimpleController.getSchedulerJobs.bind(whatsappSimpleController));
router.post('/scheduler/custom', whatsappSimpleController.scheduleCustomMessage.bind(whatsappSimpleController));
router.post('/scheduler/cancel', whatsappSimpleController.cancelSchedulerJob.bind(whatsappSimpleController));
router.post('/scheduler/restart', whatsappSimpleController.restartScheduler.bind(whatsappSimpleController));
router.post('/scheduler/categories', whatsappSimpleController.sendCategoryMessages.bind(whatsappSimpleController));

/**
 * Webhook Routes
 */
router.get('/webhook', whatsappSimpleController.verifyWebhook.bind(whatsappSimpleController));
router.post('/webhook', whatsappSimpleController.handleWebhook.bind(whatsappSimpleController));

export default router;