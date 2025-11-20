"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./WorkGallery.css";

gsap.registerPlugin(ScrollTrigger);

// Dummy Data - Replace with your actual hackathon categories/projects
const workItems = [
	{
		id: 1,
		title: "Cosmic Deli",
		category: "Character Design",
		img: "/images/work-items/work-item-1.jpg",
	},
	{
		id: 2,
		title: "Skull Pop 7",
		category: "Color Exploration",
		img: "/images/work-items/work-item-2.jpg",
	},
	{
		id: 3,
		title: "Room 404",
		category: "3D Composition",
		img: "/images/work-items/work-item-3.jpg",
	},
	{
		id: 4,
		title: "Red Dot Mission",
		category: "Narrative Design",
		img: "/images/work-items/work-item-4.jpg",
	},
	{
		id: 5,
		title: "Sweetbones",
		category: "Editorial",
		img: "/images/work-items/work-item-5.jpg",
	},
	{
		id: 6,
		title: "Carnival Bloom",
		category: "Pattern Design",
		img: "/images/work-items/work-item-6.jpg",
	},
];

const WorkGallery = () => {
	const containerRef = useRef(null);

	useGSAP(
		() => {
			// EXACT MATCH to otis-valen/js/work.js animation

			// Initial state for all work items
			gsap.set(".work-item", {
				opacity: 0,
				scale: 0.75, // EXACT MATCH
			});

			const rows = document.querySelectorAll(".work-row");

			rows.forEach((row) => {
				const workItems = row.querySelectorAll(".work-item");

				// Set initial position and rotation for each item
				workItems.forEach((item, itemIndex) => {
					const fromLeft = itemIndex % 2 === 0; // EXACT MATCH

					gsap.set(item, {
						x: fromLeft ? -1000 : 1000, // EXACT MATCH - huge offset
						rotation: fromLeft ? -50 : 50, // EXACT MATCH - dramatic rotation
						transformOrigin: "center center", // EXACT MATCH
					});
				});

				// Create scroll trigger for this row
				ScrollTrigger.create({
					trigger: row,
					start: "top 75%", // EXACT MATCH
					onEnter: () => {
						// EXACT MATCH - single timeline animation
						gsap.timeline().to(workItems, {
							duration: 1, // EXACT MATCH
							x: 0,
							rotation: 0,
							opacity: 1,
							scale: 1,
							ease: "power4.out", // EXACT MATCH
						});
					},
				});
			});
		},
		{ scope: containerRef }
	);

	// Helper to chunk array into pairs for rows
	const pairs = [];
	for (let i = 0; i < workItems.length; i += 2) {
		pairs.push(workItems.slice(i, i + 2));
	}

	return (
		<section className="work-gallery-section" ref={containerRef}>
			<div className="work-gallery-header">
				<p>[ Selected Projects ]</p>
				<h2>Inspiration Vault</h2>
			</div>

			<div className="work-items-container">
				{pairs.map((pair, rowIndex) => (
					<div className="work-row" key={rowIndex}>
						{pair.map((item) => (
							<div className="work-item" key={item.id}>
								<div className="work-item-img">
									<img src={item.img} alt={item.title} />
								</div>
								<div className="work-item-content">
									<h3>{item.title}</h3>
									<p>{item.category}</p>
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</section>
	);
};

export default WorkGallery;
