import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/jwt";
import { databaseService } from "@/services/database.service";
import {
	AdminInsert,
	TaskInsert,
	TaskUpdate,
	ApprovalStatus,
	Category,
} from "@/types/database";

type ApprovalUpdatePayload = {
	approval_status: ApprovalStatus;
	admin_notes?: string | null;
};

export class AdminController {
	/**
	 * Admin login
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({
					success: false,
					message: "Email and password are required",
				});
				return;
			}

			// Get admin by email
			const admin = await databaseService.getAdminByEmail(email);

			if (!admin) {
				res.status(401).json({
					success: false,
					message: "Invalid credentials",
				});
				return;
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(
				password,
				admin.password_hash
			);

			if (!isValidPassword) {
				res.status(401).json({
					success: false,
					message: "Invalid credentials",
				});
				return;
			}

			// Generate JWT token
			const token = signToken(
				{ id: admin.id, email: admin.email, role: "admin" },
				process.env.JWT_EXPIRES_IN || "7d"
			);

			res.status(200).json({
				success: true,
				message: "Login successful",
				data: {
					token,
					admin: {
						id: admin.id,
						email: admin.email,
					},
				},
			});
		} catch (error) {
			console.error("Error in admin login:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Create admin account
	 */
	async createAdmin(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({
					success: false,
					message: "Email and password are required",
				});
				return;
			}

			// Check if admin already exists
			const existingAdmin = await databaseService.getAdminByEmail(email);

			if (existingAdmin) {
				res.status(409).json({
					success: false,
					message: "Admin already exists",
				});
				return;
			}

			// Hash password
			const passwordHash = await bcrypt.hash(password, 10);

			// Create admin
			const adminData: AdminInsert = {
				email,
				password_hash: passwordHash,
			};

			const admin = await databaseService.createAdmin(adminData);

			if (!admin) {
				console.error("Error creating admin");
				res.status(500).json({
					success: false,
					message: "Failed to create admin",
				});
				return;
			}

