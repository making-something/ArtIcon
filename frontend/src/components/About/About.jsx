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

				// 4. STICKY EFFECT - Pin the entire sticky wrapper (full screen)
				const stickyWrapper = containerRef.current?.querySelector(
					".about-copy-sticky-wrapper"
				);
				if (stickyWrapper) {
					ScrollTrigger.create({
						trigger: stickyWrapper,
						start: "top top",
						end: "+=200vh",
						pin: true,
						pinSpacing: true,
						markers: false,
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
			<div className="about-copy">
				<h2 className="about-copy-title">Who will be the ArtIcon Champion?</h2>
				<div className="about-copy-sticky-wrapper">
					<div className="about-copy-content">
						<p className="about-intro">
							The one who performs in all 3 categories and delivers the best
							creative results across:
						</p>
						<ul className="about-categories">
							<li>Graphic Design</li>
							<li>UI/UX</li>
							<li>Video Editing</li>
						</ul>
						<p className="about-champion">
							Only the most versatile, innovative, and consistent creator will
							take home the <span>ArtIcon Champion Title</span>
						</p>
					</div>

					<div className="about-copy-content about-copy-content-second" style={{backgroundColor:"#b1c1ef"}}>
						<p className="about-callout">
							So creators…
							<br />
							Bring your AI tools, devices & imagination!
						</p>

						<p className="about-description">
							This isn't just a competition
							<br />
							it's a creativity explosion where art, design & AI shape the
							future!
						</p>

						<p className="about-description">
							Whether you're a UI/UX thinker, Graphic designer, or Video editor
							wizard
							<br />
							your ideas come alive here!
						</p>

						<p className="about-footer">
							<span>ArtIcon 2025</span> — Gujarat's FIRST AI-powered creativity
							competition
						</p>
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
			</div>

			{/* SKILLS */}
			{/* <div className="about-skills">
				<div className="skills-copy">
					<p>
						ArtIcon 2025 is a creativity hackathon where up to 100 participants
						compete across three categories: UI/UX Design, Video Editing, and
						Graphic Design. The main challenge? Complete all three tasks under
						one unified theme in just 10.5 hours.
					</p>
					<p>
						Participants work solo from 9:00 AM to 7:30 PM on November 30th,
						2025 at Multiicon's 4th Floor. AI tools are encouraged to enhance
						your creativity, and three expert jury members will evaluate your
						work based on creativity, consistency, and storytelling.
					</p>
					<p>
						Whether you're a designer, video editor, or creative enthusiast,
						this is your chance to showcase your skills, win amazing prizes, and
						get recognized in the creative community!
					</p>
				</div>
			</div> */}

			{/* STATS */}
			{/* <div className="about-stats">
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
			</div> */}

			{/* CTA */}
			{/* <div className="about-contact">
				<div className="contact-pill-btn">
					<a href="/registration"></a>
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
