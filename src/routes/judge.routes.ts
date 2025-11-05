import { Router, IRouter } from 'express';
import judgeController from '@/controllers/judge.controller';
import { authenticateJudge } from '@/middleware/auth.middleware';

const router: IRouter = Router();

/**
 * @route   POST /api/judge/login
 * @desc    Judge login
 * @access  Public
 */
router.post('/login', judgeController.login.bind(judgeController));

/**
 * @route   GET /api/judge/profile
 * @desc    Get judge profile
 * @access  Judge
 */
router.get('/profile', authenticateJudge, judgeController.getProfile.bind(judgeController));

/**
 * @route   GET /api/judge/submissions
 * @desc    Get submissions assigned to the judge
 * @access  Judge
 */
router.get('/submissions', authenticateJudge, judgeController.getAssignedSubmissions.bind(judgeController));

/**
 * @route   GET /api/judge/submissions/:id
 * @desc    Get submission details by ID
 * @access  Judge
 */
router.get('/submissions/:id', authenticateJudge, judgeController.getSubmissionById.bind(judgeController));

/**
 * @route   GET /api/judge/statistics
 * @desc    Get judge statistics
 * @access  Judge
 */
router.get('/statistics', authenticateJudge, judgeController.getStatistics.bind(judgeController));

/**
 * @route   PUT /api/judge/password
 * @desc    Update judge password
 * @access  Judge
 */
router.put('/password', authenticateJudge, judgeController.updatePassword.bind(judgeController));

export default router;
