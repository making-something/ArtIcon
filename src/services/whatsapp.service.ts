import axios from 'axios';
import { supabaseAdmin } from '@/config/supabase';
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
  interactive?: {
    type: 'button' | 'list';
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      button?: string;
      buttons?: any[];
      sections?: any[];
    };
  };
}

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private apiUrl: string;
  private businessAccountId: string;
  private isConfigured: boolean;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    this.isConfigured = !!(this.phoneNumberId && this.accessToken);

    if (!this.isConfigured) {
      console.warn('⚠️  WhatsApp credentials not configured. Messages will be logged only.');
    } else {
      console.log('✅ WhatsApp service configured');
    }
  }

  /**
   * Send a simple text message
   */
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      if (!this.isConfigured) {
        console.log(`📱 [WHATSAPP LOG] To: ${formattedNumber}`);
        console.log(`   Message: ${message}`);
        console.log(`   Phone Number ID (sender): ${this.phoneNumberId}`);
        return true;
      }

      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: formattedNumber,
        type: 'text',
        text: {
          body: message,
        },
      };

      console.log(`📱 [WHATSAPP API CALL]`);
      console.log(`   Original input: ${phoneNumber}`);
      console.log(`   Formatted recipient: ${formattedNumber}`);
      console.log(`   Sender Phone ID: ${this.phoneNumberId}`);

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`✅ WhatsApp message sent to ${phoneNumber}:`, response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send a template message (for users who haven't opted in yet)
   */
  async sendTemplateMessage(phoneNumber: string, templateName: string, variables: string[] = []): Promise<boolean> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      if (!this.isConfigured) {
        console.log(`📱 [WHATSAPP LOG - TEMPLATE] To: ${formattedNumber}`);
        console.log(`   Template: ${templateName}`);
        console.log(`   Variables:`, variables);
        return true;
      }

      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: formattedNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components: variables.length > 0 ? [
            {
              type: 'body',
              parameters: variables.map(variable => ({
                type: 'text',
                text: variable
              }))
            }
          ] : []
        }
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`✅ Template message sent to ${phoneNumber}:`, response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending template message:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send message to participant by email (find their WhatsApp number)
   */
  async sendMessageToParticipant(email: string, message: string): Promise<boolean> {
    try {
      const { data: participant, error } = await supabaseAdmin
        .from('participants')
        .select('whatsapp_no, name')
        .eq('email', email)
        .single();

      if (error || !participant) {
        console.error(`❌ Participant not found with email: ${email}`);
        return false;
      }

      return await this.sendMessage(participant.whatsapp_no, message);
    } catch (error) {
      console.error('❌ Error sending message to participant:', error);
      return false;
    }
  }

  /**
   * Send message to all participants in a category
   */
  async sendMessageToCategory(category: string, message: string): Promise<number> {
    try {
      const { data: participants, error } = await supabaseAdmin
        .from('participants')
        .select('whatsapp_no, name')
        .eq('category', category);

      if (error) {
        console.error('❌ Error fetching participants:', error);
        return 0;
      }

      let successCount = 0;
      for (const participant of participants || []) {
        const success = await this.sendMessage(participant.whatsapp_no, message);
        if (success) successCount++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Sent ${successCount}/${participants?.length} messages to ${category} category`);
      return successCount;
    } catch (error) {
      console.error('❌ Error sending category messages:', error);
      return 0;
    }
  }

  /**
   * Send message to all participants
   */
  async sendMessageToAll(message: string): Promise<number> {
    try {
      const { data: participants, error } = await supabaseAdmin
        .from('participants')
        .select('whatsapp_no, name');

      if (error) {
        console.error('❌ Error fetching participants:', error);
        return 0;
      }

      let successCount = 0;
      for (const participant of participants || []) {
        const success = await this.sendMessage(participant.whatsapp_no, message);
        if (success) successCount++;

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Sent ${successCount}/${participants?.length} messages to all participants`);
      return successCount;
    } catch (error) {
      console.error('❌ Error sending bulk messages:', error);
      return 0;
    }
  }

  /**
   * Send bulk messages to specific phone numbers
   */
  async sendBulkMessages(recipients: { phone: string; message: string }[]): Promise<number> {
    let successCount = 0;

    for (const recipient of recipients) {
      const success = await this.sendMessage(recipient.phone, recipient.message);
      if (success) successCount++;

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Sent ${successCount}/${recipients.length} bulk messages`);
    return successCount;
  }

  /**
   * Legacy methods for backward compatibility
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

  async sendWinnerMessage(participant: Participant, position: number, category: string): Promise<void> {
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

  async sendReminderMessage(participant: Participant, reminderText: string): Promise<void> {
    const message = `⏰ *Reminder*

Hi ${participant.name}! 👋

${reminderText}

*Articon Hackathon 2025*

Don't forget to submit your work! ⚡`;

    await this.sendMessage(participant.whatsapp_no, message);
  }

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
   * Handle webhook events
   */
  async handleWebhook(body: any): Promise<void> {
    try {
      if (body.object !== 'whatsapp_business_account') return;

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) return;

      // Log incoming messages for monitoring
      if (value.messages) {
        const message = value.messages[0];
        console.log(`📱 Incoming message from ${message.from}: ${message.type}`);
      }

      // Log status updates
      if (value.statuses) {
        value.statuses.forEach((status: any) => {
          console.log(`📊 Message status: ${status.id} - ${status.status}`);
        });
      }
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
    }
  }

  /**
   * Verify webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verified successfully');
      return challenge;
    }

    console.log('❌ Webhook verification failed');
    return null;
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

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
   * Get participant list for admin
   */
  async getParticipants(category?: string): Promise<any[]> {
    try {
      let query = supabaseAdmin
        .from('participants')
        .select('id, name, email, whatsapp_no, category, city, created_at');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      return [];
    }
  }

  /**
   * Check if service is ready
   */
  isServiceReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Get service status
   */
  getServiceStatus(): any {
    return {
      configured: this.isConfigured,
      phoneNumberId: this.phoneNumberId ? 'Set' : 'Not set',
      hasAccessToken: !!this.accessToken,
      businessAccountId: this.businessAccountId ? 'Set' : 'Not set',
      apiUrl: this.apiUrl
    };
  }
}

export default new WhatsAppService();
