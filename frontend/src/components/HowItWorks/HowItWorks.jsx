"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./HowItWorks.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HowItWorks = () => {
	const containerRef = useRef(null);

	const steps = [
		{
			number: "01",
			title: "Register Online",
			description:
				"Fill out the registration form with your details. Limited to 100 participants, so register early!",
		},
		{
			number: "02",
			title: "Arrive at Venue",
			description:
				"Show up at Multiicon's 4th Floor on November 30th, 2025 by 9:00 AM. Bring your laptop, software, and creative energy!",
		},
		{
			number: "03",
			title: "Receive the Theme",
			description:
				"At 9:00 AM sharp, the creative theme will be revealed. This single theme will guide all three of your projects.",
		},
		{
			number: "04",
			title: "Create Three Projects",
			description:
				"You have 10.5 hours to design a UI/UX project, create a graphic design, and edit a video — all under the same theme.",
		},
		{
			number: "05",
			title: "Submit Your Work",
			description:
				"Submit all three projects by 7:30 PM. Make sure they tell a cohesive story across different mediums!",
		},
		{
			number: "06",
			title: "Jury Evaluation",
			description:
				"Three expert judges will evaluate your work based on creativity, consistency, and storytelling. Winners announced soon after!",
		},
	];

	useGSAP(
		() => {
			const cards = containerRef.current?.querySelectorAll(".how-it-works-card");

			if (cards && cards.length > 0) {
				gsap.from(cards, {
					opacity: 0,
					y: 50,
					duration: 0.8,
					stagger: 0.15,
					ease: "power2.out",
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 70%",
						toggleActions: "play none none none",
					},
				});
			}
		},
		{ scope: containerRef }
	);

	return (
		<section className="how-it-works-section" ref={containerRef}>
			<div className="how-it-works-container">
				<div className="how-it-works-header">
					<h2 className="how-it-works-title">How It Works</h2>
					<p className="how-it-works-subtitle">
						Your journey from registration to winning — simplified
					</p>
				</div>

				<div className="how-it-works-grid">
					{steps.map((step, index) => (
						<div key={index} className="how-it-works-card">
							<div className="how-it-works-number">{step.number}</div>
							<h3 className="how-it-works-card-title">{step.title}</h3>
							<p className="how-it-works-card-description">{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;

