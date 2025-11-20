/**
 * API Service for ArtIcon Backend
 * Centralized API communication layer
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
	const url = `${API_BASE_URL}${endpoint}`;
	
	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	// Add auth token if available
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	}

	try {
		const response = await fetch(url, config);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'API request failed');
		}

		return data;
	} catch (error) {
		console.error('API Error:', error);
		throw error;
	}
}

/**
 * Participant Registration
 */
export async function registerParticipant(formData) {
	return apiRequest('/api/participants/register', {
		method: 'POST',
		body: JSON.stringify({
			fullName: formData.fullName,
			email: formData.email,
			phone: formData.phone,
			city: formData.city,
			portfolio: formData.portfolio,
			role: formData.role,
			experience: formData.experience,
			organization: formData.organization,
			specialization: formData.specialization,
			source: formData.source,
			password: formData.password,
		}),
	});
}

/**
 * Participant Login
 */
export async function loginParticipant(email, password) {
	const response = await apiRequest('/api/participants/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});

	// Store token in localStorage
	if (response.success && response.token) {
		if (typeof window !== 'undefined') {
			localStorage.setItem('authToken', response.token);
			localStorage.setItem('participant', JSON.stringify(response.participant));
		}
	}

	return response;
}

/**
 * Logout
 */
export function logout() {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('authToken');
		localStorage.removeItem('participant');
	}
}

/**
 * Get current participant from localStorage
 */
export function getCurrentParticipant() {
	if (typeof window !== 'undefined') {
		const participant = localStorage.getItem('participant');
		return participant ? JSON.parse(participant) : null;
	}
	return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
	if (typeof window !== 'undefined') {
		return !!localStorage.getItem('authToken');
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
	return apiRequest('/api/participants/event-status');
}

export default {
	registerParticipant,
	loginParticipant,
	logout,
	getCurrentParticipant,
	isAuthenticated,
	getParticipantById,
	checkEventStatus,
};

