import { Router, IRouter } from 'express';
import participantController from '@/controllers/participant.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';

const router: IRouter = Router();

/**
 * @route   POST /api/participants/register
 * @desc    Register a new participant
 * @access  Public
 */
router.post('/register', participantController.register.bind(participantController));

/**
 * @route   POST /api/participants/login
 * @desc    Login participant
 * @access  Public
 */
router.post('/login', participantController.login.bind(participantController));

/**
 * @route   GET /api/participants/event-status
 * @desc    Check if event has started
 * @access  Public
 */
router.get('/event-status', participantController.checkEventStatus.bind(participantController));

/**
 * @route   GET /api/participants/:id
 * @desc    Get participant by ID
 * @access  Public
 */
router.get('/:id', participantController.getById.bind(participantController));

/**
 * @route   GET /api/participants/email/:email
 * @desc    Get participant by email
 * @access  Public
 */
router.get('/email/:email', participantController.getByEmail.bind(participantController));

/**
 * @route   GET /api/participants
 * @desc    Get all participants
 * @access  Public
 */
router.get('/', participantController.getAll.bind(participantController));

/**
 * @route   GET /api/participants/:id/tasks
 * @desc    Get tasks for a participant based on their category
 * @access  Public
 */
router.get('/:id/tasks', participantController.getTasks.bind(participantController));

/**
 * @route   GET /api/participants/statistics
 * @desc    Get participant statistics
 * @access  Public
 */
router.get('/stats/all', participantController.getStatistics.bind(participantController));

/**
 * @route   PATCH /api/participants/:id/presence
 * @desc    Update participant presence status
 * @access  Admin only (should be protected in production)
 */
router.patch('/:id/presence', authenticateAdmin, participantController.updatePresence.bind(participantController));

/**
 * @route   POST /api/participants/:id/send-optin
 * @desc    Send WhatsApp opt-in message to participant
 * @access  Admin
 */
router.post('/:id/send-optin', authenticateAdmin, participantController.sendOptInMessage.bind(participantController));

export default router;
