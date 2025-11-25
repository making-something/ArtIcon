import { Participant } from '@/types/database';
import { transporter, fromEmail, isAwsConfigured } from './email-transport';
import QRCode from 'qrcode';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string; cid?: string }[];
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error sending email:', errorMessage);
      console.error('   To:', options.to);
      console.error('   Subject:', options.subject);

      return {
        success: false,
        error: errorMessage
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
      subject: 'Registration Received — Portfolio Under Review',
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
      subject: 'Congratulations You’re Selected for ArtIcon 2025!',
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
      subject: 'ArtIcon 2025 — Application Update',
      html,
      text,
    });
  }

  /**
   * Send portfolio approval email
   */
  async sendApprovalEmail(participant: Participant): Promise<EmailResult> {
    const html = this.generateApprovalTemplate(participant);
    const text = this.generateApprovalText(participant);

    return await this.sendEmail({
      to: participant.email,
      subject: '🎉 Portfolio Approved - Articon Hackathon 2025',
      html,
      text,
    });
  }

  /**
   * Send portfolio rejection email (for admin review)
   */
  async sendRejectionEmail(participant: Participant): Promise<EmailResult> {
    const html = this.generateRejectionTemplate(participant);
    const text = this.generateRejectionText(participant);

    return await this.sendEmail({
      to: participant.email,
      subject: 'Update on Your Portfolio - Articon Hackathon 2025',
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

    // Generate QR Code
    const qrBuffer = await QRCode.toBuffer(participant.id, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return await this.sendEmail({
      to: participant.email,
      subject: '⏰ Reminder: Articon Hackathon Tomorrow!',
      html,
      text,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrBuffer,
          cid: 'participant-qrcode', // Referenced in the template
        },
      ],
    });
  }

  /**
   * Send event reminder (2 days before)
   */
  async sendReminder2DaysEmail(participant: Participant): Promise<EmailResult> {
    const subject = 'Just a reminder — ArtIcon is in 2 days!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="color: #333;">Just a reminder — ArtIcon is in 2 days!</h2>
        <p style="font-size: 16px; color: #555;">Get your creativity ready 🎨🤖</p>
        <p style="font-size: 16px; color: #555;">See you soon!</p>
      </div>
    `;
    const text = `Just a reminder — ArtIcon is in 2 days! Get your creativity ready 🎨🤖\nSee you soon!`;

    return await this.sendEmail({
      to: participant.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send event reminder (1 day before)
   */
  async sendReminder1DayEmail(participant: Participant): Promise<EmailResult> {
    const subject = 'Tomorrow is the big day! 🌟';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="color: #333;">Tomorrow is the big day! 🌟</h2>
        <p style="font-size: 16px; color: #555;">ArtIcon starts at 9:00 AM.</p>
      </div>
    `;
    const text = `Tomorrow is the big day! 🌟\nArtIcon starts at 9:00 AM.`;

    return await this.sendEmail({
      to: participant.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send event reminder (Same Morning)
   */
  async sendReminderMorningEmail(participant: Participant): Promise<EmailResult> {
    const subject = 'Good Morning! ☀️ Today is ArtIcon Day!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="color: #333;">Good Morning! ☀️</h2>
        <p style="font-size: 18px; font-weight: bold; color: #222;">Today is ArtIcon Day!</p>
        <p style="font-size: 16px; color: #555;">See you at 9:00 AM don’t forget your tools & energy ⚡</p>
      </div>
    `;
    const text = `Good Morning! ☀️\nToday is ArtIcon Day!\nSee you at 9:00 AM don’t forget your tools & energy ⚡`;

    return await this.sendEmail({
      to: participant.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send password reset email with new password
   */
  async sendPasswordResetEmail(participant: Participant, newPassword: string): Promise<EmailResult> {
    const subject = 'Your New Password for ArtIcon 2025';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #555;">Hello ${participant.name},</p>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password. Here is your new temporary password:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${newPassword}</span>
        </div>

        <p style="font-size: 14px; color: #666;">Please login using this password. You cannot change it currently, so please keep it safe.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 12px; color: #999;">If you did not request this change, please contact support immediately.</p>
        </div>
      </div>
    `;
    const text = `Hello ${participant.name},\n\nYour new password is: ${newPassword}\n\nPlease login using this password.`;

    return await this.sendEmail({
      to: participant.email,
      subject,
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
  private generateRegistrationTemplate(_participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">Registration Received</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Portfolio Under Review</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #667eea; margin-top: 0;">Hello,</h2>
          <p style="font-size: 16px; line-height: 1.6;">Your registration for ArtIcon 2025 is successfully completed. 🎉</p>
          <p style="font-size: 16px; line-height: 1.6;">Our team will now review your portfolio and we’ll notify you of the status soon.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
             <p style="margin: 0; color: #495057; font-weight: bold;">Thank you for your interest & participation!</p>
          </div>

          <p style="margin-top: 30px; font-weight: bold;">— Team ArtIcon</p>
        </div>
      </div>
    `;
  }

  private generateRegistrationText(_participant: Participant): string {
    return `
Registration Received — Portfolio Under Review

Hello,
Your registration for ArtIcon 2025 is successfully completed. 🎉
Our team will now review your portfolio and we’ll notify you of the status soon.
Thank you for your interest & participation!
— Team ArtIcon
    `;
  }

    private generatePortfolioSelectedTemplate(_participant: Participant, _eventDate: Date): string {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div style="padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You’re Selected for ArtIcon 2025!</p>
          </div>
          <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #667eea; margin-top: 0;">Great news! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.6;">Your portfolio has been reviewed and you have been APPROVED to participate in ArtIcon 2025.</p>
  
            <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0;">
              <p style="margin-bottom: 10px;"><strong>📅 Date:</strong> Sunday, 7th December 2025</p>
              <p style="margin-bottom: 10px;"><strong>⏰ Time:</strong> 9:00 AM</p>
              <p style="margin-bottom: 0;"><strong>📍 Location:</strong> Floor 3, Rumi Plaza, Airport Main Rd, near Race Course Road, Maruti Nagar, Rajkot, Gujarat 360001</p>
            </div>
  
            <p style="font-size: 16px; line-height: 1.6;">We’re excited to see your creativity in action!</p>
            <p style="margin-top: 30px; font-weight: bold;">— Team ArtIcon</p>
          </div>
        </div>
      `;
    }
    private generatePortfolioSelectedText(_participant: Participant, _eventDate: Date): string {
      return `
Congratulations You’re Selected for ArtIcon 2025!

Great news! 🎉
Your portfolio has been reviewed and you have been APPROVED to participate in ArtIcon 2025.

📅 Date: Sunday, 7th December 2025
⏰ Time: 9:00 AM
📍 Floor 3, Rumi Plaza, Airport Main Rd, near Race Course Road, Maruti Nagar, Rajkot, Gujarat 360001

We’re excited to see your creativity in action!
—Team ArtIcon
      `;
    }
  private generatePortfolioRejectedTemplate(_participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">ArtIcon 2025</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Application Update</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #495057; margin-top: 0;">Hello,</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest in ArtIcon 2025. After reviewing your portfolio, we regret to inform you that you were not selected this time.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #495057; line-height: 1.8;">
              We truly appreciate your effort and encourage you to participate in future events — your creativity matters!
            </p>
          </div>

          <p style="color: #6c757d; font-size: 14px;">
            Thank you for understanding.
          </p>
          <p style="margin-top: 30px; font-weight: bold; color: #6c757d;">— Team ArtIcon</p>
        </div>
      </div>
    `;
  }

  private generatePortfolioRejectedText(_participant: Participant): string {
    return `
ArtIcon 2025 — Application Update

Hello,
Thank you for your interest in ArtIcon 2025. After reviewing your portfolio, we regret to inform you that you were not selected this time.
We truly appreciate your effort and encourage you to participate in future events — your creativity matters!
Thank you for understanding.
— Team ArtIcon
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
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ddd;">
                <p style="margin-bottom: 10px; font-weight: bold; color: #333;">Your Attendance QR Code:</p>
                <img src="cid:participant-qrcode" alt="Attendance QR Code" style="width: 200px; height: 200px; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px;" />
                <p style="font-size: 12px; color: #999; margin-top: 5px;">Show this at the registration desk</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.multiicon.in" style="background-color: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
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

Dashboard: https://articon.multiicon.in

See you tomorrow! Best of luck! 🍀
    `;
  }

  private generateApprovalTemplate(participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">✅ Portfolio Approved!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your portfolio has been reviewed and approved</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #28a745; margin-top: 0;">Congratulations ${participant.name}! 🎉</h2>
          <p style="font-size: 16px; line-height: 1.6;">Great news! Your portfolio has been reviewed by our team and has been <strong>approved</strong> for the Articon Hackathon 2025.</p>

          <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #155724;">📋 What's Next:</h4>
            <ul style="color: #155724; line-height: 1.8;">
              <li>You're now officially confirmed for the event</li>
              <li>Mark your calendar for November 30th, 2025</li>
              <li>Prepare your creative tools and software</li>
              <li>Get ready for an amazing creative challenge!</li>
            </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #495057;">Your Registration Details:</h3>
            <ul style="color: #6c757d; line-height: 1.8;">
              <li><strong>Name:</strong> ${participant.name}</li>
              <li><strong>Email:</strong> ${participant.email}</li>
              <li><strong>Category:</strong> ${this.formatCategory(participant.category)}</li>
              <li><strong>City:</strong> ${participant.city}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://articon.multiicon.in" style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold;">
              Visit Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="margin: 0; color: #888; font-size: 14px;">
            We can't wait to see what you create! 🚀
          </p>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">
            Need help? Reply to this email or contact us at support@multiicon.in
          </p>
        </div>
      </div>
    `;
  }

  private generateApprovalText(participant: Participant): string {
    return `
✅ Portfolio Approved! - Articon Hackathon 2025

Congratulations ${participant.name}!

Great news! Your portfolio has been reviewed by our team and has been approved for the Articon Hackathon 2025.

What's Next:
- You're now officially confirmed for the event
- Mark your calendar for November 30th, 2025
- Prepare your creative tools and software
- Get ready for an amazing creative challenge!

Your Registration Details:
- Name: ${participant.name}
- Email: ${participant.email}
- Category: ${this.formatCategory(participant.category)}
- City: ${participant.city}

Visit your dashboard: https://articon.multiicon.in

We can't wait to see what you create! 🚀

Need help? Reply to this email or contact us at support@multiicon.in
    `;
  }

  private generateRejectionTemplate(participant: Participant): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white;">
        <div style="padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">📋 Update on Your Portfolio</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Review completed for your submission</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #6c757d; margin-top: 0;">Hi ${participant.name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for submitting your portfolio for <strong>Articon Hackathon 2025</strong>. Our team has carefully reviewed your submission.</p>

          <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #721c24;">Update on Your Application:</h4>
            <p style="color: #721c24; line-height: 1.6;">
              After careful consideration, we regret to inform you that your portfolio could not be approved at this time.
              This decision doesn't reflect on your talent or potential - it's about finding the best fit for this specific event.
            </p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">💡 Keep Creating:</h4>
            <ul style="color: #856404; line-height: 1.8;">
              <li>Continue building your portfolio</li>
              <li>Look for other creative opportunities</li>
              <li>Stay connected for future events</li>
              <li>Keep honing your skills and creativity</li>
            </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #495057;">Your Submission Details:</h3>
            <ul style="color: #6c757d; line-height: 1.8;">
              <li><strong>Name:</strong> ${participant.name}</li>
              <li><strong>Email:</strong> ${participant.email}</li>
              <li><strong>Category:</strong> ${this.formatCategory(participant.category)}</li>
              <li><strong>City:</strong> ${participant.city}</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="margin: 0; color: #888; font-size: 14px;">
            Thank you for your interest in Articon Hackathon 2025. Keep creating and stay inspired! ✨
          </p>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">
            Questions? Reply to this email or contact us at support@multiicon.in
          </p>
        </div>
      </div>
    `;
  }

  private generateRejectionText(participant: Participant): string {
    return `
📋 Update on Your Portfolio - Articon Hackathon 2025

Hi ${participant.name}!

Thank you for submitting your portfolio for Articon Hackathon 2025. Our team has carefully reviewed your submission.

Update on Your Application:
After careful consideration, we regret to inform you that your portfolio could not be approved at this time.
This decision doesn't reflect on your talent or potential - it's about finding the best fit for this specific event.

Keep Creating:
- Continue building your portfolio
- Look for other creative opportunities
- Stay connected for future events
- Keep honing your skills and creativity

Your Submission Details:
- Name: ${participant.name}
- Email: ${participant.email}
- Category: ${this.formatCategory(participant.category)}
- City: ${participant.city}

Thank you for your interest in Articon Hackathon 2025. Keep creating and stay inspired! ✨

Questions? Reply to this email or contact us at support@multiicon.in
    `;
  }

  private formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      video: 'Video Editing',
      ui_ux: 'UI/UX Design',
      graphics: 'Graphic Design',
      all: 'All Categories',
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