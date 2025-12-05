import { Router, IRouter } from "express";
import adminController from "@/controllers/admin.controller";
import { authenticateAdmin } from "@/middleware/auth.middleware";

const router: IRouter = Router();

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post("/login", adminController.login.bind(adminController));

/**
 * @route   POST /api/admin/create
 * @desc    Create admin account
 * @access  Public (should be restricted in production)
 */
router.post("/create", authenticateAdmin, adminController.createAdmin.bind(adminController));


/**
 * @route   POST /api/admin/tasks
 * @desc    Create task
 * @access  Admin
 */
router.post(
  "/tasks",
  authenticateAdmin,
  adminController.createTask.bind(adminController),
);

/**
 * @route   PUT /api/admin/tasks/:id
 * @desc    Update task
 * @access  Admin
 */
router.put(
  "/tasks/:id",
  authenticateAdmin,
  adminController.updateTask.bind(adminController),
);

/**
 * @route   DELETE /api/admin/tasks/:id
 * @desc    Delete task
 * @access  Admin
 */
router.delete(
  "/tasks/:id",
  authenticateAdmin,
  adminController.deleteTask.bind(adminController),
);

/**
 * @route   GET /api/admin/tasks
 * @desc    Get all tasks
 * @access  Admin
 */
router.get(
  "/tasks",
  authenticateAdmin,
  adminController.getAllTasks.bind(adminController),
);

/**
 * @route   POST /api/admin/winners
 * @desc    Announce winner
 * @access  Admin
 */
router.post(
  "/winners",
  authenticateAdmin,
  adminController.announceWinner.bind(adminController),
);

/**
 * @route   GET /api/admin/winners
 * @desc    Get all winners
 * @access  Admin
 */
router.get(
  "/winners",
  authenticateAdmin,
  adminController.getAllWinners.bind(adminController),
);

/**
 * @route   DELETE /api/admin/winners/:id
 * @desc    Delete winner
 * @access  Admin
 */
router.delete(
  "/winners/:id",
  authenticateAdmin,
  adminController.deleteWinner.bind(adminController),
);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update event settings
 * @access  Admin
 */
router.put(
  "/settings",
  authenticateAdmin,
  adminController.updateEventSettings.bind(adminController),
);

/**
 * @route   GET /api/admin/settings
 * @desc    Get event settings
 * @access  Admin
 */
router.get(
  "/settings",
  authenticateAdmin,
  adminController.getEventSettings.bind(adminController),
);

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get(
  "/dashboard/stats",
  authenticateAdmin,
  adminController.getDashboardStats.bind(adminController),
);

/**
 * @route   GET /api/admin/participants/portfolios
 * @desc    Get all participants with their portfolio information
 * @access  Admin
 */
router.get(
  "/participants/portfolios",
  authenticateAdmin,
  adminController.getAllParticipantsWithPortfolios.bind(adminController),
);

/**
 * @route   PUT /api/admin/participants/:id/approve
 * @desc    Approve participant portfolio
 * @access  Admin
 */
router.put(
  "/participants/:id/approve",
  authenticateAdmin,
  adminController.approveParticipant.bind(adminController),
);

/**
 * @route   PUT /api/admin/participants/:id/reject
 * @desc    Reject participant portfolio
 * @access  Admin
 */
router.put(
  "/participants/:id/reject",
  authenticateAdmin,
  adminController.rejectParticipant.bind(adminController),
);

/**
 * @route   PUT /api/admin/participants/:id/status
 * @desc    Update participant approval status (approved/rejected/pending)
 * @access  Admin
 */
router.put(
  "/participants/:id/status",
  authenticateAdmin,
  adminController.updateParticipantStatus.bind(adminController),
);

/**
 * @route   DELETE /api/admin/participants/:id
 * @desc    Delete participant
 * @access  Admin
 */
router.delete(
  "/participants/:id",
  authenticateAdmin,
  adminController.deleteParticipant.bind(adminController),
);

/**
 * @route   GET /api/admin/participants/export/csv
 * @desc    Export participants data as CSV
 * @access  Admin
 */
router.get(
  "/participants/export/csv",
  authenticateAdmin,
  adminController.exportParticipantsCSV.bind(adminController),
);

/**
 * @route   POST /api/admin/updates
 * @desc    Send live update
 * @access  Admin
 */
router.post(
  "/updates",
  authenticateAdmin,
  adminController.sendUpdate.bind(adminController),
);

export default router;
