import { Participant } from '@/types/database';
import { transporter, fromEmail, isAwsConfigured } from './email-transport';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!isAwsConfigured) {
        console.log(`📧 [EMAIL LOG] To: ${options.to}, Subject: ${options.subject}`);
        console.log(`   Content: ${options.text || options.html.replace(/<[^>]*>/g, '').substring(0, 100)}...`);
        return;
      }

      const { to, subject, html, text } = options;
      const mailOptions = {
        from: fromEmail,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      };
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  async sendRegistrationEmail(participant: Participant): Promise<void> {
    await this.sendEmail({
      to: participant.email,
      subject: 'Registration Confirmed - Articon Hackathon',
      html: `<h1>Welcome ${participant.name}!</h1><p>Your registration is confirmed.</p>`,
    });
  }

  async sendEventStartEmail(participant: Participant): Promise<void> {
    await this.sendEmail({
      to: participant.email,
      subject: 'Event Started!',
      html: `<h1>Hi ${participant.name}!</h1><p>The event has started!</p>`,
    });
  }

  async sendNotificationEmail(participants: Participant[], message: string): Promise<void> {
    const emails = participants.map(p => ({
      to: p.email,
      subject: 'Articon Hackathon Update',
      html: `<p>${message}</p>`,
    }));
    await Promise.all(emails.map(e => this.sendEmail(e)));
  }

  async sendWinnerEmail(participant: Participant, position: number, category: string): Promise<void> {
    await this.sendEmail({
      to: participant.email,
      subject: 'Congratulations - You Won!',
      html: `<h1>Congratulations ${participant.name}!</h1><p>Position: ${position}, Category: ${category}</p>`,
    });
  }

  async sendSubmissionConfirmationEmail(participant: Participant): Promise<void> {
    await this.sendEmail({
      to: participant.email,
      subject: 'Submission Received',
      html: `<h1>Hi ${participant.name}!</h1><p>Your submission has been received.</p>`,
    });
  }
}

export default new EmailService();
