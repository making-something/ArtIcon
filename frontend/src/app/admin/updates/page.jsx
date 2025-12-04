"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./updates.css";

export default function AdminUpdates() {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [status, setStatus] = useState(null);

	const API_URL =
		process.env.NEXT_PUBLIC_API_URL || "https://api.articon.multiicon.in";

	const handleSend = async () => {
		if (!message.trim()) return;

		setSending(true);
		setStatus(null);

		try {
			const token = localStorage.getItem("adminToken");
			if (!token) {
				router.push("/registration");
				return;
			}

			const response = await fetch(`${API_URL}/api/admin/updates`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ message }),
			});

			if (response.ok) {
				setStatus({ type: "success", text: "Update sent successfully!" });
				setMessage("");
			} else {
				setStatus({ type: "error", text: "Failed to send update." });
			}
		} catch (error) {
			setStatus({ type: "error", text: "Error sending update." });
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="admin-updates-container">
			<h1>Send Live Update</h1>
			<div className="update-form">
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Type your update message here..."
					rows={4}
				/>
				<button onClick={handleSend} disabled={sending || !message.trim()}>
					{sending ? "Sending..." : "Send Update"}
				</button>
			</div>
			{status && (
				<div className={`status-message ${status.type}`}>{status.text}</div>
			)}
            <button onClick={() => router.push('/admin/portfolios')}>Back to Portfolios</button>
		</div>
	);
}
