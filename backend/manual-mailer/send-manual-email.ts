import "dotenv/config";
import fs from "fs";
import path from "path";
import emailService from "../src/services/email.service";

interface CliOptions {
	csvPath: string;
	dryRun: boolean;
	limit?: number;
}

interface ParticipantRow {
	id: string;
	name: string;
	email: string;
	approvalStatus: string;
}

interface SentRecord {
	id: string;
	email: string;
	name: string;
	subject: string;
	sentAt: string;
}

const DEFAULT_CSV = path.resolve(__dirname, "../participants-2025-12-05.csv");
const SENT_LOG_PATH = path.resolve(__dirname, "sent-log.json");
const TWO_DAY_SUBJECT = "Just a reminder — ArtIcon is in 2 days!";

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: Partial<CliOptions> = {
		csvPath: DEFAULT_CSV,
		dryRun: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "--csv":
				options.csvPath = path.resolve(args[++i] ?? "");
				break;
			case "--limit": {
				const maybeLimit = Number(args[++i]);
				if (!Number.isNaN(maybeLimit) && maybeLimit > 0) {
					options.limit = maybeLimit;
				}
				break;
			}
			case "--dry-run":
				options.dryRun = true;
				break;
			default:
				break;
		}
	}

	return options as CliOptions;
}function csvToRows(csvContent: string): string[][] {
	const rows: string[][] = [];
	let current = "";
	let inQuotes = false;
	let row: string[] = [];

	const pushCell = () => {
		row.push(current.trim());
		current = "";
	};

	for (let i = 0; i < csvContent.length; i++) {
		const char = csvContent[i];
		const next = csvContent[i + 1];

		if (char === "\"") {
			if (inQuotes && next === "\"") {
				current += "\"";
				i++;
				continue;
			}
			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			pushCell();
			continue;
		}

		if ((char === "\n" || char === "\r") && !inQuotes) {
			if (current.length > 0 || row.length > 0) {
				pushCell();
				rows.push(row);
				row = [];
			}
			continue;
		}

		current += char;
	}

	if (current.length > 0 || row.length > 0) {
		pushCell();
		rows.push(row);
	}

	return rows.filter((r) => r.length > 0);
}

function readParticipants(csvPath: string): ParticipantRow[] {
	if (!fs.existsSync(csvPath)) {
		throw new Error(`CSV not found at ${csvPath}`);
	}

	const content = fs.readFileSync(csvPath, "utf8");
	const rows = csvToRows(content);
	if (rows.length === 0) return [];

	const [headerRow, ...dataRows] = rows;
	const headers = headerRow.map((h) => h.toLowerCase());

	const findHeaderIndex = (candidates: string[]) => {
		return headers.findIndex((h) => {
			const normalized = h.replace(/\s+/g, "_");
			return candidates.some((c) => c === h || c === normalized);
		});
	};

	const idIdx = findHeaderIndex(["id"]);
	const nameIdx = findHeaderIndex(["name"]);
	const emailIdx = findHeaderIndex(["email"]);
	const approvalIdx = findHeaderIndex(["approval status", "approval_status"]);

	if (idIdx === -1 || nameIdx === -1 || emailIdx === -1 || approvalIdx === -1) {
		throw new Error("CSV must contain ID, Name, Email, and Approval Status columns");
	}

	return dataRows
		.map((cols) => ({
			id: cols[idIdx],
			name: cols[nameIdx],
			email: cols[emailIdx],
			approvalStatus: cols[approvalIdx]?.toLowerCase().trim() || "",
		}))
		.filter((p) => p.email && p.email.includes("@"));
}

function loadSentLog(logPath: string): { sent: SentRecord[]; sentIds: Set<string>; sentEmails: Set<string> } {
	if (!fs.existsSync(logPath)) {
		return { sent: [], sentIds: new Set(), sentEmails: new Set() };
	}

	const raw = fs.readFileSync(logPath, "utf8");
	try {
		const parsed: SentRecord[] = JSON.parse(raw);
		return {
			sent: parsed,
			sentIds: new Set(parsed.map((r) => r.id)),
			sentEmails: new Set(parsed.map((r) => r.email)),
		};
	} catch (error) {
		throw new Error(`Could not parse sent log at ${logPath}: ${error}`);
	}
}

function persistSentLog(logPath: string, records: SentRecord[]) {
	fs.writeFileSync(logPath, JSON.stringify(records, null, 2), "utf8");
}

