import axios, { AxiosInstance } from "axios";

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
		this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
		const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
		this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

		this.isConfigured = !!(
			this.phoneNumberId &&
			accessToken &&
			this.businessAccountId
		);

		this.client = axios.create({
			baseURL: WHATSAPP_API_BASE_URL,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (this.isConfigured) {
			console.log("✅ WhatsApp Cloud API configured successfully");
			console.log(`   Phone Number ID: ${this.phoneNumberId}`);
			console.log(`   Business Account ID: ${this.businessAccountId}`);
		} else {
			console.log(
				"⚠️  WhatsApp Cloud API not configured - missing credentials"
			);
		}
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
