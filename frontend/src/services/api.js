/**
 * API Service for ArtIcon Backend
 * Centralized API communication layer
 */

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://api.articon.multiicon.in";

if (!process.env.NEXT_PUBLIC_API_URL) {
	console.warn(
		"Warning: NEXT_PUBLIC_API_URL environment variable is not defined. Using default: https://api.articon.multiicon.in"
	);
}

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;

	const config = {
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	};

	// Add auth token if available
	if (typeof window !== "undefined") {
		// Try admin token first for admin routes, then fall back to participant token
		let token = null;
		if (endpoint.startsWith("/api/admin")) {
			token = localStorage.getItem("adminToken");
		}
		// Fall back to participant token if no admin token or for non-admin routes
		if (!token) {
			token = localStorage.getItem("authToken");
		}
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
	}

	try {
		const response = await fetch(url, config);

		// Check if response is JSON
		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error(
				"Server returned non-JSON response. Please check if the backend is running."
			);
		}

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || `API request failed with status ${response.status}`
			);
		}

		return data;
	} catch (error) {
		console.error("API Error:", error);
		// Provide more helpful error messages
		if (
			error.message.includes("Failed to fetch") ||
			error.message.includes("NetworkError")
		) {
			throw new Error(
				"Cannot connect to server. Please ensure the backend is running and accessible."
			);
		}
		throw error;
	}
}

/**
 * Upload Portfolio File
 */
export async function uploadPortfolioFile(file) {
	const formData = new FormData();
	formData.append("portfolio", file);

	const url = `${API_BASE_URL}/api/portfolio/upload`;

	try {
		const response = await fetch(url, {
			method: "POST",
			body: formData,
			// Don't set Content-Type header - browser will set it with boundary for multipart
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "File upload failed");
		}

		return data;
	} catch (error) {
		console.error("File upload error:", error);
		throw error;
	}
}

/**
 * Participant Registration
 */
export async function registerParticipant(formData) {
	let portfolioFilePath = null;

	// If there's a file, upload it first
	if (formData.portfolioFile) {
		try {
			const uploadResponse = await uploadPortfolioFile(formData.portfolioFile);
			if (uploadResponse.success && uploadResponse.data.filePath) {
				portfolioFilePath = uploadResponse.data.filePath;
			}
		} catch (error) {
			throw new Error("Failed to upload portfolio file: " + error.message);
		}
	}

	// Map specialization to category for backend
	const specializationToCategoryMap = {
		"Video Editing": "video",
		"UI/UX Design": "ui_ux",
		"Graphic Design": "graphics",
		"All": "all", 
	};

	const category =
		specializationToCategoryMap[formData.specialization] || "ui_ux";

	// Transform specialization value: "All-rounder" -> "all"
	const specializationValue =
		formData.specialization === "All-rounder" ? "all" : formData.specialization;

	const response = await apiRequest("/api/participants/register", {
		method: "POST",
		body: JSON.stringify({
			fullName: formData.fullName,
			email: formData.email,
			phone: formData.phone,
			city: formData.city,
			category: category, // Send category instead of relying on specialization mapping
			portfolio: formData.portfolio || null,
			portfolioFile: portfolioFilePath,
			role: formData.role,
			experience: formData.experience,
			organization: formData.organization,
			specialization: specializationValue,
			source: formData.source,
			password: formData.password,
		}),
	});

	// Store token in localStorage and Cookie (Auto-login)
	if (response.success && response.token) {
		if (typeof window !== "undefined") {
			localStorage.setItem("authToken", response.token);
			localStorage.setItem("participant", JSON.stringify(response.participant));
			// Set cookie for middleware access (expires in 7 days)
			document.cookie = `authToken=${response.token}; path=/; max-age=${
				60 * 60 * 24 * 7
			}; SameSite=Lax`;
		}
	}

	return response;
}

/**
 * Admin Login
 */