function buildHtml(participant: ParticipantRow) {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <style>
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    @media (prefers-color-scheme: dark) {
      body, table, td, p, a, span, div {
        color-scheme: light !important;
      }
    }
    @media only screen and (max-width: 600px) {
      .outer-padding {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f0 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f0 !important;">
    <tr>
      <td class="outer-padding" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #e3e3db !important;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 60px 40px 40px; text-align: center; background-color: #1a1614 !important;">
              <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 700; color: #e3e3db !important; text-transform: uppercase; letter-spacing: 1px;">Two Days to Go</h1>
              <div style="width: 60px; height: 3px; background-color: #ff6e14 !important; margin: 0 auto;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px; background-color: #e3e3db !important;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #1a1614 !important;">
                Hi ${participant.name},
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #1a1614 !important;">
                Just a friendly reminder that ArtIcon 2025 is happening in two days. Time to get your creative engines warmed up.
              </p>

              <!-- Event Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f5ef !important; border-left: 4px solid #ff6e14 !important;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1614 !important; text-transform: uppercase; letter-spacing: 0.5px;">Event Details</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Date: Saturday, December 7, 2025</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Time: 09:00 AM</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Venue: Floor 3, Rumi Plaza, Airport Main Rd</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Near Race Course Road, Maruti Nagar</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Rajkot, Gujarat 360001</p>
                  </td>
                </tr>
              </table>

              <!-- Pre-Event Checklist Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f7f5ef !important; border-left: 4px solid #ff6e14 !important;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1614 !important; text-transform: uppercase; letter-spacing: 0.5px;">Pre-Event Checklist</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Update your software and tools</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Charge your laptop and bring your charger</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Review your portfolio one last time</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Get familiar with the venue location</p>
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">Prepare any questions you might have</p>
                  </td>
                </tr>
              </table>

              <!-- Humor Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; background-color: #f7f5ef !important; border-left: 4px solid #9bc1bc !important;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #1a1614 !important; text-transform: uppercase; letter-spacing: 0.5px;">Wait, Did You Miss Our Last Email?</p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #1a1614 !important;">
                      If you're reading this and thinking "What last email?" — don't panic. We're not judging. Your spam folder might be. 
                      Check there, or just know that we sent you an approval email with all the important details. 
                      If you still can't find it, your QR code will be waiting for you in tomorrow's reminder. 
                      We've got your back.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 14px; color: #8c7e77 !important;">
                See you in two days. Bring your A-game.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1a1614 !important; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #e3e3db !important; text-transform: uppercase; letter-spacing: 1px;">Team ArtIcon</p>
              <p style="margin: 0; font-size: 12px; color: #8c7e77 !important;">
                Need help? Contact us at <a href="tel:+919377769938" style="color: #ff6e14 !important; text-decoration: none;">+91 9377769938</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

async function sendEmails(options: CliOptions) {
	const participants = readParticipants(options.csvPath);
	const log = loadSentLog(SENT_LOG_PATH);

	const approved = participants.filter((p) => p.approvalStatus === "approved");
	const pending = approved.filter(
		(p) => !log.sentIds.has(p.id) && !log.sentEmails.has(p.email)
	);

	if (pending.length === 0) {
		console.log(
			approved.length === 0
				? "Nothing to send. No approved participants found in CSV."
				: "Nothing to send. All approved participants are already recorded as sent."
		);
		return;
	}

	const limit = options.limit ?? pending.length;
	let sentCount = 0;

	console.log(
		`Approved participants: ${approved.length}. Pending (not yet sent): ${pending.length}. Limit: ${limit}`
	);

	for (const participant of pending) {
		if (sentCount >= limit) break;

		if (options.dryRun) {
			console.log(`[DRY RUN] Would send to ${participant.name} <${participant.email}>`);
			sentCount += 1;
			continue;
		}

		const html = buildHtml(participant);

		const result = await emailService.sendEmail({
			to: participant.email,
			subject: TWO_DAY_SUBJECT,
			html,
			text: "ArtIcon is in 2 days. See you soon!",
		});

		if (result.success) {
			const record: SentRecord = {
				id: participant.id,
				email: participant.email,
				name: participant.name,
				subject: TWO_DAY_SUBJECT,
				sentAt: new Date().toISOString(),
			};
			log.sent.push(record);
			log.sentIds.add(record.id);
			log.sentEmails.add(record.email);
			persistSentLog(SENT_LOG_PATH, log.sent);
			console.log(`✅ Sent to ${participant.name} <${participant.email}>`);
			sentCount += 1;
		} else {
			console.error(`❌ Failed for ${participant.email}: ${result.error}`);
		}
	}

	console.log(`Done. Sent ${sentCount} email(s). Log: ${SENT_LOG_PATH}`);
}

(async () => {
	try {
		const options = parseArgs();
		await sendEmails(options);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
})();
