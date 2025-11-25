import { Request, Response } from "express";
import emailService from "@/services/email.service";
import { whatsappService } from "@/services/whatsapp.service";
import { databaseService } from "@/services/database.service";
import { ParticipantInsert, Category } from "@/types/database";

export class ParticipantController {
	/**
	 * Register a new participant
	 */
	async register(req: Request, res: Response): Promise<void> {
		try {
			const {
				fullName,
				email,
				phone,
				city,
				portfolio,
				portfolioFile,
				role,
				experience,
				organization,
				specialization: initialSpecialization,
				source,
				password,
			} = req.body;

			let specialization = initialSpecialization;

			// Validate required fields - either portfolio URL or file must be provided
			if (!fullName || !email || !phone || !city || !password) {
				res.status(400).json({
					success: false,
					message: "All required fields must be provided",
				});
				return;
			}

			// Check that at least one portfolio method is provided
			if (!portfolio && !portfolioFile) {
				res.status(400).json({
					success: false,
					message: "Either portfolio URL or portfolio file must be provided",
				});
				return;
			}

			// Determine category from specialization or direct category input
			let category: "video" | "ui_ux" | "graphics" | "all";

			if (specialization) {
				// Map specialization to category
				const specializationToCategoryMap: {
					[key: string]: "video" | "ui_ux" | "graphics" | "all";
				} = {
					"Video Editing": "video",
					"UI/UX Design": "ui_ux",
					"Graphic Design": "graphics",
					"All": "all",
				};
				category = specializationToCategoryMap[specialization];
			} else if (req.body.category) {
				// Use category directly from frontend
				category = req.body.category;
				// Also create specialization for consistency
				const categoryToSpecializationMap: {
					[key: string]: string;
				} = {
					"video": "Video Editing",
					"ui_ux": "UI/UX Design",
					"graphics": "Graphic Design",
					"all": "All",
				};
				specialization = categoryToSpecializationMap[category] || category;
			} else {
				category = "ui_ux";
			}

			if (!category) {
				res.status(400).json({
					success: false,
					message: "Invalid specialization",
				});
				return;
			}

			// Check if email already exists
			const existingParticipant = await databaseService.getParticipantByEmail(email);

			if (existingParticipant) {
				res.status(409).json({
					success: false,
					message: "Email already registered",
				});
				return;
			}

			// Hash password
			const bcrypt = await import("bcryptjs");
			const password_hash = await bcrypt.hash(password, 10);

			// Create participant - support both URL and file path
			const participantData: ParticipantInsert = {
				name: fullName,
				email,
				whatsapp_no: phone,
				category,
				city,
				portfolio_url: portfolio || null,
				portfolio_file_path: portfolioFile || null,
				role: role || null,
				experience: experience ? parseInt(experience) : 0,
				organization: organization || null,
				specialization: specialization || null,
				source: source || null,
				password_hash,
				is_present: false,
			};

			const participant = await databaseService.createParticipant(participantData);

			if (!participant) {
				console.error("Error creating participant");
				res.status(500).json({
					success: false,
					message: "Failed to register participant",
				});
				return;
			}

		// Send registration email asynchronously
		console.log(`📧 Attempting to send registration email to: ${participant.email}`);
		emailService.sendRegistrationEmail(participant)
			.then((result) => {
				if (result.success) {
					console.log(`✅ Registration email sent successfully to ${participant.email}`);
					console.log(`   Message ID: ${result.messageId}`);
				} else {
					console.error(`❌ Failed to send registration email to ${participant.email}`);
					console.error(`   Error: ${result.error}`);
				}
			})
			.catch((error) => {
				console.error("❌ Error sending registration email:", error);
			});

		// Send registration WhatsApp message asynchronously
		console.log(`📱 Attempting to send registration WhatsApp to: ${participant.whatsapp_no}`);
		whatsappService.sendRegistrationMessage(participant.whatsapp_no, participant.name)
			.then((result) => {
				if (result.success) {
					console.log(`✅ Registration WhatsApp sent successfully to ${participant.whatsapp_no}`);
					console.log(`   Message ID: ${result.messageId}`);
				} else {
					console.error(`❌ Failed to send registration WhatsApp to ${participant.whatsapp_no}`);
					console.error(`   Error: ${result.error}`);
				}
			})
			.catch((error) => {
				console.error("❌ Error sending registration WhatsApp:", error);
			});			// Generate token for auto-login
			const { signToken } = await import("@/utils/jwt");
			const token = signToken({
				id: participant.id,
				email: participant.email,
				role: "participant",
			});

			res.status(201).json({
				success: true,
				message: "Registration successful",
				token,
				participant: {
					id: participant.id,
					name: participant.name,
					email: participant.email,
					category: participant.category,
					city: participant.city,
				},
			});
		} catch (error) {
			console.error("Error in register:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get participant by ID
	 */
	async getById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const participant = await databaseService.getParticipantById(id);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: participant,
			});
		} catch (error) {
			console.error("Error in getById:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get participant by email
	 */
	async getByEmail(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.params;

			const participant = await databaseService.getParticipantByEmail(email);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: participant,
			});
		} catch (error) {
			console.error("Error in getByEmail:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all participants
	 */
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { category, is_present } = req.query;

			const filters: { category?: Category; is_present?: boolean } = {};
			if (category) {
				filters.category = category as Category;
			}
			if (is_present !== undefined) {
				filters.is_present = is_present === "true";
			}

			const { participants } = await databaseService.getParticipants(filters);

			res.status(200).json({
				success: true,
				data: participants,
				count: participants.length,
			});
		} catch (error) {
			console.error("Error in getAll:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update participant presence status via QR scan
	 */
	async scanQRCode(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			// Get participant
			const participant = await databaseService.getParticipantById(id);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Update is_present to true
			const updatedParticipant = await databaseService.updateParticipant(id, { is_present: true });

			if (!updatedParticipant) {
				res.status(500).json({
					success: false,
					message: "Failed to update presence",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Attendance marked successfully",
				data: {
					id: updatedParticipant.id,
					name: updatedParticipant.name,
					is_present: updatedParticipant.is_present,
				},
			});
		} catch (error) {
			console.error("Error in scanQRCode:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Update participant presence status
	 */
	async updatePresence(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { is_present } = req.body;

			if (typeof is_present !== "boolean") {
				res.status(400).json({
					success: false,
					message: "is_present must be a boolean",
				});
				return;
			}

			const participant = await databaseService.updateParticipant(id, { is_present });

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Presence updated successfully",
				data: participant,
			});
		} catch (error) {
			console.error("Error in updatePresence:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get participant tasks based on category
	 */
	async getTasks(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			// Get participant
			const participant = await databaseService.getParticipantById(id);

			if (!participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Get tasks for participant's category
			const tasks = await databaseService.getAllTasks(participant.category);

			res.status(200).json({
				success: true,
				data: tasks,
			});
		} catch (error) {
			console.error("Error in getTasks:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get participant statistics
	 */
	async getStatistics(_req: Request, res: Response): Promise<void> {
		try {
			const stats = await databaseService.getParticipantStatistics();

			res.status(200).json({
				success: true,
				data: stats,
			});
		} catch (error) {
			console.error("Error in getStatistics:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Login participant with email and password
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

			// Find participant by email
			const participant = await databaseService.getParticipantByEmail(email);

			if (!participant) {
				res.status(401).json({
					success: false,
					message: "Invalid credentials",
				});
				return;
			}

			// Verify password
			const bcrypt = await import("bcryptjs");
			const isPasswordValid = await bcrypt.compare(
				password,
				participant.password_hash || ""
			);

			if (!isPasswordValid) {
				res.status(401).json({
					success: false,
					message: "Invalid credentials",
				});
				return;
			}

			const { signToken } = await import("@/utils/jwt");
			const token = signToken({
				id: participant.id,
				email: participant.email,
				role: "participant",
			});

			res.status(200).json({
				success: true,
				message: "Login successful",
				token,
				participant: {
					id: participant.id,
					name: participant.name,
					email: participant.email,
					category: participant.category,
					city: participant.city,
				},
			});
		} catch (error) {
			console.error("Error in participant login:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Check if event has started
	 */
	async checkEventStatus(_req: Request, res: Response): Promise<void> {
		try {
			const settings = await databaseService.getEventSettings();
			const eventStartDate = settings["event_start_date"]
				? new Date(settings["event_start_date"])
				: new Date(process.env.EVENT_START_DATE || "2025-11-15T09:00:00+05:30");

			const now = new Date();
			const hasStarted = now >= eventStartDate;

			res.status(200).json({
				success: true,
				data: {
					hasStarted,
					eventStartDate: eventStartDate.toISOString(),
					currentTime: now.toISOString(),
					timeUntilStart: hasStarted
						? 0
						: eventStartDate.getTime() - now.getTime(),
				},
			});
		} catch (error) {
			console.error("Error in checkEventStatus:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Forgot Password - Generate new password and email it
	 */
	async forgotPassword(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({
					success: false,
					message: "Email is required",
				});
				return;
			}

			// Find participant by email
			const participant = await databaseService.getParticipantByEmail(email);

			if (!participant) {
				// Return success even if email doesn't exist to prevent enumeration
				// But for this specific event context, giving feedback is probably more helpful
				res.status(404).json({
					success: false,
					message: "Email not registered",
				});
				return;
			}

			// Generate new random password (8 characters)
			const newPassword = Math.random().toString(36).slice(-8);

			// Hash new password
			const bcrypt = await import("bcryptjs");
			const password_hash = await bcrypt.hash(newPassword, 10);

			// Update database
			await databaseService.updateParticipant(participant.id, { password_hash });

			// Send email
			await emailService.sendPasswordResetEmail(participant, newPassword);

			res.status(200).json({
				success: true,
				message: "New password sent to your email",
			});
		} catch (error) {
			console.error("Error in forgotPassword:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}
}

export default new ParticipantController();
