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
   * Send event start notification
   */
  async sendEventStartEmail(participant: Participant): Promise<EmailResult> {
    const html = this.generateEventStartTemplate(participant);
    const text = this.generateEventStartText(participant);

    return await this.sendEmail({
      to: participant.email,
      subject: '🚀 Articon Hackathon 2025 - Event Started!',
      html,
      text,
    });
  }

  /**
   * Send notification email to multiple participants
   */
  async sendNotificationEmail(
    participants: Participant[],
    message: string,
    subject: string = '📢 Articon Hackathon Update'
  ): Promise<EmailResult[]> {
    const promises = participants.map(participant => {
      const html = this.generateNotificationTemplate(participant, message);
      const text = this.generateNotificationText(participant, message);

      return this.sendEmail({
        to: participant.email,
        subject,
        html,
        text,
      });
    });

    return await Promise.all(promises);
  }

  /**
   * Send winner congratulations email
   */
  async sendWinnerEmail(
    participant: Participant,
    position: number,
    category: string,
    prizeDescription?: string
  ): Promise<EmailResult> {
    const html = this.generateWinnerTemplate(participant, position, category, prizeDescription);
    const text = this.generateWinnerText(participant, position, category, prizeDescription);

    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[position - 1] || '🏆';

    return await this.sendEmail({
      to: participant.email,
      subject: `${medal} Congratulations! You Won at Articon Hackathon 2025`,
      html,
      text,
    });
  }

  /**
   * Send submission confirmation email
   */
  async sendSubmissionConfirmationEmail(
    participant: Participant,
    taskTitle?: string
  ): Promise<EmailResult> {
    const html = this.generateSubmissionTemplate(participant, taskTitle);
    const text = this.generateSubmissionText(participant, taskTitle);

    return await this.sendEmail({
      to: participant.email,
      subject: '✅ Submission Received - Articon Hackathon 2025',
      html,
      text,
    });
  }

  /**
   * Send deadline reminder email
   */
  async sendDeadlineReminderEmail(participant: Participant, deadline: Date): Promise<EmailResult> {
    const html = this.generateDeadlineReminderTemplate(participant, deadline);
    const text = this.generateDeadlineReminderText(participant, deadline);

    return await this.sendEmail({
      to: participant.email,
      subject: '⏰ Deadline Reminder - Articon Hackathon 2025',
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

  private generateEventStartTemplate(participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🚀 Event Started!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Articon Hackathon 2025 is now live</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #f5576c; margin-top: 0;">Let's Go ${participant.name}! 🎯</h2>
          <p style="font-size: 16px; line-height: 1.6;">The <strong>Articon Hackathon 2025</strong> has officially begun! Your tasks are now available in the dashboard.</p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">⏰ What's Next:</h4>
            <ol style="margin-bottom: 0; color: #856404; line-height: 1.8;">
              <li>Login to your dashboard</li>
              <li>View your assigned tasks</li>
              <li>Start working on submissions</li>
              <li>Submit before the deadline</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.com/dashboard" style="background-color: #f5576c; color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              View My Tasks
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Category: ${this.formatCategory(participant.category)}<br>
            Show us your best work! 💪
          </p>
        </div>
      </div>
    `;
  }

  private generateEventStartText(participant: Participant): string {
    return `
🚀 Articon Hackathon 2025 - Event Started!

Hi ${participant.name}!

The Articon Hackathon 2025 has officially begun! Your tasks are now available.

What's Next:
1. Login to your dashboard
2. View your assigned tasks
3. Start working on submissions
4. Submit before the deadline

Access your tasks: https://articon.com/dashboard

Category: ${this.formatCategory(participant.category)}

Show us your best work! 💪
    `;
  }

  private generateNotificationTemplate(participant: Participant, message: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">📢 Articon Update</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #4facfe; margin-top: 0;">Hi ${participant.name}! 👋</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #495057; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Stay tuned for more updates! 🚀
          </p>
        </div>
      </div>
    `;
  }

  private generateNotificationText(participant: Participant, message: string): string {
    return `
📢 Articon Hackathon Update

Hi ${participant.name}!

${message}

Stay tuned for more updates! 🚀
    `;
  }

  private generateWinnerTemplate(
    participant: Participant,
    position: number,
    category: string,
    prizeDescription?: string
  ): string {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[position - 1] || '🏆';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center; color: white;">
          <div style="font-size: 60px; margin-bottom: 10px;">${medal}</div>
          <h1 style="margin: 0; font-size: 32px;">CONGRATULATIONS!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You're a WINNER! 🎉</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #FFD700; margin-top: 0;">Amazing Work, ${participant.name}!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Your exceptional creativity and skill have earned you this incredible achievement in Articon Hackathon 2025!</p>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #856404;">🏆 Your Achievement</h3>
            <p style="font-size: 18px; margin: 10px 0; color: #856404;">
              <strong>Position:</strong> ${position}<br>
              <strong>Category:</strong> ${this.formatCategory(category)}
              ${prizeDescription ? `<br><strong>Prize:</strong> ${prizeDescription}` : ''}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 16px; margin: 0;">
              We were incredibly impressed by your creativity and skill! 👏<br>
              Stay connected for prize distribution details! 🎁
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private generateWinnerText(
    participant: Participant,
    position: number,
    category: string,
    prizeDescription?: string
  ): string {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[position - 1] || '🏆';

    return `
${medal} CONGRATULATIONS! ${medal}

Hi ${participant.name}!

You're a WINNER of Articon Hackathon 2025! 🎉

Your Achievement:
- Position: ${position}
- Category: ${this.formatCategory(category)}
${prizeDescription ? `- Prize: ${prizeDescription}` : ''}

Your exceptional work has earned you this amazing achievement! We were incredibly impressed by your creativity and skill! 👏

Stay connected for prize distribution details! 🎁

Congratulations once again! 🌟
    `;
  }

  private generateSubmissionTemplate(participant: Participant, taskTitle?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">✅ Submission Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your work is now under review</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #56ab2f; margin-top: 0;">Great News ${participant.name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6;">We've successfully received your submission for <strong>Articon Hackathon 2025</strong>.</p>

          ${taskTitle ? `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #2e7d32;">📝 Submission Details:</h4>
            <p style="margin-bottom: 0; color: #2e7d32;">
              <strong>Task:</strong> ${taskTitle}
            </p>
          </div>
          ` : ''}

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #495057;">🔍 What's Next:</h4>
            <ul style="margin-bottom: 0; color: #6c757d; line-height: 1.8;">
              <li>Judges will review all submissions</li>
              <li>Results will be announced soon</li>
              <li>Keep an eye on your messages for updates</li>
            </ul>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Thank you for participating! 🙏<br>
            Good luck! 🍀
          </p>
        </div>
      </div>
    `;
  }

  private generateSubmissionText(participant: Participant, taskTitle?: string): string {
    return `
✅ Submission Received - Articon Hackathon 2025

Hi ${participant.name}!

Great news! We've successfully received your submission for Articon Hackathon 2025.
${taskTitle ? `Task: ${taskTitle}` : ''}

What's Next:
- Judges will review all submissions
- Results will be announced soon
- Keep an eye on your messages for updates

Thank you for participating! 🙏

Good luck! 🍀
    `;
  }

  private generateDeadlineReminderTemplate(participant: Participant, deadline: Date): string {
    const timeLeft = this.getTimeRemaining(deadline);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">⏰ Deadline Reminder!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Time is running out</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #ff6b6b; margin-top: 0;">Hi ${participant.name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6;">This is a friendly reminder that the submission deadline is approaching!</p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">⏱️ Time Remaining:</h4>
            <p style="margin-bottom: 0; font-size: 18px; color: #856404;">
              ${timeLeft}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #495057;">✅ Final Checklist:</h4>
            <ul style="margin-bottom: 0; color: #6c757d; line-height: 1.8;">
              <li>Review task requirements</li>
              <li>Complete your submissions</li>
              <li>Test everything works</li>
              <li>Submit before deadline</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.com/dashboard" style="background-color: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Submit Now
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Last chance to shine! ✨
          </p>
        </div>
      </div>
    `;
  }

  private generateDeadlineReminderText(participant: Participant, deadline: Date): string {
    const timeLeft = this.getTimeRemaining(deadline);

    return `
⏰ Deadline Reminder - Articon Hackathon 2025

Hi ${participant.name}!

This is a friendly reminder that the submission deadline is approaching!

Time Remaining: ${timeLeft}

Final Checklist:
- Review task requirements
- Complete your submissions
- Test everything works
- Submit before deadline

Submit now: https://articon.com/dashboard

Last chance to shine! ✨
    `;
  }

  private getTimeRemaining(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return 'Deadline passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
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
