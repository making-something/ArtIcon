import { Request, Response } from 'express';
import supabaseAdmin from '@/config/supabase';
import emailService from '@/services/email.service';
import whatsappService from '@/services/whatsapp.service';
import { NotificationInsert } from '@/types/database';

export class NotificationController {
  /**
   * Schedule a notification
   */
  async scheduleNotification(req: Request, res: Response): Promise<void> {
    try {
      const { message, scheduled_time, target_audience, target_ids } = req.body;

      if (!message || !scheduled_time || !target_audience) {
        res.status(400).json({
          success: false,
          message: 'Message, scheduled_time, and target_audience are required',
        });
        return;
      }

      // Validate target_audience
      const validTargets = ['all', 'winners', 'specific'];
      if (!validTargets.includes(target_audience)) {
        res.status(400).json({
          success: false,
          message: 'Invalid target_audience',
        });
        return;
      }

      // Validate target_ids if target_audience is 'specific'
      if (target_audience === 'specific' && (!target_ids || target_ids.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'target_ids are required when target_audience is specific',
        });
        return;
      }

      // Create notification
      const notificationData: NotificationInsert = {
        message,
        scheduled_time,
        target_audience,
        target_ids: target_audience === 'specific' ? target_ids : null,
        status: 'pending',
      };

      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to schedule notification',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Notification scheduled successfully',
        data: notification,
      });
    } catch (error) {
      console.error('Error in scheduleNotification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

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

      // Send notifications
      await Promise.allSettled([
        emailService.sendNotificationEmail(participants, message),
        whatsappService.sendNotificationMessage(participants, message),
      ]);

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

  /**
   * Process pending notifications (called by cron job)
   */
  async processPendingNotifications(_req: Request, res: Response): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Get pending notifications that are due
      const { data: notifications, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_time', now);

      if (error) {
        console.error('Error fetching pending notifications:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch pending notifications',
        });
        return;
      }

      if (!notifications || notifications.length === 0) {
        res.status(200).json({
          success: true,
          message: 'No pending notifications to process',
          data: { processed: 0 },
        });
        return;
      }

      // Process each notification
      const results = await Promise.allSettled(
        notifications.map(async (notification) => {
          try {
            // Get recipients
            let participants: any[] = [];

            if (notification.target_audience === 'all') {
              const { data } = await supabaseAdmin
                .from('participants')
                .select('*');
              participants = data || [];
            } else if (notification.target_audience === 'winners') {
              const { data } = await supabaseAdmin
                .from('winners')
                .select('participant:participants(*)');
              participants = data?.map((w: any) => w.participant).filter(Boolean) || [];
            } else if (notification.target_audience === 'specific' && notification.target_ids) {
              const { data } = await supabaseAdmin
                .from('participants')
                .select('*')
                .in('id', notification.target_ids);
              participants = data || [];
            }

            if (participants.length === 0) {
              throw new Error('No recipients found');
            }

            // Send notifications
            await Promise.allSettled([
              emailService.sendNotificationEmail(participants, notification.message),
              whatsappService.sendNotificationMessage(participants, notification.message),
            ]);

            // Update notification status
            await supabaseAdmin
              .from('notifications')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', notification.id);

            return { id: notification.id, status: 'success' };
          } catch (error) {
            console.error(`Error processing notification ${notification.id}:`, error);

            // Update notification status to failed
            await supabaseAdmin
              .from('notifications')
              .update({
                status: 'failed',
              })
              .eq('id', notification.id);

            return { id: notification.id, status: 'failed' };
          }
        })
      );

      const processed = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      res.status(200).json({
        success: true,
        message: 'Pending notifications processed',
        data: {
          total: notifications.length,
          processed,
          failed,
        },
      });
    } catch (error) {
      console.error('Error in processPendingNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new NotificationController();
