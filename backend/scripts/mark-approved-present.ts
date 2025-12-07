import db from "../src/config/database";

async function markApprovedAsPresent() {
  console.log("Starting to mark approved participants as present...");

  try {
    const stmt = db.prepare(
      "UPDATE participants SET is_present = 1 WHERE approval_status = 'approved'"
    );
    const info = stmt.run();

    console.log(`Successfully updated ${info.changes} participants.`);
  } catch (error) {
    console.error("Error updating participants:", error);
  }
}

markApprovedAsPresent();
