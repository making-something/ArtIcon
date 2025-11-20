import { Request, Response } from 'express';
import supabaseAdmin from '@/config/supabase';
import emailService from '@/services/email.service';
import { NotificationInsert } from '@/types/database';

export class NotificationController {
  /**
   * Send immediate notification
   */
  async sendImmediateNotification(req: Request, res: Response): Promise<void> {
    try {
      const { message, target_audience, target_ids } = req.body;

      if (!message || !target_audience) {
        res.status(400).json({
          success: false,
          message: 'Message and target_audience are required',
        });
        return;
      }

      // Get recipients based on target_audience
      let participants: any[] = [];

      if (target_audience === 'all') {
        const { data, error } = await supabaseAdmin
          .from('participants')
          .select('*');

        if (error) {
          throw error;
        }
        participants = data || [];
      } else if (target_audience === 'winners') {
        const { data, error } = await supabaseAdmin
          .from('winners')
          .select('participant:participants(*)');

        if (error) {
          throw error;
        }
        participants = data?.map((w: any) => w.participant).filter(Boolean) || [];
      } else if (target_audience === 'specific') {
        if (!target_ids || target_ids.length === 0) {
          res.status(400).json({
            success: false,
            message: 'target_ids are required when target_audience is specific',
          });
          return;
        }

        const { data, error } = await supabaseAdmin
          .from('participants')
          .select('*')
          .in('id', target_ids);

        if (error) {
          throw error;
        }
        participants = data || [];
      }

      if (participants.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No recipients found',
        });
        return;
      }

      // Send email notifications
      // Note: Individual emails should be sent per participant
      for (const participant of participants) {
        await emailService.sendEmail({
          to: participant.email,
          subject: '📢 Articon Hackathon Update',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hi ${participant.name}! 👋</h2>
              <p>${message}</p>
              <p style="color: #6c757d; font-size: 14px;">
                Stay tuned for more updates! 🚀
              </p>
            </div>
          `,
          text: `Hi ${participant.name}!\n\n${message}\n\nStay tuned for more updates! 🚀`,
        });
      }

      // Log notification
      const notificationData: NotificationInsert = {
        message,
        scheduled_time: new Date().toISOString(),
        target_audience,
        target_ids: target_audience === 'specific' ? target_ids : null,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };

      await supabaseAdmin
        .from('notifications')
        .insert(notificationData);

      res.status(200).json({
        success: true,
        message: 'Notifications sent successfully',
        data: {
          recipientCount: participants.length,
        },
      });
    } catch (error) {
      console.error('Error in sendImmediateNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all notifications
   */
  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;

      let query = supabaseAdmin.from('notifications').select('*');

      if (status) {
        query = query.eq('status', status);
      }

      const { data: notifications, error } = await query.order('scheduled_time', {
        ascending: false,
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch notifications',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error('Error in getNotificationById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update notification
   */
  async updateNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { message, scheduled_time, status } = req.body;

      const updateData: any = {};
      if (message) updateData.message = message;
      if (scheduled_time) updateData.scheduled_time = scheduled_time;
      if (status) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one field is required to update',
        });
        return;
      }

      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        data: notification,
      });
    } catch (error) {
      console.error('Error in updateNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

}

export default new NotificationController();