export async function loginAdmin(email, password) {
	const response = await apiRequest("/api/admin/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});

	// Store admin token
	if (response.success && response.data.token) {
		if (typeof window !== "undefined") {
			localStorage.setItem("adminToken", response.data.token);
			localStorage.setItem("admin", JSON.stringify(response.data.admin));
		}
	}

	return response;
}

/**
 * Participant Login
 */
export async function loginParticipant(email, password) {
	const response = await apiRequest("/api/participants/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});

	// Store token in localStorage and Cookie
	if (response.success && response.token) {
		if (typeof window !== "undefined") {
			localStorage.setItem("authToken", response.token);
			localStorage.setItem("participant", JSON.stringify(response.participant));
			// Set cookie for middleware access (expires in 7 days)
			document.cookie = `authToken=${response.token}; path=/; max-age=${
				60 * 60 * 24 * 7
			}; SameSite=Lax`;
		}
	}

	return response;
}

/**
 * Universal Login - tries admin first, then participant
 */
export async function login(email, password) {
	// Try admin login first
	try {
		const adminResponse = await loginAdmin(email, password);
		if (adminResponse.success) {
			return { success: true, role: "admin", data: adminResponse.data };
		}
	} catch (adminError) {
		// If admin login fails, try participant login
		try {
			const participantResponse = await loginParticipant(email, password);
			if (participantResponse.success) {
				return {
					success: true,
					role: "participant",
					data: participantResponse,
				};
			}
		} catch (participantError) {
			// Both failed, throw the participant error (more common)
			throw participantError;
		}
	}

	throw new Error("Login failed. Please check your credentials.");
}

/**
 * Forgot Password
 */
export async function forgotPassword(email) {
	return apiRequest("/api/participants/forgot-password", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

/**
 * Logout
 */
export function logout() {
	if (typeof window !== "undefined") {
		localStorage.removeItem("authToken");
		localStorage.removeItem("participant");
		localStorage.removeItem("adminToken");
		localStorage.removeItem("admin");
		// Remove cookie
		document.cookie = "authToken=; path=/; max-age=0";
	}
}

/**
 * Get current participant from localStorage
 */
export function getCurrentParticipant() {
	if (typeof window !== "undefined") {
		const participant = localStorage.getItem("participant");
		return participant ? JSON.parse(participant) : null;
	}
	return null;
}

/**
 * Refresh participant data from backend and update localStorage
 */
export async function refreshParticipantData() {
	if (typeof window === "undefined") return null;

	const participant = getCurrentParticipant();
	if (!participant || !participant.id) return null;

	try {
		const response = await apiRequest(`/api/participants/${participant.id}`);

		if (response.success && response.data) {
			// Update localStorage with fresh data
			localStorage.setItem("participant", JSON.stringify(response.data));
			return response.data;
		}

		return null;
	} catch (error) {
		console.error("Error refreshing participant data:", error);
		return null;
	}
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
	if (typeof window !== "undefined") {
		return !!localStorage.getItem("authToken");
	}
	return false;
}

/**
 * Get participant by ID
 */
export async function getParticipantById(id) {
	return apiRequest(`/api/participants/${id}`);
}

/**
 * Check event status
 */
export async function checkEventStatus() {
	return apiRequest("/api/participants/event-status");
}

/**
 * Get participant tasks
 */
export async function getParticipantTasks(participantId) {
	return apiRequest(`/api/participants/${participantId}/tasks`);
}

/**
 * Get all submissions (admin only)
 */
export async function getSubmissions() {
	return apiRequest("/api/submissions");
}

/**
 * Create submission
 */
export async function createSubmission(participantId, taskId, driveLink) {
	return apiRequest("/api/submissions", {
		method: "POST",
		body: JSON.stringify({
			participant_id: participantId,
			task_id: taskId,
			drive_link: driveLink,
		}),
	});
}

/**
 * Update submission score (admin only)
 */
export async function updateSubmissionScore(submissionId, score) {
	return apiRequest(`/api/submissions/${submissionId}`, {
		method: "PUT",
		body: JSON.stringify({ score }),
	});
}

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboardStats() {
	return apiRequest("/api/admin/dashboard/stats");
}

/**
 * Get all participants (admin only)
 */
export async function getAllParticipants() {
	return apiRequest("/api/participants");
}

/**
 * Approve participant (admin only)
 */
export async function approveParticipant(participantId, adminNotes) {
	return apiRequest(`/api/admin/participants/${participantId}/approve`, {
		method: "PUT",
		body: JSON.stringify({ admin_notes: adminNotes }),
	});
}

/**
 * Reject participant (admin only)
 */
export async function rejectParticipant(participantId, adminNotes) {
	return apiRequest(`/api/admin/participants/${participantId}/reject`, {
		method: "PUT",
		body: JSON.stringify({ admin_notes: adminNotes }),
	});
}

/**
 * Export participants as CSV (admin only)
 */
export async function exportParticipantsCSV(
	category = "all",
	approvalStatus = "all"
) {
	const params = new URLSearchParams();
	if (category !== "all") params.append("category", category);
	if (approvalStatus !== "all")
		params.append("approval_status", approvalStatus);

	const token =
		typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

	try {
		const response = await fetch(
			`${API_BASE_URL}/api/admin/participants/export/csv?${params}`,
			{
				headers: {
					Authorization: token ? `Bearer ${token}` : "",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to export CSV");
		}

		// Create download link
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `participants-${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);

		return { success: true };
	} catch (error) {
		console.error("CSV export error:", error);
		throw error;
	}
}

/**
 * Scan QR Code for attendance
 */
export async function scanParticipantQRCode(participantId) {
	return apiRequest(`/api/participants/${participantId}/scan-qr`, {
		method: "POST",
	});
}

const api = {
	registerParticipant,
	uploadPortfolioFile,
	loginParticipant,
	loginAdmin,
	login,
	logout,
	getCurrentParticipant,
	isAuthenticated,
	getParticipantById,
	checkEventStatus,
	getParticipantTasks,
	getSubmissions,
	createSubmission,
	updateSubmissionScore,
	getAdminDashboardStats,
	getAllParticipants,
	approveParticipant,
	rejectParticipant,
	exportParticipantsCSV,
	scanParticipantQRCode,
	forgotPassword,
};

export default api;
