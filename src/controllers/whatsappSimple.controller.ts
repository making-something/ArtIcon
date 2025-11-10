import { Request, Response } from 'express';
import whatsappService from '@/services/whatsapp.service';
import whatsappSchedulerService from '@/services/whatsappScheduler.service';

export class WhatsAppSimpleController {
  /**
   * Send message to specific phone number
   */
  async sendMessageToPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        res.status(400).json({ error: 'Phone number and message are required' });
        return;
      }

      const success = await whatsappService.sendMessage(phoneNumber, message);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Message sent successfully',
          phoneNumber
        });
      } else {
        res.status(500).json({ error: 'Failed to send message' });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send message to participant by email
   */
  async sendMessageToParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { email, message } = req.body;

      if (!email || !message) {
        res.status(400).json({ error: 'Email and message are required' });
        return;
      }

      const success = await whatsappService.sendMessageToParticipant(email, message);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Message sent to participant',
          email
        });
      } else {
        res.status(404).json({ error: 'Participant not found or message failed' });
      }
    } catch (error) {
      console.error('❌ Error sending message to participant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send message to all participants in a category
   */
  async sendMessageToCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category, message } = req.body;

      if (!category || !message) {
        res.status(400).json({ error: 'Category and message are required' });
        return;
      }

      const sentCount = await whatsappService.sendMessageToCategory(category, message);

      res.status(200).json({
        success: true,
        message: `Message sent to ${sentCount} participants in ${category} category`,
        sentCount,
        category
      });
    } catch (error) {
      console.error('❌ Error sending category message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send message to all participants
   */
  async sendMessageToAll(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const sentCount = await whatsappService.sendMessageToAll(message);

      res.status(200).json({
        success: true,
        message: `Message sent to ${sentCount} participants`,
        sentCount
      });
    } catch (error) {
      console.error('❌ Error sending bulk message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send bulk messages to specific recipients
   */
  async sendBulkMessages(req: Request, res: Response): Promise<void> {
    try {
      const { recipients } = req.body;

      if (!recipients || !Array.isArray(recipients)) {
        res.status(400).json({ error: 'Recipients array is required' });
        return;
      }

      const sentCount = await whatsappService.sendBulkMessages(recipients);

      res.status(200).json({
        success: true,
        message: `Sent ${sentCount}/${recipients.length} messages`,
        sentCount,
        total: recipients.length
      });
    } catch (error) {
      console.error('❌ Error sending bulk messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get participants list for admin
   */
  async getParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      const participants = await whatsappService.getParticipants(category as string);

      res.status(200).json({
        success: true,
        participants,
        count: participants.length
      });
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get WhatsApp service status
   */
  async getServiceStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = whatsappService.getServiceStatus();

      res.status(200).json({
        success: true,
        status
      });
    } catch (error) {
      console.error('❌ Error getting service status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Test WhatsApp message
   */
  async testMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        res.status(400).json({ error: 'Phone number is required for test' });
        return;
      }

      const testMessage = `🧪 Test message from Articon Admin Dashboard
Time: ${new Date().toLocaleString()}
Status: WhatsApp service is working correctly! ✅`;

      const success = await whatsappService.sendMessage(phoneNumber, testMessage);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Test message sent successfully',
          phoneNumber
        });
      } else {
        res.status(500).json({ error: 'Test message failed' });
      }
    } catch (error) {
      console.error('❌ Error sending test message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Scheduler Management Methods
   */
  async getSchedulerJobs(_req: Request, res: Response): Promise<void> {
    try {
      const jobs = whatsappSchedulerService.getScheduledJobs();

      res.status(200).json({
        success: true,
        jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('❌ Error getting scheduler jobs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async scheduleCustomMessage(req: Request, res: Response): Promise<void> {
    try {
      const { name, cronExpression, message, targetType, targetValue } = req.body;

      if (!name || !cronExpression || !message || !targetType) {
        res.status(400).json({ error: 'Name, cronExpression, message, and targetType are required' });
        return;
      }

      const success = await whatsappSchedulerService.scheduleCustomMessage(
        name,
        cronExpression,
        message,
        targetType,
        targetValue
      );

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Custom message scheduled successfully',
          name
        });
      } else {
        res.status(400).json({ error: 'Failed to schedule message (job may already exist)' });
      }
    } catch (error) {
      console.error('❌ Error scheduling custom message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelSchedulerJob(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Job name is required' });
        return;
      }

      const success = whatsappSchedulerService.cancelJob(name);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Job cancelled successfully',
          name
        });
      } else {
        res.status(404).json({ error: 'Job not found' });
      }
    } catch (error) {
      console.error('❌ Error cancelling job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async restartScheduler(_req: Request, res: Response): Promise<void> {
    try {
      whatsappSchedulerService.restartAllJobs();

      res.status(200).json({
        success: true,
        message: 'WhatsApp scheduler restarted successfully'
      });
    } catch (error) {
      console.error('❌ Error restarting scheduler:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async sendCategoryMessages(_req: Request, res: Response): Promise<void> {
    try {
      await whatsappSchedulerService.sendMessageToCategories();

      res.status(200).json({
        success: true,
        message: 'Category messages sent successfully'
      });
    } catch (error) {
      console.error('❌ Error sending category messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Webhook handlers
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const result = whatsappService.verifyWebhook(mode, token, challenge);

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      await whatsappService.handleWebhook(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Webhook handling error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

export default new WhatsAppSimpleController();