import axios from 'axios';
import { Participant } from '@/types/database';

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private apiUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    this.isConfigured = !!(this.phoneNumberId && this.accessToken);

    if (!this.isConfigured) {
      console.warn('⚠️  WhatsApp credentials not configured. WhatsApp notifications will be logged only.');
    } else {
      console.log('✅ WhatsApp service configured');
    }
  }

  /**
   * Send a WhatsApp message to a single recipient
   */
  async sendMessage(to: string, message: string): Promise<void> {
    try {
      if (!this.isConfigured) {
        console.log(`📱 [WHATSAPP LOG] To: ${to}`);
        console.log(`   Message: ${message.substring(0, 100)}...`);
        return;
      }

      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`✅ WhatsApp message sent successfully to ${to}:`, response.data);
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
      // Don't throw error to prevent server crash
      console.error('   Message delivery failed but continuing...');
    }
  }

  /**
   * Send bulk WhatsApp messages
   */
  async sendBulkMessages(recipients: { phone: string; message: string }[]): Promise<void> {
    try {
      const promises = recipients.map((recipient) =>
        this.sendMessage(recipient.phone, recipient.message)
      );

      await Promise.allSettled(promises);
      console.log(`Bulk WhatsApp messages sent: ${recipients.length} messages`);
    } catch (error) {
      console.error('Error sending bulk WhatsApp messages:', error);
      throw new Error('Failed to send bulk WhatsApp messages');
    }
  }

  /**
   * Send registration confirmation WhatsApp message
   */
  async sendRegistrationMessage(participant: Participant): Promise<void> {
    const message = `🎉 *Registration Confirmed!*

Hi ${participant.name}! 👋

Welcome to *Articon Hackathon 2025*!

📋 *Your Details:*
• Category: ${this.formatCategory(participant.category)}
• City: ${participant.city}

📅 *Event Info:*
• Date: November 15, 2025
• Time: 9:00 AM onwards

⏰ You'll see a countdown timer until the event starts. Once it begins, you can access your tasks!

We'll notify you when the event starts! 🚀

Good luck! 💪`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Send event start notification WhatsApp message
   */
  async sendEventStartMessage(participant: Participant): Promise<void> {
    const message = `🚀 *Event Started!*

Hi ${participant.name}! 🎯

The *Articon Hackathon 2025* has officially begun!

⏰ Your tasks are now available!

📝 *Next Steps:*
1. Login to your dashboard
2. View your assigned tasks
3. Start working on submissions
4. Submit before the deadline

Category: ${this.formatCategory(participant.category)}

Show us your best work! 💪

Good luck! 🏆`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Send custom notification WhatsApp message
   */
  async sendNotificationMessage(participants: Participant[], message: string): Promise<void> {
    const recipients = participants.map((participant) => ({
      phone: participant.whatsapp_no,
      message: `📢 *Articon Hackathon - Update*

Hi ${participant.name}! 👋

${message}

Stay tuned for more updates! 🚀`,
    }));

    await this.sendBulkMessages(recipients);
  }

  /**
   * Send winner announcement WhatsApp message
   */
  async sendWinnerMessage(
    participant: Participant,
    position: number,
    category: string
  ): Promise<void> {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[position - 1] || '🏆';

    const message = `${medal} *CONGRATULATIONS!* ${medal}

Hi ${participant.name}! 🎉

You're a *WINNER* of Articon Hackathon 2025!

🏆 *Position:* ${position}
📂 *Category:* ${this.formatCategory(category as any)}

Your exceptional work has earned you this amazing achievement!

We were incredibly impressed by your creativity and skill! 👏

Stay connected for prize distribution details! 🎁

Congratulations once again! 🌟`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Send submission confirmation WhatsApp message
   */
  async sendSubmissionConfirmationMessage(participant: Participant): Promise<void> {
    const message = `✅ *Submission Received!*

Hi ${participant.name}! 👋

Great news! We've successfully received your submission for *Articon Hackathon 2025*.

🔍 Your work is now being reviewed by our judges.

📊 *What's Next:*
• Judges will review all submissions
• Results will be announced soon
• Keep an eye on your messages for updates

Thank you for participating! 🙏

Good luck! 🍀`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Send reminder message
   */
  async sendReminderMessage(participant: Participant, reminderText: string): Promise<void> {
    const message = `⏰ *Reminder*

Hi ${participant.name}! 👋

${reminderText}

*Articon Hackathon 2025*

Don't forget to submit your work! ⚡`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Send task assigned message
   */
  async sendTaskAssignedMessage(participant: Participant, taskTitle: string): Promise<void> {
    const message = `📝 *New Task Assigned!*

Hi ${participant.name}! 👋

A new task has been assigned to you:

*Task:* ${taskTitle}
*Category:* ${this.formatCategory(participant.category)}

Login to your dashboard to view the full details and start working on it!

Good luck! 💪`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

  /**
   * Format phone number for WhatsApp (must include country code without + or 00)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If number starts with 0, remove it (assuming Indian number)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If number doesn't start with country code, add 91 (India)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    return cleaned;
  }

  /**
   * Format category name
   */
  private formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      video: 'Video Editing',
      ui_ux: 'UI/UX Design',
      graphics: 'Graphic Design',
    };
    return categoryMap[category] || category;
  }

  /**
   * Verify webhook (for Meta webhook setup)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      return challenge;
    }

    console.log('Webhook verification failed');
    return null;
  }

  /**
   * Handle incoming webhook messages
   */
  async handleWebhook(body: any): Promise<void> {
    try {
      if (body.object !== 'whatsapp_business_account') {
        return;
      }

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        return;
      }

      // Handle status updates
      if (value.statuses) {
        console.log('Message status update:', value.statuses);
      }

      // Handle incoming messages
      if (value.messages) {
        const message = value.messages[0];
        console.log('Received message:', message);
        // You can add logic here to handle incoming messages if needed
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }
}

export default new WhatsAppService();
