import { Router, IRouter } from 'express';
import notificationController from '@/controllers/notification.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';

const router: IRouter = Router();

/**
 * @route   POST /api/notifications/send
 * @desc    Send immediate notification
 * @access  Admin
 */
router.post('/send', authenticateAdmin, notificationController.sendImmediateNotification.bind(notificationController));

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Admin
 */
router.get('/', authenticateAdmin, notificationController.getAllNotifications.bind(notificationController));

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Admin
 */
router.get('/:id', authenticateAdmin, notificationController.getNotificationById.bind(notificationController));

/**
 * @route   PUT /api/notifications/:id
 * @desc    Update notification
 * @access  Admin
 */
router.put('/:id', authenticateAdmin, notificationController.updateNotification.bind(notificationController));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Admin
 */
router.delete('/:id', authenticateAdmin, notificationController.deleteNotification.bind(notificationController));

export default router;
