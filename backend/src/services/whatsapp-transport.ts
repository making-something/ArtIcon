import axios, { AxiosInstance, AxiosError } from "axios";
import { whatsappLogger } from "@/utils/whatsapp-logger";

const WHATSAPP_API_BASE_URL = "https://graph.facebook.com/v21.0";

interface WhatsAppConfig {
	phoneNumberId: string;
	accessToken: string;
	businessAccountId: string;
}

class WhatsAppTransport {
	private client: AxiosInstance;
	private phoneNumberId: string;
	private businessAccountId: string;
	private isConfigured: boolean;

	constructor() {
		whatsappLogger.info("Initializing WhatsApp Transport", {
			function: "constructor",
		});

		this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
		const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
		this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

		this.isConfigured = !!(
			this.phoneNumberId &&
			accessToken &&
			this.businessAccountId
		);

		// Log configuration details
		whatsappLogger.logConfigurationStatus(this.isConfigured, {
			phoneNumberId: this.phoneNumberId
				? `***${this.phoneNumberId.slice(-4)}`
				: "NOT_SET",
			businessAccountId: this.businessAccountId
				? `***${this.businessAccountId.slice(-4)}`
				: "NOT_SET",
			accessToken: accessToken ? "SET" : "NOT_SET",
			apiBaseUrl: WHATSAPP_API_BASE_URL,
		});

		this.client = axios.create({
			baseURL: WHATSAPP_API_BASE_URL,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		// Add request interceptor for logging
		this.client.interceptors.request.use(
			(config) => {
				whatsappLogger.logApiRequest(
					config.url || "unknown",
					config.data,
					config.headers as Record<string, string>
				);
				return config;
			},
			(error) => {
				whatsappLogger.logApiError("REQUEST_INTERCEPTOR", error);
				return Promise.reject(error);
			}
		);

		// Add response interceptor for logging
		this.client.interceptors.response.use(
			(response) => {
				whatsappLogger.logApiResponse(
					response.config.url || "unknown",
					response.status,
					response.data
				);
				return response;
			},
			(error: AxiosError) => {
				whatsappLogger.logApiError(error.config?.url || "unknown", error);
				return Promise.reject(error);
			}
		);

		whatsappLogger.success("WhatsApp Transport initialized", {
			function: "constructor",
			isConfigured: this.isConfigured,
		});
	}

	getClient(): AxiosInstance {
		return this.client;
	}

	getPhoneNumberId(): string {
		return this.phoneNumberId;
	}

	getBusinessAccountId(): string {
		return this.businessAccountId;
	}

	isWhatsAppConfigured(): boolean {
		return this.isConfigured;
	}

	getConfig(): WhatsAppConfig {
		return {
			phoneNumberId: this.phoneNumberId,
			accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
			businessAccountId: this.businessAccountId,
		};
	}
}

export const whatsappTransport = new WhatsAppTransport();
export const whatsappClient = whatsappTransport.getClient();
export const phoneNumberId = whatsappTransport.getPhoneNumberId();
export const businessAccountId = whatsappTransport.getBusinessAccountId();
export const isWhatsAppConfigured = whatsappTransport.isWhatsAppConfigured();
