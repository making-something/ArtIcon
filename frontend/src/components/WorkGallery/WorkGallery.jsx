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
		title: "Cosmic Deli",
		category: "Character Design",
		img: "/images/work-items/work-item-1.avif",
	},
	{
		id: 2,
		title: "Skull Pop 7",
		category: "Color Exploration",
		img: "/images/work-items/work-item-2.avif",
	},
	{
		id: 3,
		title: "Room 404",
		category: "3D Composition",
		img: "/images/work-items/work-item-3.avif",
	},
	{
		id: 4,
		title: "Red Dot Mission",
		category: "Narrative Design",
		img: "/images/work-items/work-item-4.avif",
	},
	{
		id: 5,
		title: "Sweetbones",
		category: "Editorial Illustration",
		img: "/images/work-items/work-item-5.avif",
	},
	{
		id: 6,
		title: "Carnival Bloom 31",
		category: "Pattern Design",
		img: "/images/work-items/work-item-6.avif",
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

