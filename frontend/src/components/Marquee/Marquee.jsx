"use client";

import { useState, useEffect } from "react";
import "./Marquee.css";

export default function Marquee() {
	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		const targetDate = new Date("2025-12-07T09:00:00").getTime();

		const updateCountdown = () => {
			const now = new Date().getTime();
			const difference = targetDate - now;

			if (difference > 0) {
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor(
					(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
				);
				const minutes = Math.floor(
					(difference % (1000 * 60 * 60)) / (1000 * 60)
				);
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				setTimeLeft({ days, hours, minutes, seconds });
			} else {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			}
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, []);

	const formatNumber = (num) => String(num).padStart(2, "0");

	const marqueeContent = (
		<>
			<span className="marquee-date">7TH DECEMBER 2025</span>
			<span className="marquee-symbol">◆</span>
			<span className="marquee-countdown">
				<span className="countdown-unit">
					<span className="countdown-number">
						{formatNumber(timeLeft.days)}
					</span>
					<span className="countdown-label">DD</span>
				</span>
				<span className="countdown-separator">:</span>
				<span className="countdown-unit">
					<span className="countdown-number">
						{formatNumber(timeLeft.hours)}
					</span>
					<span className="countdown-label">HH</span>
				</span>
				<span className="countdown-separator">:</span>
				<span className="countdown-unit">
					<span className="countdown-number">
						{formatNumber(timeLeft.minutes)}
					</span>
					<span className="countdown-label">MM</span>
				</span>
				<span className="countdown-separator">:</span>
				<span className="countdown-unit">
					<span className="countdown-number">
						{formatNumber(timeLeft.seconds)}
					</span>
					<span className="countdown-label">SS</span>
				</span>
			</span>
			<span className="marquee-symbol">◆</span>
		</>
	);

	return (
		<div className="marquee-container">
			<div className="marquee-fade-left"></div>
			<div className="marquee-content">
				<div className="marquee-track">
					{marqueeContent}
					{marqueeContent}
					{marqueeContent}
					{marqueeContent}
					{marqueeContent}
					{marqueeContent}
				</div>
			</div>
			<div className="marquee-fade-right"></div>
		</div>
	);
}
