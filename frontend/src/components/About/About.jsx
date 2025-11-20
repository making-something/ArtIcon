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

			// 1. STATS ANIMATION (Pop In)
			const setupStatsAnimation = () => {
				const statElements = [
					containerRef.current?.querySelector(".stats-item-1"),
					containerRef.current?.querySelector(".stats-item-2"),
					containerRef.current?.querySelector(".stats-item-3"),
				].filter(Boolean);

				if (statElements.length > 0) {
					gsap.set(statElements, { scale: 0 });

					ScrollTrigger.create({
						trigger: ".about-stats",
						start: "top 70%",
						toggleActions: "play none none none",
						onEnter: () => {
							gsap.to(statElements, {
								scale: 1,
								duration: 1.2,
								stagger: 0.2,
								ease: "back.out(1.7)",
								force3D: true,
							});
						},
					});
				}
			};

			// Set up stats animation after a short delay
			setTimeout(setupStatsAnimation, 150);

			// 2. FLOATING TAGS PARALLAX - Always run for visual effect
			// Wait a bit for DOM to be ready, then set up animations
			const setupTagAnimations = () => {
				const tagElements = [
					{
						id: "#tag-1",
						initialY: 0,
						targetY: -300,
						initialR: 20,
						targetR: -45,
					},
					{
						id: "#tag-2",
						initialY: 0,
						targetY: -150,
						initialR: -45,
						targetR: 70,
					},
					{
						id: "#tag-3",
						initialY: 0,
						targetY: -400,
						initialR: 5,
						targetR: 120,
					},
					{
						id: "#tag-4",
						initialY: 0,
						targetY: -350,
						initialR: 45,
						targetR: -60,
					},
					{
						id: "#tag-5",
						initialY: 0,
						targetY: -200,
						initialR: -60,
						targetR: 100,
					},
				];

				tagElements.forEach((tag, index) => {
					const element = containerRef.current?.querySelector(tag.id);
					if (element) {
						console.log(`Setting up animation for ${tag.id}`);

						// Override CSS transform with GSAP
						gsap.set(element, {
							y: tag.initialY,
							rotation: tag.initialR,
							force3D: true,
							transformOrigin: "center center",
						});

						// Create parallax animation - constrained to about-copy section
						gsap.to(element, {
							y: isDesktop ? tag.targetY * 0.6 : tag.targetY * 0.2, // Reduced movement
							rotation: tag.targetR * 0.7, // Reduced rotation
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
						We design things that <span>click</span> — literally. From{" "}
						<span>BOLD</span> brands to
						<span>PIXEL-PERFECT</span> code, this event lives in the digital
						space where color, energy, and
						<span>CLEVER</span> details come out to play.
					</h3>
					<h3>
						Every project here is a <span>SANDBOX</span> — where ideas get
						messy, buttons have
						<span>FEELINGS</span>, and layouts get <span>PERSONALITY</span>.
					</h3>
				</div>

				{/* Parallax Tags */}
				<div className="about-tag" id="tag-1">
					<p>Interactive</p>
				</div>
				<div className="about-tag" id="tag-2">
					<p>Joyful</p>
				</div>
				<div className="about-tag" id="tag-3">
					<p>Precise</p>
				</div>
				<div className="about-tag" id="tag-4">
					<p>Curious</p>
				</div>
				<div className="about-tag" id="tag-5">
					<p>Personality</p>
				</div>
			</div>

			{/* SKILLS */}
			{/* <div className="about-skills">
				<div className="skills-copy">
					<p>01........................UI/UX Design</p>
					<p>02......................Video Editing</p>
					<p>03..........................Graphic Design</p>
					<p>04......................Creative Coding</p>
					<p>05............................Branding</p>
				</div>
			</div> */}

			{/* STATS */}
			<div className="about-stats">
				<div className="stats-row">
					<div className="stats-col stats-header">
						<h1>
							I don’t love
							<br />
							numbers, but they
							<br />
							love me
						</h1>
						<p>Some slightly unhinged stats from the Event</p>
					</div>
					<div className="stats-col stats-item-1">
						<h1>32</h1>
						<p className="desc">
							Design projects that made me shout "this is the one" (every time)
						</p>
					</div>
				</div>
				<div className="stats-row">
					<div className="stats-col stats-item-2">
						<h1>100%</h1>
						<p className="desc">
							Remote, independent, and allergic to open-plan offices
						</p>
					</div>
					<div className="stats-col stats-item-3">
						<h1>30+</h1>
						<p className="desc">
							Clients who said "wow" — or at least made the face
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