			res.status(201).json({
				success: true,
				message: "Admin created successfully",
				data: {
					id: admin.id,
					email: admin.email,
				},
			});
		} catch (error) {
			console.error("Error in createAdmin:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Create task
	 */
	async createTask(req: Request, res: Response): Promise<void> {
		try {
			const { category, title, description } = req.body;

			if (!category || !title || !description) {
				res.status(400).json({
					success: false,
					message: "Category, title and description are required",
				});
				return;
			}

			// Validate category
			const validCategories = ["video", "ui_ux", "graphics"];
			if (!validCategories.includes(category)) {
				res.status(400).json({
					success: false,
					message: "Invalid category",
				});
				return;
			}

			// Create task
			const taskData: TaskInsert = {
				category,
				title,
				description,
			};

			const task = await databaseService.createTask(taskData);

			if (!task) {
				console.error("Error creating task");
				res.status(500).json({
					success: false,
					message: "Failed to create task",
				});
				return;
			}

			res.status(201).json({
				success: true,
				message: "Task created successfully",
				data: task,
			});
		} catch (error) {
			console.error("Error in createTask:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update task
	 */
	async updateTask(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { title, description } = req.body;

			if (!title && !description) {
				res.status(400).json({
					success: false,
					message: "At least one field (title or description) is required",
				});
				return;
			}

			const updateData: TaskUpdate = {};
			if (title) updateData.title = title;
			if (description) updateData.description = description;

			const task = await databaseService.updateTask(id, updateData);

			if (!task) {
				res.status(404).json({
					success: false,
					message: "Task not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Task updated successfully",
				data: task,
			});
		} catch (error) {
			console.error("Error in updateTask:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Delete task
	 */
	async deleteTask(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const success = await databaseService.deleteTask(id);

			if (!success) {
				res.status(404).json({
					success: false,
					message: "Task not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Task deleted successfully",
			});
		} catch (error) {
			console.error("Error in deleteTask:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all tasks
	 */
	async getAllTasks(req: Request, res: Response): Promise<void> {
		try {
			const { category } = req.query;

			const tasks = await databaseService.getAllTasks(category as Category);

			res.status(200).json({
				success: true,
				data: tasks,
				count: tasks.length,
			});
		} catch (error) {
			console.error("Error in getAllTasks:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Announce winner
	 */
	async announceWinner(req: Request, res: Response): Promise<void> {
		try {
			const { participant_id, position, category, announcement_text } =
				req.body;

			if (!participant_id || !position || !category || !announcement_text) {
				res.status(400).json({
					success: false,
					message: "All fields are required",
				});
				return;
			}

			// Validate participant exists
			const participant = await databaseService.getParticipantById(
				participant_id
			);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Check if winner already exists for this category
			const existingWinners = await databaseService.getAllWinners(category);
			const existingWinner = existingWinners.find(
				(w) => w.participant_id === participant_id
			);

			if (existingWinner) {
				res.status(409).json({
					success: false,
					message: "Winner already announced for this category",
				});
				return;
			}

			// Create winner
			const winner = await databaseService.createWinner({
				participant_id,
				position,
				category,
				announcement_text,
			});

			if (!winner) {
				console.error("Error creating winner");
				res.status(500).json({
					success: false,
					message: "Failed to announce winner",
				});
				return;
			}

			// Note: Winner email functionality can be added back if needed
			// For now, winners will be managed through the admin panel

			res.status(201).json({
				success: true,
				message: "Winner announced successfully",
				data: winner,
			});
		} catch (error) {
			console.error("Error in announceWinner:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all winners
	 */
	async getAllWinners(req: Request, res: Response): Promise<void> {
		try {
			const { category } = req.query;

			const winners = await databaseService.getAllWinners(category as Category);

			res.status(200).json({
				success: true,
				data: winners,
				count: winners.length,
			});
		} catch (error) {
			console.error("Error in getAllWinners:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Delete winner
	 */
	async deleteWinner(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const success = await databaseService.deleteWinner(id);

			if (!success) {
				res.status(404).json({
					success: false,
					message: "Winner not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Winner deleted successfully",
			});
		} catch (error) {
			console.error("Error in deleteWinner:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update event settings
	 */
	async updateEventSettings(req: Request, res: Response): Promise<void> {
		try {
			const { key, value } = req.body;

			if (!key || !value) {
				res.status(400).json({
					success: false,
					message: "Key and value are required",
				});
				return;
			}

			const setting = await databaseService.updateEventSetting(key, value);

			if (!setting) {
				console.error("Error updating event settings");
				res.status(500).json({
					success: false,
					message: "Failed to update event settings",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Event settings updated successfully",
				data: setting,
			});
		} catch (error) {
			console.error("Error in updateEventSettings:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get event settings
	 */
	async getEventSettings(_req: Request, res: Response): Promise<void> {
		try {
			const settings = await databaseService.getEventSettings();

			res.status(200).json({
				success: true,
				data: settings,
			});
		} catch (error) {
			console.error("Error in getEventSettings:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get dashboard statistics
	 */
	async getDashboardStats(_req: Request, res: Response): Promise<void> {
		try {
			const stats = await databaseService.getDashboardStats();

			res.status(200).json({
				success: true,
				data: stats,
			});
		} catch (error) {
			console.error("Error in getDashboardStats:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all participants with their portfolio information
	 */
	async getAllParticipantsWithPortfolios(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const { category, search, approval_status } = req.query;

			const filters: {
				category?: Category;
				search?: string;
				approval_status?: ApprovalStatus;
			} = {};
			if (category && category !== "all") {
				filters.category = category as Category;
			}
			if (search && typeof search === "string") {
				filters.search = search;
			}
			if (approval_status && typeof approval_status === "string") {
				filters.approval_status = approval_status as ApprovalStatus;
			}

			const { participants, total } = await databaseService.getParticipants(
				filters
			);

			res.status(200).json({
				success: true,
				data: participants,
				total,
			});
		} catch (error) {
			console.error("Error in getAllParticipantsWithPortfolios:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update participant approval status (approved/rejected/pending)
	 */
	async updateParticipantStatus(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { approval_status, admin_notes }: ApprovalUpdatePayload = req.body;

			if (
				!approval_status ||
				!["approved", "rejected", "pending"].includes(approval_status)
			) {
				res.status(400).json({
					success: false,
					message: "approval_status must be approved, rejected, or pending",
				});
				return;
			}

			const participant = await databaseService.getParticipantById(id);
			if (!participant) {
				res
					.status(404)
					.json({ success: false, message: "Participant not found" });
				return;
			}

			const updateData: Record<string, unknown> = {
				approval_status,
				admin_notes: admin_notes ?? null,
			};

			if (approval_status === "approved") {
				updateData.approved_at = new Date().toISOString();
				updateData.rejected_at = null;
			} else if (approval_status === "rejected") {
				updateData.rejected_at = new Date().toISOString();
				updateData.approved_at = null;
			} else {
				updateData.approved_at = null;
				updateData.rejected_at = null;
			}

			const updated = await databaseService.updateParticipant(id, updateData);
			if (!updated) {
				res
					.status(500)
					.json({ success: false, message: "Failed to update participant" });
				return;
			}

			res.status(200).json({
				success: true,
				message: "Participant status updated",
				data: updated,
			});
		} catch (error) {
			console.error("Error in updateParticipantStatus:", error);
			res
				.status(500)
				.json({ success: false, message: "Internal server error" });
		}
	}

	/**
	 * Delete participant (and cascading submissions)
	 */
	async deleteParticipant(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const success = await databaseService.deleteParticipant(id);

			if (!success) {
				res
					.status(404)
					.json({ success: false, message: "Participant not found" });
				return;
			}

			res.status(200).json({ success: true, message: "Participant deleted" });
		} catch (error) {
			console.error("Error in deleteParticipant:", error);
			res
				.status(500)
				.json({ success: false, message: "Internal server error" });
		}
	}

	/**
	 * Approve participant portfolio
	 */
	async approveParticipant(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { admin_notes } = req.body;

			// Get participant
			const participant = await databaseService.getParticipantById(id);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Update participant approval status
			const updateData = {
				approval_status: "approved" as const,
				approved_at: new Date().toISOString(),
				rejected_at: null,
				admin_notes: admin_notes || null,
			};

			const updatedParticipant = await databaseService.updateParticipant(
				id,
				updateData
			);

			if (!updatedParticipant) {
				res.status(500).json({
					success: false,
					message: "Failed to approve participant",
				});
				return;
			}

			// Send approval email and WhatsApp
			const emailService = (await import("@/services/email.service")).default;
			const { whatsappService } = await import("@/services/whatsapp.service");

			// Send approval email asynchronously
			console.log(`📧 Sending approval email to: ${updatedParticipant.email}`);
			emailService
				.sendApprovalEmail(updatedParticipant)
				.then((result) => {
					if (result.success) {
						console.log(
							`✅ Approval email sent successfully to ${updatedParticipant.email}`
						);
					} else {
						console.error(
							`❌ Failed to send approval email to ${updatedParticipant.email}: ${result.error}`
						);
					}
				})
				.catch((error) => {
					console.error("❌ Error sending approval email:", error);
				});

			// Send approval WhatsApp message asynchronously
			const { whatsappLogger } = await import("@/utils/whatsapp-logger");

			whatsappLogger.info("Sending approval WhatsApp message", {
				function: "approveParticipant",
				to: updatedParticipant.whatsapp_no,
				participantName: updatedParticipant.name,
			});

			whatsappService
				.sendApprovalMessage(
					updatedParticipant.whatsapp_no,
					updatedParticipant.name
				)
				.then((result) => {
					if (result.success) {
						whatsappLogger.success("Approval WhatsApp sent successfully", {
							function: "approveParticipant",
							to: updatedParticipant.whatsapp_no,
							messageId: result.messageId,
						});
					} else {
						whatsappLogger.error("Failed to send approval WhatsApp", {
							function: "approveParticipant",
							to: updatedParticipant.whatsapp_no,
							error: result.error,
						});
					}
				})
				.catch((error) => {
					whatsappLogger.error("Error sending approval WhatsApp", {
						function: "approveParticipant",
						to: updatedParticipant.whatsapp_no,
						error,
					});
				});

			res.status(200).json({
				success: true,
				message: "Participant approved successfully",
				data: updatedParticipant,
			});
		} catch (error) {
			console.error("Error in approveParticipant:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Reject participant portfolio
	 */
	async rejectParticipant(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { admin_notes } = req.body;

			// Get participant
			const participant = await databaseService.getParticipantById(id);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Update participant approval status
			const updateData = {
				approval_status: "rejected" as const,
				rejected_at: new Date().toISOString(),
				approved_at: null,
				admin_notes: admin_notes || null,
			};

			const updatedParticipant = await databaseService.updateParticipant(
				id,
				updateData
			);

			if (!updatedParticipant) {
				res.status(500).json({
					success: false,
					message: "Failed to reject participant",
				});
				return;
			}

			// Send rejection email and WhatsApp
			const emailService = (await import("@/services/email.service")).default;
			const { whatsappService } = await import("@/services/whatsapp.service");

			// Send rejection email asynchronously
			console.log(`📧 Sending rejection email to: ${updatedParticipant.email}`);
			emailService
				.sendRejectionEmail(updatedParticipant)
				.then((result) => {
					if (result.success) {
						console.log(
							`✅ Rejection email sent successfully to ${updatedParticipant.email}`
						);
					} else {
						console.error(
							`❌ Failed to send rejection email to ${updatedParticipant.email}: ${result.error}`
						);
					}
				})
				.catch((error) => {
					console.error("❌ Error sending rejection email:", error);
				});

			// Send rejection WhatsApp message asynchronously
			const { whatsappLogger } = await import("@/utils/whatsapp-logger");

			whatsappLogger.info("Sending rejection WhatsApp message", {
				function: "rejectParticipant",
				to: updatedParticipant.whatsapp_no,
				participantName: updatedParticipant.name,
			});

			whatsappService
				.sendRejectionMessage(
					updatedParticipant.whatsapp_no,
					updatedParticipant.name
				)
				.then((result) => {
					if (result.success) {
						whatsappLogger.success("Rejection WhatsApp sent successfully", {
							function: "rejectParticipant",
							to: updatedParticipant.whatsapp_no,
							messageId: result.messageId,
						});
					} else {
						whatsappLogger.error("Failed to send rejection WhatsApp", {
							function: "rejectParticipant",
							to: updatedParticipant.whatsapp_no,
							error: result.error,
						});
					}
				})
				.catch((error) => {
					whatsappLogger.error("Error sending rejection WhatsApp", {
						function: "rejectParticipant",
						to: updatedParticipant.whatsapp_no,
						error,
					});
				});

			res.status(200).json({
				success: true,
				message: "Participant rejected successfully",
				data: updatedParticipant,
			});
		} catch (error) {
			console.error("Error in rejectParticipant:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Export participants data as CSV
	 */
	async exportParticipantsCSV(req: Request, res: Response): Promise<void> {
		try {
			const { category, approval_status } = req.query;

			const filters: {
				category?: Category;
				approval_status?: ApprovalStatus;
				page?: number;
				limit?: number;
			} = {};
			if (category && category !== "all") {
				filters.category = category as Category;
			}
			if (approval_status && typeof approval_status === "string") {
				filters.approval_status = approval_status as ApprovalStatus;
			}
			// Get all participants without pagination for export
			filters.page = 1;
			filters.limit = 10000;

			const { participants } = await databaseService.getParticipants(filters);

			// Convert to CSV
			const headers = [
				"ID",
				"Name",
				"Email",
				"WhatsApp",
				"Category",
				"City",
				"Portfolio URL",
				"Portfolio File",
				"Role",
				"Experience",
				"Organization",
				"Specialization",
				"Source",
				"Approval Status",
				"Admin Notes",
				"Present",
				"Registered At",
			];

			const csvRows = participants.map((p) => [
				p.id,
				p.name,
				p.email,
				p.whatsapp_no,
				p.category,
				p.city,
				p.portfolio_url || "",
				p.portfolio_file_path || "",
				p.role || "",
				p.experience || "",
				p.organization || "",
				p.specialization || "",
				p.source || "",
				p.approval_status,
				p.admin_notes || "",
				p.is_present ? "Yes" : "No",
				new Date(p.created_at).toLocaleDateString(),
			]);

			const csvContent = [
				headers.join(","),
				...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");

			// Set headers for CSV download
			res.setHeader("Content-Type", "text/csv");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="participants-${
					new Date().toISOString().split("T")[0]
				}.csv"`
			);

			res.status(200).send(csvContent);
		} catch (error) {
			console.error("Error in exportParticipantsCSV:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Send live update
	 */
	async sendUpdate(req: Request, res: Response): Promise<void> {
		try {
			const { message } = req.body;

			if (!message) {
				res.status(400).json({
					success: false,
					message: "Message is required",
				});
				return;
			}

			// Emit update event
			(req as any).io.emit("live-update", {
				message,
				timestamp: new Date().toISOString(),
			});

			res.status(200).json({
				success: true,
				message: "Update sent successfully",
			});
		} catch (error) {
			console.error("Error sending update:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update event controls (task times, submission status, etc.)
	 */
	async updateEventControls(req: Request, res: Response): Promise<void> {
		try {
			const { taskShowTime, taskDurations, submissionsClosed } = req.body;

			// Update task show time if provided
			if (taskShowTime) {
				await databaseService.updateEventSetting(
					"task_show_time",
					taskShowTime
				);
			}

			// Update task durations if provided (JSON string)
			if (taskDurations) {
				await databaseService.updateEventSetting(
					"task_durations",
					JSON.stringify(taskDurations)
				);
			}

			// Update submissions closed status if provided
			if (submissionsClosed !== undefined) {
				await databaseService.updateEventSetting(
					"submissions_closed",
					String(submissionsClosed)
				);
			}

			// Emit socket event for real-time updates
			(req as any).io.emit("event-status-update", {
				winnersAnnounced: false,
				submissionsClosed: submissionsClosed || false,
			});

			res.status(200).json({
				success: true,
				message: "Event controls updated successfully",
			});
		} catch (error) {
			console.error("Error updating event controls:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get event controls
	 */
	async getEventControls(_req: Request, res: Response): Promise<void> {
		try {
			const settings = await databaseService.getEventSettings();

			const controls = {
				taskShowTime: settings.task_show_time || "2025-12-07T10:00:00",
				taskDurations: settings.task_durations
					? JSON.parse(settings.task_durations)
					: {
							ui_ux: "7 hours",
							graphics: "7 hours",
							video: "7 hours",
					  },
				submissionsClosed: settings.submissions_closed === "true",
			};

			res.status(200).json({
				success: true,
				data: controls,
			});
		} catch (error) {
			console.error("Error getting event controls:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Announce winners and redirect all users
	 */
	async announceWinners(req: Request, res: Response): Promise<void> {
		try {
			// Set winner announcement flag
			await databaseService.updateEventSetting("winners_announced", "true");

			// Emit socket event to redirect all users immediately
			(req as any).io.emit("event-status-update", {
				winnersAnnounced: true,
				submissionsClosed: true,
			});

			res.status(200).json({
				success: true,
				message:
					"Winners announced successfully. All users will be redirected.",
			});
		} catch (error) {
			console.error("Error announcing winners:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}
}

export default new AdminController();
