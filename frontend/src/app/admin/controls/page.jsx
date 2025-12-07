"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./controls.css";

export default function EventControls() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [controls, setControls] = useState({
		taskShowTime: "2025-12-07T10:00:00",
		taskDurations: {
			ui_ux: "7 hours",
			graphics: "7 hours",
			video: "7 hours",
		},
		submissionsClosed: false,
	});

	useEffect(() => {
		fetchControls();
	}, []);

	const fetchControls = async () => {
		try {
			const token = localStorage.getItem("adminToken");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-controls`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setControls(data.data);
			}
		} catch (error) {
			console.error("Error fetching controls:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const token = localStorage.getItem("adminToken");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-controls`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(controls),
				}
			);

			if (response.ok) {
				alert("Event controls updated successfully!");
			} else {
				alert("Failed to update controls");
			}
		} catch (error) {
			console.error("Error saving controls:", error);
			alert("Error saving controls");
		} finally {
			setSaving(false);
		}
	};

	const handleAnnounceWinners = async () => {
		if (
			!confirm(
				"Are you sure you want to announce winners? This will redirect all users to the winner page."
			)
		) {
			return;
		}

		try {
			const token = localStorage.getItem("adminToken");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/winners/announce`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				alert("Winners announced! All users will be redirected.");
			} else {
				alert("Failed to announce winners");
			}
		} catch (error) {
			console.error("Error announcing winners:", error);
			alert("Error announcing winners");
		}
	};

	if (loading) {
		return <div className="admin-loading">Loading...</div>;
	}

	return (
		<div className="event-controls-container">
			<div className="controls-header">
				<h1>Event Controls</h1>
				<button onClick={() => router.push("/admin")} className="back-btn">
					← Back to Admin
				</button>
			</div>

			<div className="controls-section">
				<h2>Task Settings</h2>

				<div className="control-group">
					<label>Task Show Time</label>
					<input
						type="datetime-local"
						value={controls.taskShowTime}
						onChange={(e) =>
							setControls({ ...controls, taskShowTime: e.target.value })
						}
					/>
					<small>When tasks become visible to participants</small>
				</div>

				<div className="control-group">
					<label>Task Durations</label>
					<div className="duration-inputs">
						<div>
							<span>UI/UX:</span>
							<input
								type="text"
								value={controls.taskDurations.ui_ux}
								onChange={(e) =>
									setControls({
										...controls,
										taskDurations: {
											...controls.taskDurations,
											ui_ux: e.target.value,
										},
									})
								}
							/>
						</div>
						<div>
							<span>Graphics:</span>
							<input
								type="text"
								value={controls.taskDurations.graphics}
								onChange={(e) =>
									setControls({
										...controls,
										taskDurations: {
											...controls.taskDurations,
											graphics: e.target.value,
										},
									})
								}
							/>
						</div>
						<div>
							<span>Video:</span>
							<input
								type="text"
								value={controls.taskDurations.video}
								onChange={(e) =>
									setControls({
										...controls,
										taskDurations: {
											...controls.taskDurations,
											video: e.target.value,
										},
									})
								}
							/>
						</div>
					</div>
					<small>Duration for each category (e.g., "7 hours")</small>
				</div>
			</div>

			<div className="controls-section">
				<h2>Submission Controls</h2>

				<div className="control-group">
					<label className="toggle-label">
						<input
							type="checkbox"
							checked={controls.submissionsClosed}
							onChange={(e) =>
								setControls({
									...controls,
									submissionsClosed: e.target.checked,
								})
							}
						/>
						<span>Close Submissions</span>
					</label>
					<small>When enabled, participants cannot submit their work</small>
				</div>
			</div>

			<div className="controls-section">
				<h2>Winner Announcement</h2>

				<div className="control-group">
					<button onClick={handleAnnounceWinners} className="announce-btn">
						🏆 Announce Winners
					</button>
					<small className="warning">
						⚠️ This will redirect all users to the winner page immediately
					</small>
				</div>
			</div>

			<div className="controls-actions">
				<button onClick={handleSave} disabled={saving} className="save-btn">
					{saving ? "Saving..." : "Save Changes"}
				</button>
			</div>
		</div>
	);
}
