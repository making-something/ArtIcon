import { Router, IRouter } from 'express';
import submissionController from '@/controllers/submission.controller';

const router: IRouter = Router();

/**
 * @route   POST /api/submissions
 * @desc    Submit a task
 * @access  Public
 */
router.post('/', submissionController.submit.bind(submissionController));

/**
 * @route   PUT /api/submissions/:id
 * @desc    Update submission
 * @access  Public/Participant
 */
router.put('/:id', submissionController.update.bind(submissionController));

/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @access  Public
 */
router.get('/:id', submissionController.getById.bind(submissionController));

/**
 * @route   GET /api/submissions
 * @desc    Get all submissions with filters
 * @access  Public/Admin
 */
router.get('/', submissionController.getAll.bind(submissionController));

/**
 * @route   GET /api/submissions/participant/:participant_id
 * @desc    Get submissions for a specific participant
 * @access  Public
 */
router.get('/participant/:participant_id', submissionController.getByParticipant.bind(submissionController));

/**
 * @route   GET /api/submissions/judge/:judge_id
 * @desc    Get submissions assigned to a judge
 * @access  Admin/Judge
 */
router.get('/judge/:judge_id', submissionController.getByJudge.bind(submissionController));

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete submission
 * @access  Admin
 */
router.delete('/:id', submissionController.delete.bind(submissionController));

/**
 * @route   GET /api/submissions/stats/all
 * @desc    Get submission statistics
 * @access  Public/Admin
 */
router.get('/stats/all', submissionController.getStatistics.bind(submissionController));

/**
 * @route   PATCH /api/submissions/:id/reassign
 * @desc    Reassign submission to a different judge
 * @access  Admin
 */
router.patch('/:id/reassign', submissionController.reassignJudge.bind(submissionController));

export default router;
