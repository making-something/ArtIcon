"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./overview.css";

gsap.registerPlugin(ScrollTrigger);

const Overview = () => {
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

				// 4. PIN THE ABOUT-COPY SECTION FOR STICKY EFFECT
				ScrollTrigger.create({
					trigger: ".about-copy",
					start: "top top",
					end: "+=150%", // Pin for 1.5x the viewport height
					pin: true,
					pinSpacing: true,
					anticipatePin: 1,
					markers: false,
				});
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
			{/* <div className="about-copy">
				<h2 className="about-copy-title">Who will be the ArtIcon Champion?</h2>
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

					<p className="about-callout">
						So creators…
						<br />
						Bring your AI tools, devices & imagination!
					</p>

					<p className="about-description">
						This isn't just a competition
						<br />
						it's a creativity explosion where art, design & AI shape the future!
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
				</div> */}

			{/* Parallax Tags */}
			{/* <div className="about-tag" id="tag-1">
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
				</div> */}
			{/* </div> */}

			{/* SKILLS */}
			{/* <div className="about-skills">
				<div className="skills-copy">
					<p>Sunday, 7 Dec 2025 - 9:00 AM</p>
					<p>Be ready to unleash your creativity!</p>
					
				</div>
			</div> */}

			{/* STATS */}
			<div className="about-stats">
				{/* Floating $ Icons */}
				<div className="stats-icon stats-icon-1">$</div>
				<div className="stats-icon stats-icon-2">$</div>
				<div className="stats-icon stats-icon-3">$</div>
				<div className="stats-icon stats-icon-4">$</div>

				{/* Header Section */}
				<div className="stats-header">
					<h1>Rewards & Recognition Await You</h1>
					<p>Win big prizes and recognition for your creativity</p>
				</div>

				{/* Cards Container */}
				<div className="stats-cards-container">
					{/* First Row - Single Centered Card */}
					{/* <div className="stats-row stats-row-1">
						<h1>
							Rewards & I don’t love
							<br />
							Recognition
							<br />
							Await You
						</h1>
						<p>Win big prizes and recognition for your creativity</p>
					</div> */}
					{/* First Row - Single Centered Card - ArtIcon Champion CHECK */}
					<div className="stats-row stats-row-1">
						<div className="stats-col stats-item-1 check-card">
							{/* Check Header */}
							<div className="check-header">
								<div className="check-bank-info">
									<h2 className="bank-name">MULTIICON</h2>
									<p className="bank-address">Gujarat, India</p>
								</div>
								<div className="check-number-date">
									<p className="check-number">No. 001</p>
									<p className="check-date">07-12-2025</p>
								</div>
							</div>

							{/* Check Body */}
							<div className="check-body">
								{/* Payee Line */}
								<div className="check-payee-section">
									<div className="payee-line">
										<span className="payee-label">PAY TO THE ORDER OF</span>
										<span className="payee-name">ARTICON CHAMPION</span>
									</div>
									<div className="amount-box">
										<span className="currency">₹</span>
										<span className="amount-number">10,000</span>
									</div>
								</div>

								{/* Amount in Words */}
								<div className="amount-words-line">
									<span className="amount-words">Ten Thousand Rupees Only</span>
								</div>

								{/* Memo Section */}
								<div className="check-memo-section">
									<div className="memo-line">
										<span className="memo-label">FOR:</span>
										<div className="memo-items">
											<span>Winner Trophy</span>
											<span>Social Media Feature</span>
											<span>6-Month Internship at Multiicon</span>
										</div>
									</div>
									<div className="signature-line">
										<div className="signature-placeholder">
											<img src="/sign.svg" alt="Authorized Signature" className="signature-image" style={{ width: '120px', height: 'auto', display: 'block', margin: '0 auto 5px' }} />
<span className="signature-text">
												Bhavin Thakkar
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Check Footer - MICR Line */}
							<div className="check-footer">
								<span className="micr-line">⑆001⑆ ⑈2025120701⑈ ⑆10000⑆</span>
							</div>
						</div>
					</div>

					{/* Second Row - Two Cards */}
					<div className="stats-row stats-row-2">
						{/* Best in Category Award */}
						<div className="stats-col stats-item-2">
							{/* Trophy Icon */}
							<div className="card-icon trophy-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9V4H6V9Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M6 9H4C3.46957 9 2.96086 8.78929 2.58579 8.41421C2.21071 8.03914 2 7.53043 2 7V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H6"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M18 9H20C20.5304 9 21.0391 8.78929 21.4142 8.41421C21.7893 8.03914 22 7.53043 22 7V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 15V18"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M8 21H16"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M10 18H14V21H10V18Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>

							<h1>Best in Category Award</h1>
							<p className="category-text">
								Categories: Video / UI-UX / Graphic
							</p>
							<div className="desc">
								<p>₹5,000 Cash Prize</p>
								<p>Runner-Up Trophy</p>
								<p>Social Media Recognition Post</p>
							</div>
						</div>

						{/* E-Certificate & Goodies */}
						<div className="stats-col stats-item-3">
							{/* Gift Icon */}
							<div className="card-icon gift-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M20 12V22H4V12"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M22 7H2V12H22V7Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 22V7"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>

							<h1>For All Participants</h1>
							<p className="category-text">Because every effort matters!</p>
							<div className="desc">
								<p>E-Certificate</p>
								<p>Goodies</p>
								<p>Social Media Recognition Post</p>
							</div>
						</div>
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

export default Overview;
