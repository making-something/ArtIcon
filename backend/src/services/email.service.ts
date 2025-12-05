import { Participant } from "@/types/database";
import {
	registrationTemplate,
	approvalTemplate,
	rejectionTemplate,
	eventReminderTemplate,
	passwordResetTemplate,
	customNotificationTemplate,
} from "@/templates/email-templates";
import { transporter, fromEmail, isAwsConfigured } from "./email-transport";
import { databaseService } from "./database.service";
import QRCode from "qrcode";

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
				console.log(
					`   Content: ${
						text || html.replace(/<[^>]*>/g, "").substring(0, 100)
					}...`
				);
				console.log(`   Attachments: ${attachments?.length || 0}`);
				return { success: true, messageId: "mock-id" };
			}

			const mailOptions = {
				from: fromEmail,
				to: Array.isArray(to) ? to.join(", ") : to,
				subject,
				html,
				text: text || html.replace(/<[^>]*>/g, ""),
				attachments: attachments || [],
				replyTo: replyTo || fromEmail,
			};

			const result = await transporter.sendMail(mailOptions);
			console.log(`✅ Email sent successfully to ${to}`);
			console.log(`   Message ID: ${result.messageId}`);

			return { success: true, messageId: result.messageId };
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			console.error("❌ Error sending email:", errorMessage);
			console.error("   To:", options.to);
			console.error("   Subject:", options.subject);

			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	private toPlainText(html: string): string {
		const stripped = html
			.replace(/<style[\s\S]*?<\/style>/gi, " ")
			.replace(/<script[\s\S]*?<\/script>/gi, " ")
			.replace(/<[^>]*>/g, " ");
		return stripped.replace(/\s+/g, " ").trim();
	}

	private async resolveEventDate(): Promise<Date> {
		const settings = await databaseService.getEventSettings();
		const rawDate =
			settings["event_date"] ||
			settings["event_start_date"] ||
			process.env.EVENT_DATE;

		if (rawDate) {
			const parsed = new Date(rawDate);
			if (!Number.isNaN(parsed.getTime())) {
				return parsed;
			}
		}

		return new Date();
	}

	private async buildQrAttachment(participantId: string) {
		const qrBuffer = await QRCode.toBuffer(participantId, {
			errorCorrectionLevel: "H",
			margin: 1,
			width: 300,
			color: {
				dark: "#000000",
				light: "#ffffff",
			},
		});

		return {
			filename: "qrcode.png",
			content: qrBuffer,
			cid: "participant-qrcode",
		};
	}

	/**
	 * Send registration confirmation email with professional template
	 */
	async sendRegistrationEmail(participant: Participant): Promise<EmailResult> {
		const html = registrationTemplate(participant);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "Registration Received — Portfolio Under Review",
			html,
			text,
		});
	}

	/**
	 * Send portfolio selection email
	 */
	async sendPortfolioSelectedEmail(
		participant: Participant,
		eventDate: Date
	): Promise<EmailResult> {
		const resolvedDate = eventDate || (await this.resolveEventDate());
		const qrAttachment = await this.buildQrAttachment(participant.id);
		const html = approvalTemplate(
			participant,
			resolvedDate,
			qrAttachment.cid
		);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "Congratulations You’re Selected for ArtIcon 2025!",
			html,
			text,
			attachments: [qrAttachment],
		});
	}

	/**
	 * Send portfolio rejection email
	 */
	async sendPortfolioRejectedEmail(
		participant: Participant
	): Promise<EmailResult> {
		const html = rejectionTemplate(participant);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "ArtIcon 2025 — Application Update",
			html,
			text,
		});
	}

	/**
	 * Send portfolio approval email
	 */
	async sendApprovalEmail(participant: Participant): Promise<EmailResult> {
		const eventDate = await this.resolveEventDate();
		const qrAttachment = await this.buildQrAttachment(participant.id);
		const html = approvalTemplate(participant, eventDate, qrAttachment.cid);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "🎉 Portfolio Approved - Articon Hackathon 2025",
			html,
			text,
			attachments: [qrAttachment],
		});
	}

	/**
	 * Send portfolio rejection email (for admin review)
	 */
	async sendRejectionEmail(participant: Participant): Promise<EmailResult> {
		const html = rejectionTemplate(participant);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "Update on Your Portfolio - Articon Hackathon 2025",
			html,
			text,
		});
	}

	/**
	 * Send event reminder (1 day before)
	 */
	async sendEventReminderEmail(
		participant: Participant,
		eventDate: Date
	): Promise<EmailResult> {
		const resolvedDate = eventDate || (await this.resolveEventDate());
		const qrAttachment = await this.buildQrAttachment(participant.id);
		const html = eventReminderTemplate(
			participant,
			resolvedDate,
			qrAttachment.cid
		);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: participant.email,
			subject: "⏰ Reminder: Articon Hackathon Tomorrow!",
			html,
			text,
			attachments: [qrAttachment],
		});
	}

	/**
	 * Send event reminder (2 days before)
	 */
	async sendReminder2DaysEmail(participant: Participant): Promise<EmailResult> {
		const subject = "Just a reminder — ArtIcon is in 2 days!";
		const message = "Get your creativity ready 🎨🤖\nSee you soon!";
		const html = customNotificationTemplate(subject, message, "medium");
		const text = this.toPlainText(html);

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
		const subject = "Tomorrow is the big day! 🌟";
		const message = "ArtIcon starts at 9:00 AM.";
		const html = customNotificationTemplate(subject, message, "medium");
		const text = this.toPlainText(html);

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
	async sendReminderMorningEmail(
		participant: Participant
	): Promise<EmailResult> {
		const subject = "Good Morning! ☀️ Today is ArtIcon Day!";
		const message = "Today is ArtIcon Day!\nSee you at 9:00 AM—don’t forget your tools & energy ⚡";
		const html = customNotificationTemplate(subject, message, "medium");
		const text = this.toPlainText(html);

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
	async sendPasswordResetEmail(
		participant: Participant,
		newPassword: string
	): Promise<EmailResult> {
		const subject = "Your New Password for ArtIcon 2025";
		const html = passwordResetTemplate(participant, newPassword);
		const text = this.toPlainText(html);

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
	async sendAdminNotification(
		subject: string,
		message: string,
		priority: "low" | "medium" | "high" = "medium"
	): Promise<EmailResult> {
		const html = customNotificationTemplate(subject, message, priority);
		const text = this.toPlainText(html);

		return await this.sendEmail({
			to: "admin@articon.com",
			subject: `[${priority.toUpperCase()}] ${subject}`,
			html,
			text,
		});
	}

	/**
	 * Check email service status
	 */
	getServiceStatus() {
		return {
			configured: isAwsConfigured,
			fromEmail,
			provider: isAwsConfigured ? "AWS SES" : "Mock/Legacy",
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Test email functionality
	 */
	async testEmail(toEmail: string): Promise<EmailResult> {
		return await this.sendEmail({
			to: toEmail,
			subject: "🧪 Test Email - Articon Hackathon System",
			html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>🧪 Test Email</h2>
          <p>This is a test email from the Articon Hackathon system.</p>
          <p>If you received this, the email service is working correctly! ✅</p>
          <hr style="margin: 20px 0;">
          <small style="color: #666;">
            Sent: ${new Date().toLocaleString()}<br>
            Provider: ${isAwsConfigured ? "AWS SES" : "Mock"}
          </small>
        </div>
      `,
			text: `Test Email\n\nThis is a test email from the Articon Hackathon system.\nIf you received this, the email service is working correctly! ✅\n\nSent: ${new Date().toLocaleString()}\nProvider: ${
				isAwsConfigured ? "AWS SES" : "Mock"
			}`,
		});
	}
}

export default new EmailService();
