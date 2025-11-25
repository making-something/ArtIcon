"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentParticipant, isAuthenticated, logout } from "@/services/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import "./dashboard.css";

const Dashboard = () => {
	const router = useRouter();
	const [participant, setParticipant] = useState(null);
	const containerRef = useRef(null);
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

	useGSAP(
		() => {
			if (participant && containerRef.current) {
				// Split text for animation
				// We use a timeout to ensure DOM is ready and layout is settled
				const splitTitle = new SplitType(".countdown-label", {
					types: "chars",
					tagName: "span",
				});

				const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

				// 1. Header Slide Down
				tl.from(".dashboard-header", {
					yPercent: -100,
					opacity: 0,
					duration: 1.2,
				})
					// 2. "Event Starts In" Text Reveal (Char by Char)
					.from(
						splitTitle.chars,
						{
							y: 100,
							opacity: 0,
							stagger: 0.02,
							duration: 1,
							ease: "back.out(1.7)",
						},
						"-=0.8"
					)
					// 3. Date Fade In
					.from(
						".countdown-date",
						{
							opacity: 0,
							y: 20,
							duration: 0.8,
						},
						"-=0.6"
					)
					// 4. Countdown Numbers Slide Up (Slot Machine Effect)
					.from(
						".time-value",
						{
							yPercent: 100, // Slides up from within the mask
							duration: 1.5,
							stagger: 0.1,
							ease: "elastic.out(1, 0.5)",
						},
						"-=0.8"
					)
					// 5. Separators Pop In
					.from(
						".time-separator",
						{
							scale: 0,
							opacity: 0,
							duration: 0.8,
							ease: "back.out(2)",
						},
						"-=1.2"
					)
					// 6. Labels Fade In
					.from(
						".time-label",
						{
							opacity: 0,
							y: 10,
							stagger: 0.05,
							duration: 0.6,
						},
						"-=1.0"
					)
					// 7. Footer Details Slide Up
					.from(
						".participant-details",
						{
							yPercent: 100,
							opacity: 0,
							duration: 1,
							ease: "power2.out",
						},
						"-=1.0"
					)
					.from(
						".detail-item",
						{
							y: 20,
							opacity: 0,
							stagger: 0.1,
							duration: 0.8,
						},
						"-=0.5"
					);

				// Cleanup SplitType on unmount
				return () => {
					splitTitle.revert();
				};
			}
		},
		{ dependencies: [participant], scope: containerRef }
	);

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
		<div className="dashboard-page" ref={containerRef}>
			<header className="dashboard-header">
				<div className="header-content">
					<h1 className="dashboard-title">
						Art<span className="accent">Icon</span>
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
					<div className="text-reveal-mask">
						<h2 className="countdown-label">Event Starts In</h2>
					</div>
					<div className="countdown-date">
						November 30, 2025 • 9:00 AM
					</div>

					{timeRemaining.total > 0 ? (
						<div className="countdown-timer">
							<div className="time-block">
								<div className="time-value-mask">
									<div className="time-value">{timeRemaining.days}</div>
								</div>
								<div className="time-label">Days</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value-mask">
									<div className="time-value">
										{String(timeRemaining.hours).padStart(2, "0")}
									</div>
								</div>
								<div className="time-label">Hours</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value-mask">
									<div className="time-value">
										{String(timeRemaining.minutes).padStart(2, "0")}
									</div>
								</div>
								<div className="time-label">Minutes</div>
							</div>
							<div className="time-separator">:</div>
							<div className="time-block">
								<div className="time-value-mask">
									<div className="time-value">
										{String(timeRemaining.seconds).padStart(2, "0")}
									</div>
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
				</div>

				<div className="participant-details">
					<div className="detail-item">
						<span className="detail-label">Email</span>
						<span className="detail-value">{participant.email}</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">Category</span>
						<span className="detail-value">{getCategoryLabel(participant.category)}</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">City</span>
						<span className="detail-value">{participant.city}</span>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
