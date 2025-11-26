import {
	whatsappClient,
	phoneNumberId,
	isWhatsAppConfigured,
} from "./whatsapp-transport";
import { AxiosError } from "axios";
import { whatsappLogger } from "@/utils/whatsapp-logger";

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
		whatsappLogger.logFunctionEntry("sendTemplate", {
			to: options.to,
			templateName: options.template.name,
			templateLanguage: options.template.language.code,
			hasComponents: !!options.template.components,
			componentCount: options.template.components?.length || 0,
		});

		if (!isWhatsAppConfigured) {
			whatsappLogger.warning(
				"WhatsApp not configured - skipping message send",
				{
					function: "sendTemplate",
					to: options.to,
					templateName: options.template.name,
				}
			);

			const result = {
				success: false,
				error: "WhatsApp Cloud API not configured",
			};

			whatsappLogger.logFunctionExit("sendTemplate", result);
			return result;
		}

		try {
			const payload = {
				messaging_product: "whatsapp",
				to: options.to,
				type: "template",
				template: options.template,
			};

			whatsappLogger.info("Preparing to send WhatsApp template", {
				function: "sendTemplate",
				to: options.to,
				templateName: options.template.name,
				endpoint: `/${phoneNumberId}/messages`,
			});

			whatsappLogger.debug("Template payload", {
				function: "sendTemplate",
				payload,
			});

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

				whatsappLogger.logMessageSent(
					messageId,
					options.to,
					options.template.name
				);

				whatsappLogger.debug("Full Meta API response", {
					function: "sendTemplate",
					responseData: response.data,
					contacts: response.data.contacts,
					messages: response.data.messages,
				});

				const result = {
					success: true,
					messageId,
					details: response.data,
				};

				whatsappLogger.logFunctionExit("sendTemplate", {
					success: true,
					messageId,
				});
				return result;
			}

			whatsappLogger.error("No message ID returned from WhatsApp API", {
				function: "sendTemplate",
				to: options.to,
				templateName: options.template.name,
				responseData: response.data,
			});

			const result = {
				success: false,
				error: "No message ID returned from WhatsApp API",
			};

			whatsappLogger.logFunctionExit("sendTemplate", result);
			return result;
		} catch (error) {
			whatsappLogger.error("Error sending WhatsApp message", {
				function: "sendTemplate",
				to: options.to,
				templateName: options.template.name,
				error,
			});

			if (error instanceof AxiosError) {
				const errorData = error.response?.data as any;
				const errorMessage = errorData?.error?.message || error.message;
				const errorCode = errorData?.error?.code;
				const errorType = errorData?.error?.type;
				const fbtraceId = errorData?.error?.fbtrace_id;

				whatsappLogger.error("Meta API Error Details", {
					function: "sendTemplate",
					errorCode,
					errorType,
					errorMessage,
					fbtraceId,
					httpStatus: error.response?.status,
					httpStatusText: error.response?.statusText,
					fullErrorData: errorData,
				});

				const result = {
					success: false,
					error: errorMessage,
					details: errorData,
				};

				whatsappLogger.logFunctionExit("sendTemplate", result);
				return result;
			}

			const result = {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};

			whatsappLogger.logFunctionExit("sendTemplate", result);
			return result;
		}
	}

	async sendRegistrationMessage(
		phoneNumber: string,
		_participantName: string
	): Promise<WhatsAppResult> {
		whatsappLogger.logFunctionEntry("sendRegistrationMessage", {
			phoneNumber,
			participantName: _participantName,
		});

		// Format phone number (remove spaces, dashes, and add country code if not present)
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		const result = await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "application_received",
				language: {
					code: "en",
				},
				components: [
					{
						type: "body",
						parameters: [],
					},
				],
			},
		});

		whatsappLogger.logFunctionExit("sendRegistrationMessage", result);
		return result;
	}

	async sendEventReminderMessage(
		phoneNumber: string,
		_participantName: string,
		_eventName: string,
		_eventDate: Date,
		_daysUntilEvent: number
	): Promise<WhatsAppResult> {
		whatsappLogger.logFunctionEntry("sendEventReminderMessage", {
			phoneNumber,
			participantName: _participantName,
			eventName: _eventName,
			eventDate: _eventDate,
			daysUntilEvent: _daysUntilEvent,
		});

		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		const result = await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "hello_world",
				language: {
					code: "en",
				},
			},
		});

		whatsappLogger.logFunctionExit("sendEventReminderMessage", result);
		return result;
	}

	private formatPhoneNumber(phoneNumber: string): string {
		whatsappLogger.debug("Formatting phone number", {
			function: "formatPhoneNumber",
			original: phoneNumber,
		});

		// Remove all non-numeric characters
		let cleaned = phoneNumber.replace(/\D/g, "");

		// If the number doesn't start with a country code, assume it's Indian (+91)
		if (!cleaned.startsWith("91") && cleaned.length === 10) {
			cleaned = "91" + cleaned;
		}

		// WhatsApp expects numbers without + prefix
		whatsappLogger.logPhoneNumberFormatting(phoneNumber, cleaned);
		return cleaned;
	}

	async getServiceStatus(): Promise<unknown> {
		whatsappLogger.logFunctionEntry("getServiceStatus");

		const status = {
			configured: isWhatsAppConfigured,
			phoneNumberId,
			provider: isWhatsAppConfigured
				? "WhatsApp Cloud API (Meta)"
				: "Not Configured",
			timestamp: new Date().toISOString(),
		};

		whatsappLogger.info("WhatsApp service status checked", {
			function: "getServiceStatus",
			...status,
		});

		whatsappLogger.logFunctionExit("getServiceStatus", status);
		return status;
	}

	async sendApprovalMessage(
		phoneNumber: string,
		participantName: string
	): Promise<WhatsAppResult> {
		whatsappLogger.logFunctionEntry("sendApprovalMessage", {
			phoneNumber,
			participantName,
		});

		// Format phone number
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		if (!isWhatsAppConfigured) {
			whatsappLogger.warning(
				"WhatsApp not configured - using mock approval message",
				{
					function: "sendApprovalMessage",
					to: formattedPhone,
					participantName,
				}
			);

			const result = { success: true, messageId: "mock-approval-id" };
			whatsappLogger.logFunctionExit("sendApprovalMessage", result);
			return result;
		}

		const result = await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "icon_selected",
				language: {
					code: "en",
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

		whatsappLogger.logFunctionExit("sendApprovalMessage", result);
		return result;
	}

	async sendRejectionMessage(
		phoneNumber: string,
		participantName: string
	): Promise<WhatsAppResult> {
		whatsappLogger.logFunctionEntry("sendRejectionMessage", {
			phoneNumber,
			participantName,
		});

		// Format phone number
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		if (!isWhatsAppConfigured) {
			whatsappLogger.warning(
				"WhatsApp not configured - using mock rejection message",
				{
					function: "sendRejectionMessage",
					to: formattedPhone,
					participantName,
				}
			);

			const result = { success: true, messageId: "mock-rejection-id" };
			whatsappLogger.logFunctionExit("sendRejectionMessage", result);
			return result;
		}

		const result = await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "icon_not_selected",
				language: {
					code: "en",
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

		whatsappLogger.logFunctionExit("sendRejectionMessage", result);
		return result;
	}

	async testWhatsApp(testPhoneNumber: string): Promise<WhatsAppResult> {
		whatsappLogger.info("Testing WhatsApp service", {
			function: "testWhatsApp",
			testPhoneNumber,
		});

		const formattedPhone = this.formatPhoneNumber(testPhoneNumber);

		const result = await this.sendTemplate({
			to: formattedPhone,
			template: {
				name: "hello_world",
				language: {
					code: "en",
				},
			},
		});

		whatsappLogger.logFunctionExit("testWhatsApp", result);
		return result;
	}
}

export const whatsappService = new WhatsAppService();
