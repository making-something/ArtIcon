import { Request, Response } from 'express';
import supabaseAdmin from '@/config/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/jwt';
import { AdminInsert, JudgeInsert, TaskInsert, WinnerInsert } from '@/types/database';

export class AdminController {
  /**
   * Admin login
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

      // Get admin by email
      const { data: admin, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !admin) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const token = signToken(
        { id: admin.id, email: admin.email, role: 'admin' },
        process.env.JWT_EXPIRES_IN || '7d'
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
          },
        },
      });
    } catch (error) {
      console.error('Error in admin login:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create admin account
   */
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // Check if admin already exists
      const { data: existingAdmin } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('email', email)
        .single();

      if (existingAdmin) {
        res.status(409).json({
          success: false,
          message: 'Admin already exists',
        });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin
      const adminData: AdminInsert = {
        email,
        password_hash: passwordHash,
      };

      const { data: admin, error } = await supabaseAdmin
        .from('admins')
        .insert(adminData)
        .select()
        .single();

      if (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create admin',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          id: admin.id,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Error in createAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create judge account
   */
  async createJudge(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email and password are required',
        });
        return;
      }

      // Check if judge already exists
      const { data: existingJudge } = await supabaseAdmin
        .from('judges')
        .select('id')
        .eq('email', email)
        .single();

