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
router.post("/create", adminController.createAdmin.bind(adminController));

/**
 * @route   POST /api/admin/judges
 * @desc    Create judge account
 * @access  Admin
 */
router.post(
  "/judges",
  authenticateAdmin,
  adminController.createJudge.bind(adminController),
);

/**
 * @route   GET /api/admin/judges
 * @desc    Get all judges
 * @access  Admin
 */
router.get(
  "/judges",
  authenticateAdmin,
  adminController.getAllJudges.bind(adminController),
);

/**
 * @route   DELETE /api/admin/judges/:id
 * @desc    Delete judge
 * @access  Admin
 */
router.delete(
  "/judges/:id",
  authenticateAdmin,
  adminController.deleteJudge.bind(adminController),
);

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

export default router;
