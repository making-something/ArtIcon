"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./About.css";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
	const containerRef = useRef(null);

	useGSAP(
		() => {
			const isDesktop = window.innerWidth > 1000;

			// 1. STATS ANIMATION (Pop In) - Reduced pop effect
			const setupStatsAnimation = () => {
				const statElements = [
					containerRef.current?.querySelector(".stats-item-1"),
					containerRef.current?.querySelector(".stats-item-2"),
					containerRef.current?.querySelector(".stats-item-3"),
				].filter(Boolean);

				if (statElements.length > 0) {
					gsap.set(statElements, { scale: 0.8, opacity: 0 });

					ScrollTrigger.create({
						trigger: ".about-stats",
						start: "top 70%",
						toggleActions: "play none none none",
						onEnter: () => {
							gsap.to(statElements, {
								scale: 1,
								opacity: 1,
								duration: 1,
								stagger: 0.15,
								ease: "back.out(1.2)",
								force3D: true,
							});
						},
					});
				}
			};

			// Set up stats animation after a short delay
			setTimeout(setupStatsAnimation, 150);

			// 2. FLOATING TAGS PARALLAX - Start from below, reduced X-axis movement
			// Wait a bit for DOM to be ready, then set up animations
			const setupTagAnimations = () => {
				const tagElements = [
					{
						id: "#tag-1",
						initialY: 80,
						targetY: -200,
						initialX: 0,
						targetX: -20,
						initialR: 15,
						targetR: -30,
					},
					{
						id: "#tag-2",
						initialY: 80,
						targetY: -120,
						initialX: 0,
						targetX: 15,
						initialR: -30,
						targetR: 45,
					},
					{
						id: "#tag-3",
						initialY: 80,
						targetY: -250,
						initialX: 0,
						targetX: -25,
						initialR: 5,
						targetR: 80,
					},
					{
						id: "#tag-4",
						initialY: 80,
						targetY: -220,
						initialX: 0,
						targetX: 20,
						initialR: 30,
						targetR: -40,
					},
					{
						id: "#tag-5",
						initialY: 80,
						targetY: -150,
						initialX: 0,
						targetX: -15,
						initialR: -40,
						targetR: 65,
					},
				];

				tagElements.forEach((tag, index) => {
					const element = containerRef.current?.querySelector(tag.id);
					if (element) {
						console.log(`Setting up animation for ${tag.id}`);

						// Override CSS transform with GSAP
						gsap.set(element, {
							y: tag.initialY,
							x: tag.initialX,
							rotation: tag.initialR,
							force3D: true,
							transformOrigin: "center center",
						});

						// Create parallax animation - constrained to about-copy section
						gsap.to(element, {
							y: isDesktop ? tag.targetY * 0.5 : tag.targetY * 0.2, // Reduced Y movement
							x: isDesktop ? tag.targetX : 0, // Minimal X movement on desktop, none on mobile
							rotation: tag.targetR * 0.6, // Reduced rotation
							ease: "none",
							force3D: true,
							scrollTrigger: {
								trigger: ".about-copy",
								start: "top 80%", // Start when section comes into view
								end: "bottom 20%", // End before section leaves view
								scrub: 1.5,
								refreshPriority: -1,
								markers: false, // Disabled debugging
								id: `tag-${index + 1}`,
							},
						});
					} else {
						console.warn(`Element not found: ${tag.id}`);
					}
				});
			};

			// Set up tag animations after a short delay
			setTimeout(setupTagAnimations, 100);

			if (isDesktop) {
				// 3. HERO PORTRAIT PARALLAX
				const portraitElement = containerRef.current?.querySelector(
					".about-hero-portrait"
				);
				if (portraitElement) {
					gsap.to(portraitElement, {
						y: -200,
						rotation: -25,
						ease: "none",
						force3D: true,
						scrollTrigger: {
							trigger: ".about-hero",
							start: "top top",
							end: "bottom top",
							scrub: 1,
						},
					});
				}
			}

			// Refresh ScrollTrigger after setup
			setTimeout(() => {
				ScrollTrigger.refresh();
			}, 200);
		},
		{ scope: containerRef }
	);
	return (
		<section className="about-section-wrapper" ref={containerRef}>
			{/* HERO */}

			{/* STORY */}
			<div className="about-copy">
				<div className="about-copy-content">
					<h3>
						Here's the challenge: On <span>November 30th, 2025</span>, you'll
						receive one creative <span>THEME</span> at <span>9:00 AM</span>.
					</h3>
					<h3>
						You have until <span>7:30 PM</span> to create three complete
						projects — a <span>UI/UX DESIGN</span>, a{" "}
						<span>GRAPHIC DESIGN</span>, and a <span>VIDEO EDIT</span> — all
						telling the same story through different mediums. Use{" "}
						<span>AI TOOLS</span> to amplify your creativity and compete for the{" "}
						<span>MAIN ARTICON TROPHY</span>!
					</h3>
				</div>

				{/* Parallax Tags */}
				<div className="about-tag" id="tag-1">
					<p>AI-Powered</p>
				</div>
				<div className="about-tag" id="tag-2">
					<p>Solo Challenge</p>
				</div>
				<div className="about-tag" id="tag-3">
					<p>One Theme</p>
				</div>
				<div className="about-tag" id="tag-4">
					<p>Three Tasks</p>
				</div>
				<div className="about-tag" id="tag-5">
					<p>Full Day</p>
				</div>
			</div>

			{/* SKILLS */}
			<div className="about-skills">
				<div className="skills-copy">
					<p>
						This is a solo challenge held at Multiicon's 4th Floor, where you'll
						work independently to showcase your versatility across all three
						creative disciplines. Think of it as a creative triathlon — you're
						not just a specialist, you're proving you're a complete creative
						powerhouse.
					</p>
					<p>
						Three expert jury members will evaluate your submissions based on
						creativity, consistency across all three tasks, and how well you
						tell a cohesive story through different mediums. The key to winning?
						It's not just about individual excellence — it's about creating a
						unified creative vision that shines through UI/UX, graphics, and
						video.
					</p>
					<p>
						Whether you're a designer, video editor, or creative enthusiast,
						this is your chance to push your boundaries, learn new skills, and
						prove you can master multiple creative domains in a single day!
					</p>
				</div>
			</div>

			{/* STATS */}
			<div className="about-stats">
				<div className="stats-row">
					<div className="stats-col stats-header">
						<h1>
							Rewards & I don’t love
							<br />
							Recognition
							<br />
							Await You
						</h1>
						<p>Win big prizes and recognition for your creativity</p>
					</div>
					<div className="stats-col stats-item-1">
						<h1>₹10,000</h1>
						<p className="desc">
							Cash Prize + Trophy + 6-Month Internship at Multiicon for Overall
							Winner
						</p>
					</div>
				</div>
				<div className="stats-row">
					<div className="stats-col stats-item-2">
						<h1>₹5,000</h1>
						<p className="desc">
							Cash Prize + Trophy for Runner-Up in each category (UI/UX, Video,
							Graphic)
						</p>
					</div>
					<div className="stats-col stats-item-3">
						<h1>Free Goodies</h1>
						<p className="desc">
							E-Certificate, Badge, Sticker Pack, Phone Stand & Bag for all
							participants
						</p>
					</div>
				</div>
			</div>

			{/* CTA */}
			{/* <div className="about-contact">
				<div className="contact-pill-btn">
					<a href="/register"></a>
					<div className="contact-text-small">
						<p>Collabs, or cosmic brainstorms welcome</p>
					</div>
					<div className="contact-text-large">
						<h1>Hit Me Up</h1>
					</div>
				</div>
			</div> */}
		</section>
	);
};

export default About;
