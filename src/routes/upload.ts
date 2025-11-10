import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import supabaseAdmin from '@/config/supabase';
import googleDriveService from '@/services/google-drive.service';

const router: Router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (_req, file, cb) => {
    // Validate file type
    const validation = googleDriveService.validateFile(file);
    if (!validation.isValid) {
      return cb(new Error(validation.error || 'Invalid file type'));
    }
    cb(null, true);
  },
});

/**
 * Upload file and create submission
 */
import { authenticateParticipant } from '@/middleware/auth.middleware';

router.post('/submit', authenticateParticipant, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { task_id } = req.body;

    const participant_id = req.user?.id;

    if (!participant_id) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: participant token required',
      });
    }

    if (!participant_id || !task_id) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'participant_id and task_id are required',
      });
    }

    // Validate participant exists and get category
    const { data: participant, error: participantError } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('id', participant_id)
      .single();

    if (participantError || !participant) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Participant not found',
      });
    }

    // Validate task exists
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task category matches participant category
    if (task.category !== participant.category) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Task category does not match participant category',
      });
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('participant_id', participant_id)
      .eq('task_id', task_id)
      .single();

    if (existingSubmission) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({
        success: false,
        message: 'Submission already exists for this task',
      });
    }

    // Check if Google Drive is configured
    if (!googleDriveService.isConfigured()) {
      fs.unlinkSync(req.file.path);
      return res.status(503).json({
        success: false,
        message: 'Google Drive service not configured. Please contact administrator.',
      });
    }

    // Upload to Google Drive
    const driveResult = await googleDriveService.uploadFile(
      req.file,
      participant.name,
      participant.category,
      task.title
    );

    // Create submission
    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        participant_id,
        task_id,
        drive_link: driveResult.webViewLink,
        preview_url: driveResult.previewUrl,
      })
      .select(`
        *,
        participant:participants(*),
        task:tasks(*)
      `)
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create submission',
      });
    }

    // Auto-assign to judge with least assignments
    await autoAssignJudge(submission.id);

    return res.status(201).json({
      success: true,
      message: 'File uploaded and submission created successfully',
      data: {
        submission,
        driveInfo: {
          fileId: driveResult.fileId,
          webViewLink: driveResult.webViewLink,
          previewUrl: driveResult.previewUrl,
        },
      },
    });
  } catch (error) {
    console.error('Error in upload submission:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Validate existing Google Drive link and generate preview
 */
router.post('/validate-link', async (req, res) => {
  try {
    const { drive_link } = req.body;

    if (!drive_link) {
      return res.status(400).json({
        success: false,
        message: 'drive_link is required',
      });
    }

    const validation = await googleDriveService.validateAndGeneratePreview(drive_link);

    return res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Error validating link:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * Auto-assign submission to judge with least assignments
 */
async function autoAssignJudge(submissionId: string): Promise<void> {
  try {
    // Get judge with least assignments
    const { data: judges, error: judgeError } = await supabaseAdmin
      .from('judges')
      .select('*')
      .order('assigned_count', { ascending: true })
      .limit(1);

    if (judgeError || !judges || judges.length === 0) {
      console.error('No judges available for assignment');
      return;
    }

    const selectedJudge = judges[0];

    // Assign submission to judge
    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({ judge_id: selectedJudge.id })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error assigning judge:', updateError);
      return;
    }

    // Increment judge's assigned count
    await supabaseAdmin
      .from('judges')
      .update({ assigned_count: selectedJudge.assigned_count + 1 })
      .eq('id', selectedJudge.id);

    console.log(`Submission ${submissionId} assigned to judge ${selectedJudge.name}`);
  } catch (error) {
    console.error('Error in autoAssignJudge:', error);
  }
}

export default router;