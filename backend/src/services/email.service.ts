import { Participant } from '@/types/database';
import { transporter, fromEmail, isAwsConfigured } from './email-transport';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  /**
   * Send email with comprehensive error handling and logging
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const { to, subject, html, text, attachments, replyTo } = options;

      if (!isAwsConfigured) {
        console.log(`📧 [EMAIL LOG] To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Content: ${text || html.replace(/<[^>]*>/g, '').substring(0, 100)}...`);
        console.log(`   Attachments: ${attachments?.length || 0}`);
        return { success: true, messageId: 'mock-id' };
      }

      const mailOptions = {
        from: fromEmail,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        attachments: attachments || [],
        replyTo: replyTo || fromEmail,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`   Message ID: ${result.messageId}`);

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      console.error('   To:', options.to);
      console.error('   Subject:', options.subject);

      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Send registration confirmation email with professional template
   */
  async sendRegistrationEmail(participant: Participant): Promise<EmailResult> {
    const html = this.generateRegistrationTemplate(participant);
    const text = this.generateRegistrationText(participant);

    return await this.sendEmail({
      to: participant.email,
      subject: '🎉 Registration Confirmed - Articon Hackathon 2025',
      html,
      text,
    });
  }

  /**
   * Send portfolio selection email
   */
  async sendPortfolioSelectedEmail(participant: Participant, eventDate: Date): Promise<EmailResult> {
    const html = this.generatePortfolioSelectedTemplate(participant, eventDate);
    const text = this.generatePortfolioSelectedText(participant, eventDate);

    return await this.sendEmail({
      to: participant.email,
      subject: '🎉 Portfolio Selected - Articon Hackathon 2025',
      html,
      text,
    });
  }

  /**
   * Send portfolio rejection email
   */
  async sendPortfolioRejectedEmail(participant: Participant): Promise<EmailResult> {
    const html = this.generatePortfolioRejectedTemplate(participant);
    const text = this.generatePortfolioRejectedText(participant);

    return await this.sendEmail({
      to: participant.email,
      subject: 'Articon Hackathon 2025 - Portfolio Update',
      html,
      text,
    });
  }

  /**
   * Send event reminder (1 day before)
   */
  async sendEventReminderEmail(participant: Participant, eventDate: Date): Promise<EmailResult> {
    const html = this.generateEventReminderTemplate(participant, eventDate);
    const text = this.generateEventReminderText(participant, eventDate);

    return await this.sendEmail({
      to: participant.email,
      subject: '⏰ Reminder: Articon Hackathon Tomorrow!',
      html,
      text,
    });
  }

  /**
   * Send custom email to admin
   */
  async sendAdminNotification(subject: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<EmailResult> {
    const priorityColors = { low: '#28a745', medium: '#ffc107', high: '#dc3545' };
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: ${priorityColors[priority]}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Admin Notification</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Priority: ${priority.toUpperCase()}</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <div style="background-color: #f1f3f4; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #555; white-space: pre-wrap;">${message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="margin: 0; color: #888; font-size: 14px;">
              This is an automated notification from the Articon Hackathon system.
            </p>
            <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: 'admin@articon.com',
      subject: `[${priority.toUpperCase()}] ${subject}`,
      html,
      text: `${subject}\n\n${message}\n\nSent: ${new Date().toLocaleString()}`,
    });
  }

  // Template generators
  private generateRegistrationTemplate(participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to Articon 2025!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your registration is confirmed</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #667eea; margin-top: 0;">Hello ${participant.name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for registering for the <strong>Articon Hackathon 2025</strong>. We're excited to have you join us!</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #495057;">Your Registration Details:</h3>
            <ul style="color: #6c757d; line-height: 1.8;">
              <li><strong>Category:</strong> ${this.formatCategory(participant.category)}</li>
              <li><strong>City:</strong> ${participant.city}</li>
              <li><strong>Email:</strong> ${participant.email}</li>
            </ul>
          </div>

          <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">📅 Event Information:</h4>
            <p style="margin-bottom: 0;">
              <strong>Date:</strong> November 15, 2025<br>
              <strong>Time:</strong> 9:00 AM onwards<br>
              <strong>Platform:</strong> Online Dashboard
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.com/dashboard" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Stay tuned for updates! We'll notify you when the event starts.<br>
            Good luck with the competition! 🏆
          </p>
        </div>
      </div>
    `;
  }

  private generateRegistrationText(participant: Participant): string {
    return `
Welcome to Articon Hackathon 2025!

Hello ${participant.name},

Thank you for registering for the Articon Hackathon 2025. Your registration is confirmed!

Registration Details:
- Category: ${this.formatCategory(participant.category)}
- City: ${participant.city}
- Email: ${participant.email}

Event Information:
- Date: November 15, 2025
- Time: 9:00 AM onwards
- Platform: Online Dashboard

Access your dashboard at: https://articon.com/dashboard

Stay tuned for updates! We'll notify you when the event starts.

Good luck! 🏆
    `;
  }

  private generatePortfolioSelectedTemplate(participant: Participant, eventDate: Date): string {
    const eventDateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const eventTimeStr = eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🎉 You're Selected!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your portfolio has been approved</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #667eea; margin-top: 0;">Congratulations ${participant.name}! 🎊</h2>
          <p style="font-size: 16px; line-height: 1.6;">Your portfolio impressed us! You're officially selected for <strong>Articon Hackathon 2025</strong>.</p>

          <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">📅 Event Details:</h4>
            <p style="margin-bottom: 0;">
              <strong>Date:</strong> ${eventDateStr}<br>
              <strong>Time:</strong> ${eventTimeStr}<br>
              <strong>Category:</strong> ${this.formatCategory(participant.category)}
            </p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">⏳ Please Wait:</h4>
            <p style="margin-bottom: 0; color: #856404;">
              The event will start at the scheduled time. Please check your email for a QR code that you'll need to scan at the event for attendance.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.com/dashboard" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            We can't wait to see what you create! 🚀
          </p>
        </div>
      </div>
    `;
  }

  private generatePortfolioSelectedText(participant: Participant, eventDate: Date): string {
    const eventDateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const eventTimeStr = eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
🎉 You're Selected! - Articon Hackathon 2025

Congratulations ${participant.name}!

Your portfolio impressed us! You're officially selected for Articon Hackathon 2025.

Event Details:
- Date: ${eventDateStr}
- Time: ${eventTimeStr}
- Category: ${this.formatCategory(participant.category)}

Please Wait:
The event will start at the scheduled time. Please check your email for a QR code that you'll need to scan at the event for attendance.

Access your dashboard: https://articon.com/dashboard

We can't wait to see what you create! 🚀
    `;
  }

  private generatePortfolioRejectedTemplate(participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Articon Hackathon 2025</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Portfolio Review Update</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #495057; margin-top: 0;">Hello ${participant.name},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest in <strong>Articon Hackathon 2025</strong>.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #495057; line-height: 1.8;">
              After careful review of all portfolios, we regret to inform you that your portfolio is currently under review. Please allow 2-3 business days for a final decision. We received an overwhelming number of applications and the selection process is highly competitive.
            </p>
          </div>

          <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">💡 We Encourage You:</h4>
            <ul style="margin-bottom: 0; color: #495057; line-height: 1.8;">
              <li>Keep building your portfolio</li>
              <li>Participate in future events</li>
              <li>Stay connected with our community</li>
            </ul>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Thank you for your understanding. We wish you all the best in your creative journey! ✨
          </p>
        </div>
      </div>
    `;
  }

  private generatePortfolioRejectedText(participant: Participant): string {
    return `
Articon Hackathon 2025 - Portfolio Review Update

Hello ${participant.name},

Thank you for your interest in Articon Hackathon 2025.

After careful review of all portfolios, we regret to inform you that your portfolio is currently under review. Please allow 2-3 business days for a final decision. We received an overwhelming number of applications and the selection process is highly competitive.

We Encourage You:
- Keep building your portfolio
- Participate in future events
- Stay connected with our community

Thank you for your understanding. We wish you all the best in your creative journey! ✨
    `;
  }

  private generateEventReminderTemplate(participant: Participant, eventDate: Date): string {
    const eventDateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const eventTimeStr = eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">⏰ Event Tomorrow!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Don't forget about Articon Hackathon</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #f5576c; margin-top: 0;">Hi ${participant.name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6;">This is a friendly reminder that <strong>Articon Hackathon 2025</strong> starts tomorrow!</p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">📅 Event Details:</h4>
            <p style="margin-bottom: 0;">
              <strong>Date:</strong> ${eventDateStr}<br>
              <strong>Time:</strong> ${eventTimeStr}<br>
              <strong>Category:</strong> ${this.formatCategory(participant.category)}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #495057;">✅ Preparation Checklist:</h4>
            <ul style="margin-bottom: 0; color: #6c757d; line-height: 1.8;">
              <li>Keep your QR code ready for attendance scanning</li>
              <li>Ensure your tools and software are ready</li>
              <li>Have your login credentials handy</li>
              <li>Get a good night's rest!</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.com/dashboard" style="background-color: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View Dashboard
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            See you tomorrow! Best of luck! 🍀
          </p>
        </div>
      </div>
    `;
  }

  private generateEventReminderText(participant: Participant, eventDate: Date): string {
    const eventDateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const eventTimeStr = eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
⏰ Event Tomorrow! - Articon Hackathon 2025

Hi ${participant.name}!

This is a friendly reminder that Articon Hackathon 2025 starts tomorrow!

Event Details:
- Date: ${eventDateStr}
- Time: ${eventTimeStr}
- Category: ${this.formatCategory(participant.category)}

Preparation Checklist:
- Keep your QR code ready for attendance scanning
- Ensure your tools and software are ready
- Have your login credentials handy
- Get a good night's rest!

Dashboard: https://articon.com/dashboard

See you tomorrow! Best of luck! 🍀
    `;
  }

  private formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      video: 'Video Editing',
      ui_ux: 'UI/UX Design',
      graphics: 'Graphic Design',
    };
    return categoryMap[category] || category;
  }

  /**
   * Check email service status
   */
  getServiceStatus() {
    return {
      configured: isAwsConfigured,
      fromEmail,
      provider: isAwsConfigured ? 'AWS SES' : 'Mock/Legacy',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test email functionality
   */
  async testEmail(toEmail: string): Promise<EmailResult> {
    return await this.sendEmail({
      to: toEmail,
      subject: '🧪 Test Email - Articon Hackathon System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>🧪 Test Email</h2>
          <p>This is a test email from the Articon Hackathon system.</p>
          <p>If you received this, the email service is working correctly! ✅</p>
          <hr style="margin: 20px 0;">
          <small style="color: #666;">
            Sent: ${new Date().toLocaleString()}<br>
            Provider: ${isAwsConfigured ? 'AWS SES' : 'Mock'}
          </small>
        </div>
      `,
      text: `Test Email\n\nThis is a test email from the Articon Hackathon system.\nIf you received this, the email service is working correctly! ✅\n\nSent: ${new Date().toLocaleString()}\nProvider: ${isAwsConfigured ? 'AWS SES' : 'Mock'}`
    });
  }
}

export default new EmailService();
