import "dotenv/config";
import fs from "fs";
import path from "path";
import emailService from "../src/services/email.service";

interface CliOptions {
	csvPath: string;
	subject: string;
	body: string;
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
			case "--subject":
				options.subject = args[++i] ?? "";
				break;
			case "--body":
				options.body = args[++i] ?? "";
				break;
			case "--bodyFile": {
				const file = args[++i];
				if (!file) break;
				options.body = fs.readFileSync(path.resolve(file), "utf8");
				break;
			}
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

	if (!options.subject || !options.body) {
		throw new Error(
			"Missing --subject or --body/--bodyFile. Example: tsx manual-mailer/send-manual-email.ts --subject 'Hello' --body 'Message'"
		);
	}

	return options as CliOptions;
}

function csvToRows(csvContent: string): string[][] {
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

function buildHtml(body: string) {
	const safe = body.replace(/\n/g, "<br>");
	return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; padding: 16px; line-height: 1.6; color: #1a1614;">${safe}</div>`;
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
	const html = buildHtml(options.body);
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

		const result = await emailService.sendEmail({
			to: participant.email,
			subject: options.subject,
			html,
			text: options.body,
		});

		if (result.success) {
			const record: SentRecord = {
				id: participant.id,
				email: participant.email,
				name: participant.name,
				subject: options.subject,
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
