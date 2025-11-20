import { Request, Response } from "express";
import supabaseAdmin from "@/config/supabase";
import emailService from "@/services/email.service";
import { ParticipantInsert } from "@/types/database";

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
				role,
				experience,
				organization,
				specialization,
				source,
				password,
			} = req.body;

			// Validate required fields
			if (!fullName || !email || !phone || !city || !portfolio || !password) {
				res.status(400).json({
					success: false,
					message: "All required fields must be provided",
				});
				return;
			}

			// Map specialization to category
			const specializationToCategoryMap: {
				[key: string]: "video" | "ui_ux" | "graphics";
			} = {
				"Video Editing": "video",
				"UI/UX Design": "ui_ux",
				"Graphic Design": "graphics",
			};

			const category = specialization
				? specializationToCategoryMap[specialization]
				: "ui_ux";

			if (!category) {
				res.status(400).json({
					success: false,
					message: "Invalid specialization",
				});
				return;
			}

			// Check if email already exists
			const { data: existingParticipant } = await supabaseAdmin
				.from("participants")
				.select("id")
				.eq("email", email)
				.single();

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

			// Create participant
			const participantData: ParticipantInsert = {
				name: fullName,
				email,
				whatsapp_no: phone,
				category,
				city,
				portfolio_url: portfolio,
				role: role || null,
				experience: experience ? parseInt(experience) : 0,
				organization: organization || null,
				specialization: specialization || null,
				source: source || null,
				password_hash,
				is_present: false,
			};

			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.insert(participantData)
				.select()
				.single();

			if (error) {
				console.error("Error creating participant:", error);
				res.status(500).json({
					success: false,
					message: "Failed to register participant",
				});
				return;
			}

			// Send notifications asynchronously
			Promise.all([
				emailService.sendRegistrationEmail(participant),
				// Send WhatsApp registration message
				(async () => {
					const whatsappService = await import("@/services/whatsapp.service");
					await whatsappService.default.sendRegistrationMessage(participant);
				})(),
			]).catch((error) => {
				console.error("Error sending notifications:", error);
			});

			// Generate token for auto-login
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

			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.select("*")
				.eq("id", id)
				.single();

			if (error || !participant) {
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

			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.select("*")
				.eq("email", email)
				.single();

			if (error || !participant) {
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

			let query = supabaseAdmin.from("participants").select("*");

			if (category) {
				query = query.eq("category", category);
			}

			if (is_present !== undefined) {
				query = query.eq("is_present", is_present === "true");
			}

			const { data: participants, error } = await query.order("created_at", {
				ascending: false,
			});

			if (error) {
				console.error("Error fetching participants:", error);
				res.status(500).json({
					success: false,
					message: "Failed to fetch participants",
				});
				return;
			}

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
	 * Send WhatsApp opt-in message to participant
	 */
	async sendOptInMessage(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.select("*")
				.eq("id", id)
				.single();

			if (error || !participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			const whatsappService = await import("@/services/whatsapp.service");
			await whatsappService.default.sendRegistrationMessage(participant);

			res.status(200).json({
				success: true,
				message: "WhatsApp opt-in message sent successfully",
			});
		} catch (error) {
			console.error("Error in sendOptInMessage:", error);
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

			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.update({ is_present })
				.eq("id", id)
				.select()
				.single();

			if (error || !participant) {
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
			const { data: participant, error: participantError } = await supabaseAdmin
				.from("participants")
				.select("category")
				.eq("id", id)
				.single();

			if (participantError || !participant) {
				res.status(404).json({
					success: false,
					message: "Participant not found",
				});
				return;
			}

			// Get tasks for participant's category
			const { data: tasks, error: tasksError } = await supabaseAdmin
				.from("tasks")
				.select("*")
				.eq("category", participant.category)
				.order("created_at", { ascending: true });

			if (tasksError) {
				console.error("Error fetching tasks:", tasksError);
				res.status(500).json({
					success: false,
					message: "Failed to fetch tasks",
				});
				return;
			}

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
			const { data: stats, error } = await supabaseAdmin
				.from("participant_statistics")
				.select("*");

			if (error) {
				console.error("Error fetching statistics:", error);
				res.status(500).json({
					success: false,
					message: "Failed to fetch statistics",
				});
				return;
			}

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
			const { data: participant, error } = await supabaseAdmin
				.from("participants")
				.select("*")
				.eq("email", email)
				.single();

			if (error || !participant) {
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
			const { data: eventStart } = await supabaseAdmin
				.from("event_settings")
				.select("value")
				.eq("key", "event_start_date")
				.single();

			const eventStartDate = eventStart?.value
				? new Date(eventStart.value)
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
}

export default new ParticipantController();
