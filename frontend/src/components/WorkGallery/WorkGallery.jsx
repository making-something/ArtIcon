"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./WorkGallery.css";

gsap.registerPlugin(ScrollTrigger);

// Work Items Data - Replace with your actual events
const workItems = [
	{
		id: 1,
		title: "DesignSprint",
		category: "UI/UX Hackathon at Darshan University",
		img: "/past_events/23TEWFSD.avif",
	},
	{
		id: 2,
		title: "CodeCraft Fusion",
		category: "Design & Dev Hackathon at Atmiya University",
		img: "/past_events/32RQEFASD.avif",
	},
	{
		id: 3,
		title: "Creative Clash",
		category: "Graphics Battle at Darshan University",
		img: "/past_events/43RGFXB.avif",
	},
	{
		id: 4,
		title: "ArtTech Summit",
		category: "Video Editing Marathon at Atmiya University",
		img: "/past_events/53rqefda.avif",
	},
	{
		id: 5,
		title: "PixelWars Gujarat",
		category: "Multi-Category Hackathon at Darshan University",
		img: "/past_events/TQEGADVVDZ.avif",
	},
	{
		id: 6,
		title: "Innovation Fest 2024",
		category: "Design Thinking Workshop at Atmiya University",
		img: "/past_events/ytjhnb.avif",
	},
];

const WorkGallery = () => {
	const containerRef = useRef(null);

	useGSAP(
		() => {
			// EXACT MATCH to otis-valen/js/work.js animation
			gsap.set(".work-item", {
				opacity: 0,
				scale: 0.75,
			});

			document.querySelectorAll(".work-items .row").forEach((row) => {
				const workItems = row.querySelectorAll(".work-item");

				workItems.forEach((item, itemIndex) => {
					const fromLeft = itemIndex % 2 === 0;

					gsap.set(item, {
						x: fromLeft ? -1000 : 1000,
						rotation: fromLeft ? -50 : 50,
						transformOrigin: "center center",
					});
				});

				ScrollTrigger.create({
					trigger: row,
					start: "top 75%",
					onEnter: () => {
						gsap.timeline().to(workItems, {
							duration: 1,
							x: 0,
							rotation: 0,
							opacity: 1,
							scale: 1,
							ease: "power4.out",
						});
					},
				});
			});

			ScrollTrigger.refresh();
		},
		{ scope: containerRef }
	);

	// Group items into rows of 2
	const rows = [];
	for (let i = 0; i < workItems.length; i += 2) {
		rows.push(workItems.slice(i, i + 2));
	}

	return (
		<div ref={containerRef} className="work-gallery-page">
			{/* Header */}
			<div className="work-gallery-header">
				<h1>WE'VE BEEN THERE, DONE THAT!</h1>
				<p className="work-gallery-subtitle">
					Gujarat's colleges ne dekha hai creativity ka asli power. Yeh raha
					proof!
				</p>
			</div>

			{/* Work Items */}
			<section className="work-items">
				{rows.map((row, rowIndex) => (
					<div key={rowIndex} className="row">
						{row.map((item) => (
							<div key={item.id} className="work-item">
								<div className="work-item-img">
									<a href="/project">
										<img src={item.img} alt={item.title} />
									</a>
								</div>
								<div className="work-item-content">
									<h3>{item.title}</h3>
									<p className="mn">{item.category}</p>
								</div>
							</div>
						))}
					</div>
				))}
			</section>
		</div>
	);
};

export default WorkGallery;
