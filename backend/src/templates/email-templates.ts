import { Participant } from "@/types/database";

/**
 * Modern, minimalistic email templates matching ArtIcon's design aesthetic
 * Color scheme: #e3e3db (base-100), #1a1614 (base-400), #ff6e14 (base-500)
 */

// Base email wrapper with consistent styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #e3e3db;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Header component
const emailHeader = (title: string, subtitle?: string) => `
<tr>
  <td style="padding: 60px 40px 40px; text-align: center; background-color: #1a1614;">
    <h1 style="margin: 0 0 ${
			subtitle ? "12px" : "0"
		}; font-size: 28px; font-weight: 700; color: #e3e3db; text-transform: uppercase; letter-spacing: 1px;">${title}</h1>
    ${
			subtitle
				? `<div style="width: 60px; height: 3px; background-color: #ff6e14; margin: 0 auto;"></div>`
				: ""
		}
  </td>
</tr>
`;

// Footer component
const emailFooter = () => `
<tr>
  <td style="padding: 30px 40px; background-color: #1a1614; text-align: center;">
    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #e3e3db; text-transform: uppercase; letter-spacing: 1px;">Team ArtIcon</p>
  </td>
</tr>
`;

// Info box component
const infoBox = (title: string, items: string[]) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ccccc4; border-left: 4px solid #ff6e14;">
  <tr>
    <td style="padding: 24px;">
      <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1614; text-transform: uppercase; letter-spacing: 0.5px;">${title}</p>
      ${items
				.map(
					(item) =>
						`<p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614;">${item}</p>`
				)
				.join("")}
    </td>
  </tr>
</table>
`;

export const registrationTemplate = (_participant: Participant) => {
	const content = `
    ${emailHeader("Registration Received", "Portfolio Under Review")}

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Your registration for ArtIcon 2025 has been successfully received.
        </p>
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Our team is currently reviewing your portfolio. You will receive an email notification once the review is complete.
        </p>

        ${infoBox("What's Next", [
					"Portfolio review within 24-48 hours",
					"Email notification with decision",
					"Event details and QR code if approved",
				])}

        <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77;">
          Thank you for your patience.
        </p>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};


export const approvalTemplate = (
  participant: Participant,
  eventDate?: Date,
  qrCid = "participant-qrcode"
) => {
  const eventDateObj = eventDate || new Date();
  const eventDateStr = eventDateObj.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
  const eventTimeStr = eventDateObj.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const content = `
    ${emailHeader("Portfolio Approved", "You're Selected for ArtIcon 2025")}

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Congratulations ${participant.name},
        </p>
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Your portfolio has been reviewed and approved. We're excited to see your creativity in action at ArtIcon 2025.
        </p>

        ${infoBox("Event Details", [
					`Date: ${eventDateStr}`,
					`Time: ${eventTimeStr}`,
					"Venue: Floor 3, Rumi Plaza, Airport Main Rd",
					"Near Race Course Road, Maruti Nagar",
					"Rajkot, Gujarat 360001",
				])}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0; background-color: #1a1614;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #e3e3db; letter-spacing: 0.5px;">Your Entry QR Code</p>
          <img src="cid:${qrCid}" alt="Entry QR" style="width: 200px; height: 200px; border: 6px solid #e3e3db; background: #ffffff; border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);" />
          <p style="margin: 12px 0 0; font-size: 13px; color: #8c7e77;">Present this QR at check-in for seamless entry.</p>
        </td>
      </tr>
    </table>

        <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77;">
          We look forward to seeing you there.
        </p>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};

export const rejectionTemplate = (participant: Participant) => {
	const content = `
    ${emailHeader("Application Update", "Portfolio Review Complete")}

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Hello ${participant.name},
        </p>
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Thank you for your interest in ArtIcon 2025. After reviewing your portfolio, we regret to inform you that you were not selected this time.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ccccc4; border-left: 4px solid #8c7e77;">
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #1a1614;">
                We truly appreciate your effort and encourage you to participate in future events. Your creativity matters.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77;">
          Thank you for understanding.
        </p>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};

export const eventReminderTemplate = (
	participant: Participant,
  eventDate: Date,
  qrCid = "participant-qrcode"
) => {
	const eventDateStr = eventDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const eventTimeStr = eventDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const content = `
    ${emailHeader("Event Reminder", "ArtIcon 2025 Tomorrow")}

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Hi ${participant.name},
        </p>
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          This is a friendly reminder that ArtIcon 2025 starts tomorrow. Please bring your QR code (attached) for check-in.
        </p>

        ${infoBox("Event Details", [
					`Date: ${eventDateStr}`,
					`Time: ${eventTimeStr}`,
					"Venue: Floor 3, Rumi Plaza, Airport Main Rd",
					"Rajkot, Gujarat 360001",
				])}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0; background-color: #1a1614;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #e3e3db; letter-spacing: 0.5px;">Your Entry QR Code</p>
          <img src="cid:${qrCid}" alt="Entry QR" style="width: 200px; height: 200px; border: 6px solid #e3e3db; background: #ffffff; border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);" />
          <p style="margin: 12px 0 0; font-size: 13px; color: #8c7e77;">Show this QR at the registration desk.</p>
        </td>
      </tr>
    </table>

        ${infoBox("What to Bring", [
					"Your QR code (attached to this email)",
					"Valid ID for verification",
					"Laptop and charger",
					"Creative mindset and enthusiasm",
				])}

        <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77;">
          See you tomorrow.
        </p>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};

export const passwordResetTemplate = (
	participant: Participant,
	newPassword: string
) => {
	const content = `
    ${emailHeader("Password Reset", "New Temporary Password")}

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          Hello ${participant.name},
        </p>
        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614;">
          We received a request to reset your password. Here is your new temporary password:
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1614;">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #ff6e14; letter-spacing: 2px; font-family: 'Courier New', monospace;">${newPassword}</p>
            </td>
          </tr>
        </table>

        <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77;">
          Please change this password after logging in.
        </p>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};

export const customNotificationTemplate = (
	subject: string,
	message: string,
	priority: "low" | "medium" | "high" = "medium"
) => {
	const priorityColors = {
		low: "#9bc1bc",
		medium: "#ff6e14",
		high: "#ed6a5a",
	};

	const content = `
    <tr>
      <td style="padding: 60px 40px 40px; text-align: center; background-color: ${
				priorityColors[priority]
			};">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">${subject}</h1>
      </td>
    </tr>

    <tr>
      <td style="padding: 50px 40px; background-color: #e3e3db;">
        <div style="font-size: 16px; line-height: 1.8; color: #1a1614; white-space: pre-wrap;">${message}</div>
      </td>
    </tr>

    ${emailFooter()}
  `;

	return emailWrapper(content);
};
