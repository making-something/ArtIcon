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
			// Reference: "gsap.set([.items], { scale: 0 }) ... to({ scale: 1, ease: 'power4.out' })"
			const statItems = [".stats-item-1", ".stats-item-2", ".stats-item-3"];

			gsap.set(statItems, { scale: 0 });

			ScrollTrigger.create({
				trigger: ".about-stats",
				start: "top 50%",
				toggleActions: "play none none none", // Exact Ref behavior
				onEnter: () => {
					gsap.to(statItems, {
						scale: 1,
						duration: 1,
						stagger: 0.1,
						ease: "power4.out",
						force3D: true,
					});
				},
			});

			if (isDesktop) {
				// 2. HERO PORTRAIT PARALLAX
				// Reference: "y: -200, rotation: -25, scrub: 1"
				gsap.to(".about-hero-portrait", {
					y: -200,
					rotation: -25,
					ease: "none", // Scrub handles easing
					scrollTrigger: {
						trigger: ".about-hero",
						start: "top top",
						end: "bottom top",
						scrub: 1,
					},
				});

				// 3. FLOATING TAGS PARALLAX (Exact Ref Values)
				const tagAnimations = [
					{ id: "#tag-1", y: -300, r: -45 },
					{ id: "#tag-2", y: -150, r: 70 },
					{ id: "#tag-3", y: -400, r: 120 },
					{ id: "#tag-4", y: -350, r: -60 },
					{ id: "#tag-5", y: -200, r: 100 },
				];

				tagAnimations.forEach((tag) => {
					gsap.to(tag.id, {
						y: tag.y,
						rotation: tag.r,
						ease: "none",
						scrollTrigger: {
							trigger: ".about-copy",
							start: "top bottom",
							end: "bottom+=100% top",
							scrub: 1,
						},
					});
				});
			}
		},
		{ scope: containerRef }
	);

	return (
		<section className="about-section-wrapper" ref={containerRef}>
			{/* HERO */}
			{/* <div className="about-hero">
				<div className="about-hero-header">
					<h1>This is</h1>
					<h1>ArtIcon 2025</h1>
				</div>

				<div className="about-hero-bio">
					<p className="ss">
						A fusion festival where logic meets creativity. We blend playful
						thinking with clean execution. If it moves, clicks, scrolls, or
						shimmers — it belongs here.
					</p>
					<p className="mn">Inside the event / slightly filtered</p>
				</div>

				<div className="about-hero-portrait">
					<img src="/juries/JURY 2-01.png" alt="ArtIcon Portrait" />
				</div>
			</div> */}

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
			<div className="about-skills">
				<div className="skills-copy">
					<p>01........................UI/UX Design</p>
					<p>02......................Video Editing</p>
					<p>03..........................Graphic Design</p>
					<p>04......................Creative Coding</p>
					<p>05............................Branding</p>
				</div>
			</div>

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
			<div className="about-contact">
				<div className="contact-pill-btn">
					<a href="/register"></a>
					<div className="contact-text-small">
						<p>Collabs, or cosmic brainstorms welcome</p>
					</div>
					<div className="contact-text-large">
						<h1>Hit Me Up</h1>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About;
