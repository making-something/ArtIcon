import { Request, Response } from 'express';
import { databaseService } from '@/services/database.service';
import { SubmissionInsert } from '@/types/database';
import db from '@/config/database';

export class SubmissionController {
  /**
   * Submit a task
   */
  async submit(req: Request, res: Response): Promise<void> {
    try {
      const { participant_id, task_id, drive_link } = req.body;

      // Validate required fields
      if (!participant_id || !task_id || !drive_link) {
        res.status(400).json({
          success: false,
          message: 'participant_id, task_id, and drive_link are required',
        });
        return;
      }

      // Validate participant exists
      const participant = await databaseService.getParticipantById(participant_id);

      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found',
        });
        return;
      }

      // Validate task exists
      const task = await databaseService.getTaskById(task_id);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      // Check if task category matches participant category
      if (task.category !== participant.category) {
        res.status(400).json({
          success: false,
          message: 'Task category does not match participant category',
        });
        return;
      }

      // Check if submission already exists
      const stmt = db.prepare('SELECT id FROM submissions WHERE participant_id = ? AND task_id = ?');
      const existingSubmission = stmt.get(participant_id, task_id);

      if (existingSubmission) {
        res.status(409).json({
          success: false,
          message: 'Submission already exists for this task',
        });
        return;
      }

      // Create submission
      const submissionData: SubmissionInsert = {
        participant_id,
        task_id,
        drive_link,
        preview_url: drive_link, // Can be processed later
      };

      const submission = await databaseService.createSubmission(submissionData);

      // Note: Submission confirmations are handled through the UI
      // No email notification needed for submissions

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission,
      });
    } catch (error) {
      console.error('Error in submit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update submission
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { drive_link, preview_url, score } = req.body;

      if (!drive_link) {
        res.status(400).json({
          success: false,
          message: 'drive_link is required',
        });
        return;
      }

      const updateData: any = {
        drive_link,
        submitted_at: new Date().toISOString(),
      };

      if (preview_url) {
        updateData.preview_url = preview_url;
      }

      if (score !== undefined) {
        updateData.score = score;
      }

      const submission = await databaseService.updateSubmission(id, updateData);

      if (!submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Submission updated successfully',
        data: submission,
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get submission by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await databaseService.getSubmissionById(id);

      if (!submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Error in getById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all submissions with filters
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { participant_id, task_id, category } = req.query;

      // Build base query
      let query = `
        SELECT
          s.*,
          p.id as participant_id, p.name as participant_name, p.email as participant_email,
          p.whatsapp_no as participant_whatsapp_no, p.category as participant_category, p.city as participant_city,
          p.portfolio_url as participant_portfolio_url, p.portfolio_file_path as participant_portfolio_file_path,
          p.is_present as participant_is_present, p.role as participant_role, p.experience as participant_experience,
          p.organization as participant_organization, p.specialization as participant_specialization, p.source as participant_source,
          p.password_hash as participant_password_hash, p.created_at as participant_created_at, p.updated_at as participant_updated_at,
          t.id as task_id, t.category as task_category, t.title as task_title, t.description as task_description,
          t.created_at as task_created_at, t.updated_at as task_updated_at
        FROM submissions s
        LEFT JOIN participants p ON s.participant_id = p.id
        LEFT JOIN tasks t ON s.task_id = t.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (participant_id) {
        query += ' AND s.participant_id = ?';
        params.push(participant_id);
      }

      if (task_id) {
        query += ' AND s.task_id = ?';
        params.push(task_id);
      }

      query += ' ORDER BY s.submitted_at DESC';

      const stmt = db.prepare(query);
      const rows = stmt.all(...params) as any[];

      const submissions = rows.map(row => ({
        id: row.id,
        participant_id: row.participant_id,
        task_id: row.task_id,
        drive_link: row.drive_link,
        submitted_at: row.submitted_at,
        preview_url: row.preview_url,
        score: row.score,
        created_at: row.created_at,
        updated_at: row.updated_at,
        participant: {
          id: row.participant_id,
          name: row.participant_name,
          email: row.participant_email,
          whatsapp_no: row.participant_whatsapp_no,
          category: row.participant_category,
          city: row.participant_city,
          portfolio_url: row.participant_portfolio_url,
          portfolio_file_path: row.participant_portfolio_file_path,
          is_present: !!row.participant_is_present,
          role: row.participant_role,
          experience: row.participant_experience,
          organization: row.participant_organization,
          specialization: row.participant_specialization,
          source: row.participant_source,
          password_hash: row.participant_password_hash,
          created_at: row.participant_created_at,
          updated_at: row.participant_updated_at,
        },
        task: {
          id: row.task_id,
          category: row.task_category,
          title: row.task_title,
          description: row.task_description,
          created_at: row.task_created_at,
          updated_at: row.task_updated_at,
        },
      }));

      // Filter by category if provided
      let filteredSubmissions = submissions;
      if (category) {
        filteredSubmissions = submissions.filter(
          (sub: any) => sub.participant?.category === category
        );
      }

      res.status(200).json({
        success: true,
        data: filteredSubmissions,
        count: filteredSubmissions.length,
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get submissions for a participant
   */
  async getByParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { participant_id } = req.params;

      const stmt = db.prepare(`
        SELECT
          s.*,
          t.* as task_data
        FROM submissions s
        LEFT JOIN tasks t ON s.task_id = t.id
        WHERE s.participant_id = ?
        ORDER BY s.submitted_at DESC
      `);

      const rows = stmt.all(participant_id) as any[];

      const submissions = rows.map(row => ({
        id: row.id,
        participant_id: row.participant_id,
        task_id: row.task_id,
        drive_link: row.drive_link,
        submitted_at: row.submitted_at,
        preview_url: row.preview_url,
        score: row.score,
        created_at: row.created_at,
        updated_at: row.updated_at,
        task: {
          id: row.task_id,
          category: row.category,
          title: row.title,
          description: row.description,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
      }));

      res.status(200).json({
        success: true,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      console.error('Error in getByParticipant:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  
  /**
   * Delete submission
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await databaseService.deleteSubmission(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Submission deleted successfully',
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get submission statistics
   */
  async getStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await databaseService.getSubmissionStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error in getStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new SubmissionController();
