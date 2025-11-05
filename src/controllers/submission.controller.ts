import { Request, Response } from 'express';
import supabaseAdmin from '@/config/supabase';
import emailService from '@/services/email.service';
import whatsappService from '@/services/whatsapp.service';
import { SubmissionInsert } from '@/types/database';

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
      const { data: participant, error: participantError } = await supabaseAdmin
        .from('participants')
        .select('*')
        .eq('id', participant_id)
        .single();

      if (participantError || !participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found',
        });
        return;
      }

      // Validate task exists
      const { data: task, error: taskError } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('id', task_id)
        .single();

      if (taskError || !task) {
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
      const { data: existingSubmission } = await supabaseAdmin
        .from('submissions')
        .select('id')
        .eq('participant_id', participant_id)
        .eq('task_id', task_id)
        .single();

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

      const { data: submission, error } = await supabaseAdmin
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create submission',
        });
        return;
      }

      // Auto-assign to judge with least assignments
      await this.autoAssignJudge(submission.id);

      // Send confirmation notifications asynchronously
      Promise.all([
        emailService.sendSubmissionConfirmationEmail(participant),
        whatsappService.sendSubmissionConfirmationMessage(participant),
      ]).catch((error) => {
        console.error('Error sending notifications:', error);
      });

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

      const { data: submission, error } = await supabaseAdmin
        .from('submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !submission) {
        console.error('Update submission error:', error);
        res.status(404).json({
          success: false,
          message: error ? `Database error: ${error.message}` : 'Submission not found',
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

      const { data: submission, error } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          participant:participants(*),
          task:tasks(*),
          judge:judges(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !submission) {
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
      const { participant_id, task_id, judge_id, category } = req.query;

      let query = supabaseAdmin
        .from('submissions')
        .select(`
          *,
          participant:participants(*),
          task:tasks(*),
          judge:judges(id, name, email)
        `);

      if (participant_id) {
        query = query.eq('participant_id', participant_id);
      }

      if (task_id) {
        query = query.eq('task_id', task_id);
      }

      if (judge_id) {
        query = query.eq('judge_id', judge_id);
      }

      const { data: submissions, error } = await query.order('submitted_at', {
        ascending: false,
      });

      if (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch submissions',
        });
        return;
      }

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

      const { data: submissions, error } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('participant_id', participant_id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch submissions',
        });
        return;
      }

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
   * Get submissions assigned to a judge
   */
  async getByJudge(req: Request, res: Response): Promise<void> {
    try {
      const { judge_id } = req.params;

      const { data: submissions, error } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          participant:participants(*),
          task:tasks(*)
        `)
        .eq('judge_id', judge_id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch submissions',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      console.error('Error in getByJudge:', error);
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

      const { error } = await supabaseAdmin
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) {
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
      const { data: stats, error } = await supabaseAdmin
        .from('submission_statistics')
        .select('*');

      if (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch statistics',
        });
        return;
      }

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

  /**
   * Auto-assign submission to judge with least assignments
   */
  private async autoAssignJudge(submissionId: string): Promise<void> {
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

  /**
   * Manually reassign submission to a different judge
   */
  async reassignJudge(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { judge_id } = req.body;

      if (!judge_id) {
        res.status(400).json({
          success: false,
          message: 'judge_id is required',
        });
        return;
      }

      // Get current submission
      const { data: submission, error: submissionError } = await supabaseAdmin
        .from('submissions')
        .select('judge_id')
        .eq('id', id)
        .single();

      if (submissionError || !submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
        return;
      }

      // Validate new judge exists
      const { data: newJudge, error: judgeError } = await supabaseAdmin
        .from('judges')
        .select('*')
        .eq('id', judge_id)
        .single();

      if (judgeError || !newJudge) {
        res.status(404).json({
          success: false,
          message: 'Judge not found',
        });
        return;
      }

      const oldJudgeId = submission.judge_id;

      // Update submission
      const { data: updatedSubmission, error: updateError } = await supabaseAdmin
        .from('submissions')
        .update({ judge_id })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        res.status(500).json({
          success: false,
          message: 'Failed to reassign judge',
        });
        return;
      }

      // Update judge counts
      if (oldJudgeId) {
        await supabaseAdmin.rpc('decrement_judge_count', { judge_id: oldJudgeId });
      }
      await supabaseAdmin.rpc('increment_judge_count', { judge_id });

      res.status(200).json({
        success: true,
        message: 'Judge reassigned successfully',
        data: updatedSubmission,
      });
    } catch (error) {
      console.error('Error in reassignJudge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new SubmissionController();
