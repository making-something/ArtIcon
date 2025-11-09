import { Request, Response } from 'express';
import whatsappService from '@/services/whatsapp.service';

export class WhatsAppController {
  /**
   * Verify webhook endpoint
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

  /**
   * Handle webhook events
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      await whatsappService.handleWebhook(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Webhook handling error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Send opt-in request to a phone number
   */
  async sendOptInRequest(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, participantName } = req.body;

      if (!phoneNumber) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
      }

      const message = `🎉 Welcome to Articon Hackathon 2025!\n\nHi ${participantName || 'Participant'}! 👋\n\nYour registration has been received. You'll receive updates about the event here.\n\nGood luck! 🏆`;
      await whatsappService.sendMessage(phoneNumber, message);

      res.status(200).json({
        message: 'Opt-in request sent successfully',
        phoneNumber
      });
    } catch (error) {
      console.error('❌ Error sending opt-in request:', error);
      res.status(500).json({ error: 'Failed to send opt-in request' });
    }
  }

  /**
   * Generate QR code for opt-in
   */
  async generateOptInQR(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
      }

      const qrData = {
      qrCode: `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=Hi! I'd like to opt-in to Articon Hackathon updates.`,
      deepLink: `https://wa.me/${phoneNumber.replace(/\D/g, '')}`
    };

      res.status(200).json(qrData);
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }

  /**
   * Send text message to opted-in user
   */
  async sendTextMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        res.status(400).json({ error: 'Phone number and message are required' });
        return;
      }

      await whatsappService.sendMessage(phoneNumber, message);

      res.status(200).json({
        message: 'Text message sent successfully',
        phoneNumber
      });
    } catch (error) {
      console.error('❌ Error sending text message:', error);
      res.status(500).json({ error: 'Failed to send text message' });
    }
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, templateName, variables } = req.body;

      if (!phoneNumber || !templateName) {
        res.status(400).json({ error: 'Phone number and template name are required' });
        return;
      }

      await whatsappService.sendTemplateMessage(phoneNumber, templateName, variables || []);

      res.status(200).json({
        message: 'Template message sent successfully',
        phoneNumber,
        templateName
      });
    } catch (error) {
      console.error('❌ Error sending template message:', error);
      res.status(500).json({ error: 'Failed to send template message' });
    }
  }

  /**
   * Send interactive list message
   */
  async sendListMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, title, description, buttonText, sections } = req.body;

      if (!phoneNumber || !title || !description || !buttonText || !sections) {
        res.status(400).json({
          error: 'Phone number, title, description, buttonText, and sections are required'
        });
        return;
      }

      // Convert list to simple text message for basic implementation
      const listText = `${title}\n\n${description}\n\n${sections.map((section: any, idx: number) =>
        `${idx + 1}. ${section.title}\n   ${section.description || ''}`
      ).join('\n\n')}`;

      await whatsappService.sendMessage(phoneNumber, listText);

      res.status(200).json({
        message: 'List message sent successfully',
        phoneNumber
      });
    } catch (error) {
      console.error('❌ Error sending list message:', error);
      res.status(500).json({ error: 'Failed to send list message' });
    }
  }

  /**
   * Get opt-in link
   */
  async getOptInLink(req: Request, res: Response): Promise<void> {
    try {
      const { customMessage } = req.query;

      const optInLink = `https://wa.me/?text=${encodeURIComponent(customMessage as string || 'Hi! I\'d like to opt-in to Articon Hackathon updates.')}`;

      res.status(200).json({
        optInLink,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(optInLink)}`
      });
    } catch (error) {
      console.error('❌ Error generating opt-in link:', error);
      res.status(500).json({ error: 'Failed to generate opt-in link' });
    }
  }
}

export default new WhatsAppController();