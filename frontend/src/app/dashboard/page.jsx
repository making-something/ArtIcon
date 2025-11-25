"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentParticipant, isAuthenticated, logout } from "@/services/api";
import "./dashboard.css";

const Dashboard = () => {
	const router = useRouter();
	const [participant, setParticipant] = useState(null);
	const [timeRemaining, setTimeRemaining] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		total: 0,
	});

	// Target date: November 30, 2025, 9:00 AM
	const targetDate = new Date("2025-11-30T09:00:00").getTime();

	const getCategoryLabel = (cat) => {
		const map = {
			video: "Video Editing",
			ui_ux: "UI/UX Design",
			graphics: "Graphic Design",
			all: "All",
		};
		return map[cat] || cat;
	};

	useEffect(() => {
		// Check authentication
		if (!isAuthenticated()) {
			router.push("/registration");
			return;
		}

		// Get participant data
		const userData = getCurrentParticipant();
		setParticipant(userData);

		// Countdown timer
		const calculateTimeRemaining = () => {
			const now = new Date().getTime();
			const difference = targetDate - now;

			if (difference > 0) {
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				setTimeRemaining({
					days,
					hours,
					minutes,
					seconds,
					total: difference,
				});
			} else {
				setTimeRemaining({
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0,
					total: 0,
				});
			}
		};

		// Initial calculation
		calculateTimeRemaining();

		// Update every second
		const interval = setInterval(calculateTimeRemaining, 1000);

		return () => clearInterval(interval);
	}, [router, targetDate]);

	const handleLogout = () => {
		logout();
		router.push("/registration");
	};

	if (!participant) {
		return (
			<div className="dashboard-loading">
				<div className="loading-spinner"></div>
			</div>
		);
	}

	return (
		<div className="dashboard-page">
			<header className="dashboard-header">
				<div className="header-content">
					<h1 className="dashboard-title">
						Visual <span className="accent">Vault</span>
					</h1>
					<div className="header-right">
						<div className="user-info">
							<span className="user-name">{participant.name}</span>
							<span className="user-category">{getCategoryLabel(participant.category)}</span>
						</div>
						<button className="logout-btn" onClick={handleLogout}>
							Logout
						</button>
					</div>
				</div>
			</header>

			<main className="dashboard-main">
				<div className="countdown-container">
					<h2 className="countdown-label">Event Starts In</h2>
					<div className="countdown-date">
						November 30, 2025 • 9:00 AM
					</div>

					{timeRemaining.total > 0 ? (
						<div className="countdown-timer">
							<div className="time-block">
								<div className="time-value">{timeRemaining.days}</div>
								<div className="time-label">Days</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value">
									{String(timeRemaining.hours).padStart(2, "0")}
								</div>
								<div className="time-label">Hours</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value">
									{String(timeRemaining.minutes).padStart(2, "0")}
								</div>
								<div className="time-label">Minutes</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value">
									{String(timeRemaining.seconds).padStart(2, "0")}
								</div>
								<div className="time-label">Seconds</div>
							</div>
						</div>
					) : (
						<div className="event-live">
							<h3>🎉 Event is Live!</h3>
							<p>The competition has started. Good luck!</p>
						</div>
					)}

					<div className="participant-details">
						<div className="detail-item">
							<span className="detail-label">Email:</span>
							<span className="detail-value">{participant.email}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">Category:</span>
							<span className="detail-value">{getCategoryLabel(participant.category)}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">City:</span>
							<span className="detail-value">{participant.city}</span>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
