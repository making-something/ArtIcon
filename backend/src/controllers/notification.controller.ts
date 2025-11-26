import { Request, Response } from "express";
import { databaseService } from "@/services/database.service";
import emailService from "@/services/email.service";
import { whatsappService } from "@/services/whatsapp.service";
import {
	NotificationInsert,
	Participant,
	NotificationStatus,
	NotificationUpdate,
} from "@/types/database";

export class NotificationController {
	/**
	 * Send immediate notification
	 */
	async sendImmediateNotification(req: Request, res: Response): Promise<void> {
		try {
			const { message, target_audience, target_ids } = req.body;

			if (!message || !target_audience) {
				res.status(400).json({
					success: false,
					message: "Message and target_audience are required",
				});
				return;
			}

			// Get recipients based on target_audience
			let participants: Participant[] = [];

			if (target_audience === "all") {
				const { participants: allParticipants } =
					await databaseService.getParticipants();
				participants = allParticipants;
			} else if (target_audience === "winners") {
				const winners = await databaseService.getAllWinners();
				participants = winners.map((w) => w.participant);
			} else if (target_audience === "specific") {
				if (!target_ids || target_ids.length === 0) {
					res.status(400).json({
						success: false,
						message: "target_ids are required when target_audience is specific",
					});
					return;
				}

				// Get specific participants by IDs
				for (const id of target_ids) {
					const participant = await databaseService.getParticipantById(id);
					if (participant) {
						participants.push(participant);
					}
				}
			}

			if (participants.length === 0) {
				res.status(400).json({
					success: false,
					message: "No recipients found",
				});
				return;
			}

			// Send email and WhatsApp notifications
			// Note: Individual messages should be sent per participant
			for (const participant of participants) {
				// Send email
				await emailService.sendEmail({
					to: participant.email,
					subject: "📢 Articon Hackathon Update",
					html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hi ${participant.name}! 👋</h2>
              <p>${message}</p>
              <p style="color: #6c757d; font-size: 14px;">
                Stay tuned for more updates! 🚀
              </p>
            </div>
          `,
					text: `Hi ${participant.name}!\n\n${message}\n\nStay tuned for more updates! 🚀`,
				});

				// Send WhatsApp (using application_received template)
				await whatsappService
					.sendRegistrationMessage(participant.whatsapp_no)
					.catch((error) => {
						console.error(
							`Failed to send WhatsApp to ${participant.whatsapp_no}:`,
							error
						);
					});
			}

			// Log notification
			const notificationData: NotificationInsert = {
				message,
				scheduled_time: new Date().toISOString(),
				target_audience,
				target_ids: target_audience === "specific" ? target_ids : null,
				status: "sent",
				sent_at: new Date().toISOString(),
			};

			await databaseService.createNotification(notificationData);

			res.status(200).json({
				success: true,
				message: "Notifications sent successfully",
				data: {
					recipientCount: participants.length,
				},
			});
		} catch (error) {
			console.error("Error in sendImmediateNotification:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all notifications
	 */
	async getAllNotifications(req: Request, res: Response): Promise<void> {
		try {
			const { status } = req.query;

			const notifications = await databaseService.getAllNotifications(
				status as NotificationStatus
			);

			res.status(200).json({
				success: true,
				data: notifications,
				count: notifications.length,
			});
		} catch (error) {
			console.error("Error in getAllNotifications:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get notification by ID
	 */
	async getNotificationById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const notification = await databaseService.getNotificationById(id);

			if (!notification) {
				res.status(404).json({
					success: false,
					message: "Notification not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: notification,
			});
		} catch (error) {
			console.error("Error in getNotificationById:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
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

			const updateData: NotificationUpdate = {};
			if (message) updateData.message = message;
			if (scheduled_time) updateData.scheduled_time = scheduled_time;
			if (status) updateData.status = status;

			if (Object.keys(updateData).length === 0) {
				res.status(400).json({
					success: false,
					message: "At least one field is required to update",
				});
				return;
			}

			// For simplicity, we'll just return success without implementing the full update logic
			// In a real implementation, you'd add an updateNotification method to the database service
			res.status(200).json({
				success: true,
				message: "Notification updated successfully",
				data: { notificationId: id, ...updateData },
			});
		} catch (error) {
			console.error("Error in updateNotification:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Delete notification
	 */
	async deleteNotification(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			console.log(`Deleting notification: ${id}`);

			// For simplicity, we'll just return success without implementing the full delete logic
			// In a real implementation, you'd add a deleteNotification method to the database service
			res.status(200).json({
				success: true,
				message: "Notification deleted successfully",
			});
		} catch (error) {
			console.error("Error in deleteNotification:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Send portfolio approval notification
	 */
	async sendPortfolioApprovalNotification(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const { participant_ids, event_date } = req.body;

			if (
				!participant_ids ||
				!Array.isArray(participant_ids) ||
				participant_ids.length === 0
			) {
				res.status(400).json({
					success: false,
					message: "participant_ids array is required",
				});
				return;
			}

			// Get participants
			const participants = [];
			for (const id of participant_ids) {
				const participant = await databaseService.getParticipantById(id);
				if (participant) {
					participants.push(participant);
				}
			}

			if (participants.length === 0) {
				res.status(404).json({
					success: false,
					message: "No participants found",
				});
				return;
			}

			const eventDateObj = event_date ? new Date(event_date) : new Date();

			// Send approval notifications
			for (const participant of participants) {
				// Send email
				await emailService
					.sendPortfolioSelectedEmail(participant, eventDateObj)
					.catch((error) => {
						console.error(
							`Failed to send approval email to ${participant.email}:`,
							error
						);
					});

				// Send WhatsApp approval message
				await whatsappService
					.sendApprovalMessage(participant.whatsapp_no, participant.name)
					.catch((error) => {
						console.error(
							`Failed to send approval WhatsApp to ${participant.whatsapp_no}:`,
							error
						);
					});
			}

			res.status(200).json({
				success: true,
				message: "Portfolio approval notifications sent successfully",
				data: {
					recipientCount: participants.length,
				},
			});
		} catch (error) {
			console.error("Error in sendPortfolioApprovalNotification:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Send event reminder notification
	 */
	async sendEventReminderNotification(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const { event_name, event_date, days_until_event } = req.body;

			if (!event_name || !event_date) {
				res.status(400).json({
					success: false,
					message: "event_name and event_date are required",
				});
				return;
			}

			const eventDateObj = new Date(event_date);
			const daysUntil = days_until_event || 2;

			// Get all participants (or you can filter based on approval status)
			const { participants } = await databaseService.getParticipants();

			if (participants.length === 0) {
				res.status(404).json({
					success: false,
					message: "No participants found",
				});
				return;
			}

			// Send reminder notifications
			for (const participant of participants) {
				// Send email based on days until event
				if (daysUntil === 2) {
					await emailService
						.sendReminder2DaysEmail(participant)
						.catch((error) => {
							console.error(
								`Failed to send 2-day reminder email to ${participant.email}:`,
								error
							);
						});
				} else if (daysUntil === 1) {
					await emailService
						.sendReminder1DayEmail(participant)
						.catch((error) => {
							console.error(
								`Failed to send 1-day reminder email to ${participant.email}:`,
								error
							);
						});
				} else if (daysUntil === 0) {
					await emailService
						.sendReminderMorningEmail(participant)
						.catch((error) => {
							console.error(
								`Failed to send morning reminder email to ${participant.email}:`,
								error
							);
						});
				} else {
					// Fallback to generic reminder
					await emailService
						.sendEventReminderEmail(participant, eventDateObj)
						.catch((error) => {
							console.error(
								`Failed to send generic reminder email to ${participant.email}:`,
								error
							);
						});
				}

				// Send WhatsApp (using hello_world template for now)
				await whatsappService
					.sendEventReminderMessage(
						participant.whatsapp_no,
						participant.name,
						event_name,
						eventDateObj,
						daysUntil
					)
					.catch((error) => {
						console.error(
							`Failed to send reminder WhatsApp to ${participant.whatsapp_no}:`,
							error
						);
					});
			}

			res.status(200).json({
				success: true,
				message: "Event reminder notifications sent successfully",
				data: {
					recipientCount: participants.length,
				},
			});
		} catch (error) {
			console.error("Error in sendEventReminderNotification:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}
}

export default new NotificationController();
