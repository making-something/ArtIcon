import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/jwt';
import { databaseService } from '@/services/database.service';
import { AdminInsert, TaskInsert } from '@/types/database';

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
      const admin = await databaseService.getAdminByEmail(email);

      if (!admin) {
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
      const existingAdmin = await databaseService.getAdminByEmail(email);

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

      const admin = await databaseService.createAdmin(adminData);

      if (!admin) {
        console.error('Error creating admin');
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

      const task = await databaseService.createTask(taskData);

      if (!task) {
        console.error('Error creating task');
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

      const task = await databaseService.updateTask(id, updateData);

      if (!task) {
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

      const success = await databaseService.deleteTask(id);

      if (!success) {
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

      const tasks = await databaseService.getAllTasks(category as any);

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
      const participant = await databaseService.getParticipantById(participant_id);

      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found',
        });
        return;
      }

      // Check if winner already exists for this category
      const existingWinners = await databaseService.getAllWinners(category);
      const existingWinner = existingWinners.find(w => w.participant_id === participant_id);

      if (existingWinner) {
        res.status(409).json({
          success: false,
          message: 'Winner already announced for this category',
        });
        return;
      }

      // Create winner
      const winner = await databaseService.createWinner({
        participant_id,
        position,
        category,
        announcement_text,
      });

      if (!winner) {
        console.error('Error creating winner');
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

      const winners = await databaseService.getAllWinners(category as any);

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

      const success = await databaseService.deleteWinner(id);

      if (!success) {
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

      const setting = await databaseService.updateEventSetting(key, value);

      if (!setting) {
        console.error('Error updating event settings');
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
      const settings = await databaseService.getEventSettings();

      res.status(200).json({
        success: true,
        data: settings,
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
      const stats = await databaseService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
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

      const filters: any = {};
      if (category && category !== 'all') {
        filters.category = category as any;
      }
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      if (page && limit) {
        filters.page = parseInt(page as string);
        filters.limit = parseInt(limit as string);
      }

      const { participants, total } = await databaseService.getParticipants(filters);

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      res.status(200).json({
        success: true,
        data: participants,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
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
