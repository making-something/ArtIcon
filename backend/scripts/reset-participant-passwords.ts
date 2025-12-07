import bcrypt from "bcryptjs";
import db from "../src/config/database";

const TARGET_EMAILS = [
	"Meetmand123@gmail.com",
];

const NEW_PASSWORD = "123456";

async function resetParticipantPasswords(): Promise<void> {
	const emails = TARGET_EMAILS.map((email) => email.trim()).filter(Boolean);

	if (emails.length === 0) {
		console.log("No emails provided. Add emails to TARGET_EMAILS.");
		process.exit(1);
	}

	try {
		const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
		const updateStmt = db.prepare(`
      UPDATE participants
      SET password_hash = ?, updated_at = datetime('now')
      WHERE email = ?
    `);

		let updatedCount = 0;
		const missing: string[] = [];

		db.transaction((targets: string[]) => {
			targets.forEach((email) => {
				const result = updateStmt.run(passwordHash, email);
				if (result.changes > 0) {
					updatedCount += 1;
				} else {
					missing.push(email);
				}
			});
		})(emails);

		console.log(`✅ Updated ${updatedCount} participant password(s) to ${NEW_PASSWORD}.`);

		if (missing.length > 0) {
			console.log(`⚠️ No participant found for ${missing.length} email(s):`);
			missing.forEach((email) => console.log(` - ${email}`));
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Failed to reset passwords:", error);
		process.exit(1);
	}
}

resetParticipantPasswords();
