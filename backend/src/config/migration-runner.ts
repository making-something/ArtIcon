// import db from "./database";
// import fs from "fs";
// import path from "path";

// class MigrationRunner {
// 	// Prefer a runtime migrations folder (project root `migrations/`) or
// 	// the path specified via `MIGRATIONS_PATH`. Fall back to the source
// 	// `src/migrations` path which is used during development.
// 	private migrationsPath: string = (() => {
// 		const envPath = process.env.MIGRATIONS_PATH;
// 		if (envPath) return path.resolve(envPath);

// 		const cwdPath = path.join(process.cwd(), "migrations");
// 		if (fs.existsSync(cwdPath)) return cwdPath;

// 		return path.join(__dirname, "../../src/migrations");
// 	})();

// 	async runMigrations(): Promise<void> {
// 		console.log("🔄 Checking database migrations...");

// 		// Create migrations table if it doesn't exist
// 		this.createMigrationsTable();

// 		// Get all migration files
// 		const migrationFiles = fs
// 			.readdirSync(this.migrationsPath)
// 			.filter((file) => file.endsWith(".sql"))
// 			.sort();

// 		// Get executed migrations
// 		const executedMigrations = this.getExecutedMigrations();

// 		// Check if there are pending migrations
// 		const pendingMigrations = migrationFiles.filter(
// 			(file) => !executedMigrations.includes(file)
// 		);

// 		if (pendingMigrations.length === 0) {
// 			console.log("✅ All migrations up to date");
// 			return;
// 		}

// 		// Run pending migrations
// 		for (const file of pendingMigrations) {
// 			await this.runMigration(file);
// 		}

// 		console.log("✅ All migrations completed successfully!");
// 	}

// 	private createMigrationsTable(): void {
// 		const sql = `
//       CREATE TABLE IF NOT EXISTS migrations (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         filename TEXT NOT NULL UNIQUE,
//         executed_at TEXT DEFAULT (datetime('now'))
//       )
//     `;
// 		db.exec(sql);
// 	}

// 	private getExecutedMigrations(): string[] {
// 		const stmt = db.prepare("SELECT filename FROM migrations ORDER BY id");
// 		const rows = stmt.all() as { filename: string }[];
// 		return rows.map((row) => row.filename);
// 	}

// 	private async runMigration(filename: string): Promise<void> {
// 		console.log(`📝 Running migration: ${filename}`);

// 		const filePath = path.join(this.migrationsPath, filename);
// 		const sql = fs.readFileSync(filePath, "utf8");

// 		try {
// 			// Execute the migration in a transaction
// 			const transaction = db.transaction(() => {
// 				// Run the migration SQL
// 				db.exec(sql);

// 				// Record the migration
// 				const insertStmt = db.prepare(
// 					"INSERT INTO migrations (filename) VALUES (?)"
// 				);
// 				insertStmt.run(filename);
// 			});

// 			transaction();
// 			console.log(`✅ Migration ${filename} completed successfully`);
// 		} catch (error) {
// 			console.error(`❌ Migration ${filename} failed:`, error);
// 			throw error;
// 		}
// 	}

// 	async rollbackMigration(filename: string): Promise<void> {
// 		console.log(`⏪ Rolling back migration: ${filename}`);

// 		try {
// 			const deleteStmt = db.prepare(
// 				"DELETE FROM migrations WHERE filename = ?"
// 			);
// 			const result = deleteStmt.run(filename);

// 			if (result.changes > 0) {
// 				console.log(`✅ Migration ${filename} rolled back successfully`);
// 			} else {
// 				console.log(`⚠️ Migration ${filename} was not executed`);
// 			}
// 		} catch (error) {
// 			console.error(`❌ Rollback of ${filename} failed:`, error);
// 			throw error;
// 		}
// 	}

// 	getMigrationStatus(): { pending: string[]; executed: string[] } {
// 		const migrationFiles = fs
// 			.readdirSync(this.migrationsPath)
// 			.filter((file) => file.endsWith(".sql"))
// 			.sort();

// 		const executedMigrations = this.getExecutedMigrations();
// 		const pendingMigrations = migrationFiles.filter(
// 			(file) => !executedMigrations.includes(file)
// 		);

// 		return {
// 			pending: pendingMigrations,
// 			executed: executedMigrations,
// 		};
// 	}
// }

// export default new MigrationRunner();
