import fs from "fs";
import path from "path";
import db from "@/config/database";

type TableConfig = {
	table: string;
	headers?: string[];
	orderBy?: string;
};

class BackupService {
	private backupDir = path.join(process.cwd(), "uploads", "backups");

	constructor() {
		if (!fs.existsSync(this.backupDir)) {
			fs.mkdirSync(this.backupDir, { recursive: true });
		}
	}

	private escapeCell(value: unknown): string {
		if (value === null || value === undefined) return "";
		const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
		return `"${raw.replace(/"/g, '""')}"`;
	}

	private toCsv(rows: Record<string, unknown>[], headers: string[]): string {
		const safeHeaders = headers.length
			? headers
			: rows.length
				? Object.keys(rows[0])
				: [];

		const headerLine = safeHeaders.join(",");
		const bodyLines = rows.map((row) =>
			safeHeaders.map((header) => this.escapeCell((row as Record<string, unknown>)[header])).join(",")
		);

		return [headerLine, ...bodyLines].join("\n");
	}

	private writeCsv(table: string, content: string): string {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const datedPath = path.join(this.backupDir, `${table}-${timestamp}.csv`);
		const latestPath = path.join(this.backupDir, `${table}-latest.csv`);

		fs.writeFileSync(datedPath, content, "utf8");
		fs.writeFileSync(latestPath, content, "utf8");
		return datedPath;
	}

	private backupTable({ table, headers = [], orderBy }: TableConfig): string {
		const orderClause = orderBy ? ` ORDER BY ${orderBy}` : "";
		const rows = db.prepare(`SELECT * FROM ${table}${orderClause}`).all() as Record<string, unknown>[];
		const csv = this.toCsv(rows, headers);
		return this.writeCsv(table, csv);
	}

	async backupAll(reason?: string): Promise<void> {
		const tables: TableConfig[] = [
			{
				table: "participants",
				headers: [
					"id",
					"name",
					"email",
					"whatsapp_no",
					"category",
					"city",
					"portfolio_url",
					"portfolio_file_path",
					"is_present",
					"role",
					"experience",
					"organization",
					"specialization",
					"source",
					"password_hash",
					"approval_status",
					"approved_at",
					"rejected_at",
					"admin_notes",
					"created_at",
					"updated_at",
				],
				orderBy: "created_at DESC",
			},
			{ table: "tasks", orderBy: "created_at DESC" },
			{ table: "submissions", orderBy: "submitted_at DESC" },
			{ table: "admins", orderBy: "created_at DESC" },
			{ table: "notifications", orderBy: "scheduled_time DESC" },
			{ table: "winners", orderBy: "position ASC" },
			{ table: "event_settings", orderBy: "key ASC" },
		];

		for (const table of tables) {
			try {
				const filePath = this.backupTable(table);
				console.log(
					`💾 Backup written for ${table.table} -> ${path.basename(filePath)}${reason ? ` (reason: ${reason})` : ""}`
				);
			} catch (error) {
				console.error(`Failed to back up table ${table.table}:`, error);
			}
		}
	}
}

export const backupService = new BackupService();
export default backupService;
