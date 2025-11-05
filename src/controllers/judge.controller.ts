import { Request, Response } from 'express';
import supabaseAdmin from '@/config/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/jwt';

export class JudgeController {
  /**
   * Judge login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // Get judge by email
      const { data: judge, error } = await supabaseAdmin
        .from('judges')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !judge) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, judge.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const token = signToken(
        { id: judge.id, email: judge.email, role: 'judge' },
        process.env.JWT_EXPIRES_IN || '7d'
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          judge: {
            id: judge.id,
            name: judge.name,
            email: judge.email,
            assigned_count: judge.assigned_count,
          },
        },
      });
    } catch (error) {
      console.error('Error in judge login:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get judge profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const judgeId = (req as any).user?.id;

      if (!judgeId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { data: judge, error } = await supabaseAdmin
        .from('judges')
        .select('id, name, email, assigned_count, created_at')
        .eq('id', judgeId)
        .single();

      if (error || !judge) {
        res.status(404).json({
          success: false,
          message: 'Judge not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: judge,
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get submissions assigned to the judge
   */
  async getAssignedSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const judgeId = (req as any).user?.id;

      if (!judgeId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { data: submissions, error } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          participant:participants(*),
          task:tasks(*)
        `)
        .eq('judge_id', judgeId)
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
      console.error('Error in getAssignedSubmissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get submission details by ID (only if assigned to this judge)
   */
  async getSubmissionById(req: Request, res: Response): Promise<void> {
    try {
      const judgeId = (req as any).user?.id;
      const { id } = req.params;

      if (!judgeId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { data: submission, error } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          participant:participants(*),
          task:tasks(*)
        `)
        .eq('id', id)
        .eq('judge_id', judgeId)
        .single();

      if (error || !submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found or not assigned to you',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Error in getSubmissionById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get statistics for the judge
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const judgeId = (req as any).user?.id;

      if (!judgeId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get judge info
      const { data: judge } = await supabaseAdmin
        .from('judges')
        .select('assigned_count')
        .eq('id', judgeId)
        .single();

      // Get submissions count
      const { count: totalAssigned } = await supabaseAdmin
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('judge_id', judgeId);

      // Get submissions by category
      const { data: submissions } = await supabaseAdmin
        .from('submissions')
        .select(`
          id,
          participant:participants(category)
        `)
        .eq('judge_id', judgeId);

      const categoryBreakdown: Record<string, number> = {
        video: 0,
        ui_ux: 0,
        graphics: 0,
      };

      submissions?.forEach((sub: any) => {
        const category = sub.participant?.category;
        if (category && categoryBreakdown[category] !== undefined) {
          categoryBreakdown[category]++;
        }
      });

      res.status(200).json({
        success: true,
        data: {
          totalAssigned: totalAssigned || 0,
          assignedCount: judge?.assigned_count || 0,
          categoryBreakdown,
        },
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
   * Update judge password
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const judgeId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!judgeId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
        });
        return;
      }

      // Get judge
      const { data: judge, error: fetchError } = await supabaseAdmin
        .from('judges')
        .select('password_hash')
        .eq('id', judgeId)
        .single();

      if (fetchError || !judge) {
        res.status(404).json({
          success: false,
          message: 'Judge not found',
        });
        return;
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, judge.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabaseAdmin
        .from('judges')
        .update({ password_hash: newPasswordHash })
        .eq('id', judgeId);

      if (updateError) {
        console.error('Error updating password:', updateError);
        res.status(500).json({
          success: false,
          message: 'Failed to update password',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      console.error('Error in updatePassword:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new JudgeController();