      if (existingJudge) {
        res.status(409).json({
          success: false,
          message: 'Judge already exists',
        });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create judge
      const judgeData: JudgeInsert = {
        name,
        email,
        password_hash: passwordHash,
        assigned_count: 0,
      };

      const { data: judge, error } = await supabaseAdmin
        .from('judges')
        .insert(judgeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating judge:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create judge',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Judge created successfully',
        data: {
          id: judge.id,
          name: judge.name,
          email: judge.email,
        },
      });
    } catch (error) {
      console.error('Error in createJudge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all judges
   */
  async getAllJudges(_req: Request, res: Response): Promise<void> {
    try {
      const { data: judges, error } = await supabaseAdmin
        .from('judges')
        .select('id, name, email, assigned_count, created_at')
        .order('assigned_count', { ascending: true });

      if (error) {
        console.error('Error fetching judges:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch judges',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: judges,
        count: judges.length,
      });
    } catch (error) {
      console.error('Error in getAllJudges:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete judge
   */
  async deleteJudge(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('judges')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(404).json({
          success: false,
          message: 'Judge not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Judge deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteJudge:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create task
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { category, title, description } = req.body;

      if (!category || !title || !description) {
        res.status(400).json({
          success: false,
          message: 'Category, title and description are required',
        });
        return;
      }

      // Validate category
      const validCategories = ['video', 'ui_ux', 'graphics'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category',
        });
        return;
      }

      // Create task
      const taskData: TaskInsert = {
        category,
        title,
        description,
      };

      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create task',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      console.error('Error in createTask:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update task
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title && !description) {
        res.status(400).json({
          success: false,
          message: 'At least one field (title or description) is required',
        });
        return;
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;

      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      console.error('Error in updateTask:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete task
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteTask:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all tasks
   */
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      let query = supabaseAdmin.from('tasks').select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data: tasks, error } = await query.order('created_at', {
        ascending: true,
      });

      if (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch tasks',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Announce winner
   */
  async announceWinner(req: Request, res: Response): Promise<void> {
    try {
      const { participant_id, position, category, announcement_text } = req.body;

      if (!participant_id || !position || !category || !announcement_text) {
        res.status(400).json({
          success: false,
          message: 'All fields are required',
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

      // Check if winner already exists
      const { data: existingWinner } = await supabaseAdmin
        .from('winners')
        .select('id')
        .eq('participant_id', participant_id)
        .eq('category', category)
        .single();

      if (existingWinner) {
        res.status(409).json({
          success: false,
          message: 'Winner already announced for this category',
        });
        return;
      }

      // Create winner
      const winnerData: WinnerInsert = {
        participant_id,
        position,
        category,
        announcement_text,
      };

      const { data: winner, error } = await supabaseAdmin
        .from('winners')
        .insert(winnerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating winner:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to announce winner',
        });
        return;
      }

      // Note: Winner email functionality can be added back if needed
      // For now, winners will be managed through the admin panel

      res.status(201).json({
        success: true,
        message: 'Winner announced successfully',
        data: winner,
      });
    } catch (error) {
      console.error('Error in announceWinner:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all winners
   */
  async getAllWinners(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      let query = supabaseAdmin
        .from('winners')
        .select(`
          *,
          participant:participants(*)
        `);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: winners, error } = await query.order('position', {
        ascending: true,
      });

      if (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch winners',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: winners,
        count: winners.length,
      });
    } catch (error) {
      console.error('Error in getAllWinners:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete winner
   */
  async deleteWinner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('winners')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(404).json({
          success: false,
          message: 'Winner not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Winner deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteWinner:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update event settings
   */
  async updateEventSettings(req: Request, res: Response): Promise<void> {
    try {
      const { key, value } = req.body;

      if (!key || !value) {
        res.status(400).json({
          success: false,
          message: 'Key and value are required',
        });
        return;
      }

      // Check if setting exists
      const { data: existingSetting } = await supabaseAdmin
        .from('event_settings')
        .select('id')
        .eq('key', key)
        .single();

      let setting;
      let error;

      if (existingSetting) {
        // Update existing setting
        const result = await supabaseAdmin
          .from('event_settings')
          .update({ value })
          .eq('key', key)
          .select()
          .single();
        setting = result.data;
        error = result.error;
      } else {
        // Create new setting
        const result = await supabaseAdmin
          .from('event_settings')
          .insert({ key, value })
          .select()
          .single();
        setting = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error updating event settings:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update event settings',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event settings updated successfully',
        data: setting,
      });
    } catch (error) {
      console.error('Error in updateEventSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get event settings
   */
  async getEventSettings(_req: Request, res: Response): Promise<void> {
    try {
      const { data: settings, error } = await supabaseAdmin
        .from('event_settings')
        .select('*');

      if (error) {
        console.error('Error fetching event settings:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch event settings',
        });
        return;
      }

      // Convert array to object for easier access
      const settingsObject: any = {};
      settings.forEach((setting) => {
        settingsObject[setting.key] = setting.value;
      });

      res.status(200).json({
        success: true,
        data: settingsObject,
      });
    } catch (error) {
      console.error('Error in getEventSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      // Get total participants
      const { count: totalParticipants } = await supabaseAdmin
        .from('participants')
        .select('*', { count: 'exact', head: true });

      // Get present participants
      const { count: presentParticipants } = await supabaseAdmin
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('is_present', true);

      // Get total submissions
      const { count: totalSubmissions } = await supabaseAdmin
        .from('submissions')
        .select('*', { count: 'exact', head: true });

      // Get category breakdown
      const { data: categoryStats } = await supabaseAdmin
        .from('participant_statistics')
        .select('*');

      // Get submission statistics
      const { data: submissionStats } = await supabaseAdmin
        .from('submission_statistics')
        .select('*');

      res.status(200).json({
        success: true,
        data: {
          totalParticipants: totalParticipants || 0,
          presentParticipants: presentParticipants || 0,
          totalSubmissions: totalSubmissions || 0,
          categoryStats: categoryStats || [],
          submissionStats: submissionStats || [],
        },
      });
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all participants with their portfolio information
   */
  async getAllParticipantsWithPortfolios(req: Request, res: Response): Promise<void> {
    try {
      const { category, page = 1, limit = 50, search } = req.query;

      let query = supabaseAdmin
        .from('participants')
        .select('id, name, email, whatsapp_no, category, city, portfolio_url, portfolio_file_path, role, experience, organization, specialization, source, is_present, created_at', { count: 'exact' });

      // Filter by category if provided
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Search filter
      if (search && typeof search === 'string') {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: participants, error, count } = await query;

      if (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch participants',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: participants,
        pagination: {
          total: count || 0,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil((count || 0) / limitNum),
        },
      });
    } catch (error) {
      console.error('Error in getAllParticipantsWithPortfolios:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new AdminController();
