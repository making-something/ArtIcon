import { Router, IRouter } from "express";
import participantController from "@/controllers/participant.controller";
import {
	authenticateAdmin,
	authenticateParticipant,
} from "@/middleware/auth.middleware";

const router: IRouter = Router();

/**
 * @route   POST /api/participants/register
 * @desc    Register a new participant
 * @access  Public
 */
router.post(
	"/register",
	participantController.register.bind(participantController)
);

/**
 * @route   POST /api/participants/login
 * @desc    Login participant
 * @access  Public
 */
router.post("/login", participantController.login.bind(participantController));

/**
 * @route   POST /api/participants/change-password
 * @desc    Change participant password
 * @access  Private
 */
router.post(
	"/change-password",
	authenticateParticipant,
	participantController.changePassword.bind(participantController)
);

/**
 * @route   POST /api/participants/forgot-password
 * @desc    Reset password and send to email
 * @access  Public
 */
router.post(
	"/forgot-password",
	participantController.forgotPassword.bind(participantController)
);

/**
 * @route   GET /api/participants/event-status
 * @desc    Check if event has started
 * @access  Public
 */
router.get(
	"/event-status",
	participantController.checkEventStatus.bind(participantController)
);

/**
 * @route   GET /api/participants/:id
 * @desc    Get participant by ID
 * @access  Public
 */
router.get("/:id", participantController.getById.bind(participantController));

/**
 * @route   GET /api/participants/email/:email
 * @desc    Get participant by email
 * @access  Public
 */
router.get(
	"/email/:email",
	participantController.getByEmail.bind(participantController)
);

/**
 * @route   GET /api/participants
 * @desc    Get all participants
 * @access  Public
 */
router.get("/", participantController.getAll.bind(participantController));

/**
 * @route   GET /api/participants/:id/tasks
 * @desc    Get tasks for a participant based on their category
 * @access  Public
 */
router.get(
	"/:id/tasks",
	participantController.getTasks.bind(participantController)
);

/**
 * @route   GET /api/participants/statistics
 * @desc    Get participant statistics
 * @access  Public
 */
router.get(
	"/stats/all",
	participantController.getStatistics.bind(participantController)
);

/**
 * @route   PATCH /api/participants/:id/presence
 * @desc    Update participant presence status
 * @access  Admin only (should be protected in production)
 */
router.patch(
	"/:id/presence",
	authenticateAdmin,
	participantController.updatePresence.bind(participantController)
);

/**
 * @route   PATCH /api/participants/:id/profile
 * @desc    Update participant profile (name, city, category - not email/phone)
 * @access  Private (Participant only, can only update own profile)
 */
router.patch(
	"/:id/profile",
	authenticateParticipant,
	participantController.updateProfile.bind(participantController)
);

/**
 * @route   POST /api/participants/:id/scan-qr
 * @desc    Scan QR code to mark attendance
 * @access  Public (should be authenticated via QR code in production)
 */
router.post(
	"/:id/scan-qr",
	participantController.scanQRCode.bind(participantController)
);

export default router;
