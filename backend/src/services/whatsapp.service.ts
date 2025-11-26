import {
	whatsappClient,
	phoneNumberId,
	isWhatsAppConfigured,
} from "./whatsapp-transport";
import { AxiosError } from "axios";

interface WhatsAppTemplateParameter {
	type: "text";
	text: string;
}

interface WhatsAppTemplateComponent {
	type: "header" | "body" | "button";
	parameters: WhatsAppTemplateParameter[];
	sub_type?: string;
	index?: number;
}

interface WhatsAppTemplateMessage {
	name: string;
	language: {
		code: string;
	};
	components?: WhatsAppTemplateComponent[];
}

interface SendTemplateOptions {
	to: string;
	template: WhatsAppTemplateMessage;
}

interface WhatsAppResult {
	success: boolean;
	messageId?: string;
	error?: string;
	details?: unknown;
}

class WhatsAppService {
	async sendTemplate(options: SendTemplateOptions): Promise<WhatsAppResult> {
		if (!isWhatsAppConfigured) {
			console.log("⚠️  WhatsApp not configured - skipping message send");
			return {
				success: false,
				error: "WhatsApp Cloud API not configured",
			};
		}

		try {
			const payload = {
				messaging_product: "whatsapp",
				to: options.to,
				type: "template",
				template: options.template,
			};

			console.log(`📱 Sending WhatsApp template to ${options.to}`);
			console.log(`   Template: ${options.template.name}`);

			const response = await whatsappClient.post(
				`/${phoneNumberId}/messages`,
				payload
			);

			if (
				response.data &&
				response.data.messages &&
				response.data.messages[0]
			) {
				const messageId = response.data.messages[0].id;
				console.log(`✅ WhatsApp message sent successfully`);
				console.log(`   Message ID: ${messageId}`);
				console.log(`   To: ${options.to}`);

				return {
					success: true,
					messageId,
					details: response.data,
				};
			}

			return {
				success: false,
				error: "No message ID returned from WhatsApp API",
			};
		} catch (error) {
			const axiosError = error as AxiosError;
			console.error("❌ Error sending WhatsApp message:");
			console.error(`   To: ${options.to}`);
			console.error(`   Template: ${options.template.name}`);
			console.error(`   Error: ${axiosError.message}`);

			if (axiosError.response) {
				console.error(`   Status: ${axiosError.response.status}`);
				console.error(
					`   Data:`,
					JSON.stringify(axiosError.response.data, null, 2)
				);
			}

			return {
				success: false,
				error: axiosError.message,
				details: axiosError.response?.data,
			};
		}
	}

	async sendRegistrationMessage(
		phoneNumber: string,
		participantName: string
	): Promise<WhatsAppResult> {
		// Format phone number (remove spaces, dashes, and add country code if not present)
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		return await this.sendTemplate({
			to: "9023151861",
			template: {
				name: "application_received",
				language: {
					code: "en",
				},
				components: [
					{
						type: "body",
						parameters: [
							// {
							// 	type: "text",
							// 	text: "",
							// },
						],
					},
				],
			},
		});
	}

	async sendEventReminderMessage(
		phoneNumber: string,
		_participantName: string,
		_eventName: string,
		_eventDate: Date,
		_daysUntilEvent: number
	): Promise<WhatsAppResult> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		return await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "hello_world",
				language: {
					code: "en_US",
				},
			},
		});
	}

	private formatPhoneNumber(phoneNumber: string): string {
		// Remove all non-numeric characters
		let cleaned = phoneNumber.replace(/\D/g, "");

		// If the number doesn't start with a country code, assume it's Indian (+91)
		if (!cleaned.startsWith("91") && cleaned.length === 10) {
			cleaned = "91" + cleaned;
		}

		// WhatsApp expects numbers without + prefix
		return cleaned;
	}

	async getServiceStatus(): Promise<unknown> {
		return {
			configured: isWhatsAppConfigured,
			phoneNumberId,
			provider: isWhatsAppConfigured
				? "WhatsApp Cloud API (Meta)"
				: "Not Configured",
			timestamp: new Date().toISOString(),
		};
	}

	async sendApprovalMessage(
		phoneNumber: string,
		participantName: string
	): Promise<WhatsAppResult> {
		// Format phone number
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		if (!isWhatsAppConfigured) {
			console.log(`📱 [WHATSAPP LOG] To: ${formattedPhone}`);
			console.log(
				`   Message: Portfolio Approved - Hi ${participantName}, your portfolio has been approved!`
			);
			return { success: true, messageId: "mock-approval-id" };
		}

		return await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "icon_selected",
				language: {
					code: "en_US",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: participantName,
							},
						],
					},
				],
			},
		});
	}

	async sendRejectionMessage(
		phoneNumber: string,
		participantName: string
	): Promise<WhatsAppResult> {
		// Format phone number
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		if (!isWhatsAppConfigured) {
			console.log(`📱 [WHATSAPP LOG] To: ${formattedPhone}`);
			console.log(
				`   Message: Portfolio Update - Hi ${participantName}, we've reviewed your portfolio.`
			);
			return { success: true, messageId: "mock-rejection-id" };
		}

		return await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "icon_not_selected",
				language: {
					code: "en_US",
				},
				components: [
					{
						type: "body",
						parameters: [
							{
								type: "text",
								text: participantName,
							},
						],
					},
				],
			},
		});
	}

	async testWhatsApp(testPhoneNumber: string): Promise<WhatsAppResult> {
		console.log("🧪 Testing WhatsApp service...");

		const formattedPhone = this.formatPhoneNumber(testPhoneNumber);

		return await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "hello_world",
				language: {
					code: "en_US",
				},
			},
		});
	}
}

export const whatsappService = new WhatsAppService();
