"use client";
import "./Timeline.css";
import { useRef, useEffect, useState } from "react";
import { timelineWorkItems } from "./timelineData.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Timeline() {
	const timelineContainerRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);

	// Handle responsive behavior
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1000);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useGSAP(
		() => {
			const container = timelineContainerRef.current;
			if (!container) return;

			let scrollTriggerInstance = null;

			const initAnimations = () => {
				// Wait for EventOverview to initialize first
				gsap.delayedCall(0.2, () => {
					// Kill existing ScrollTrigger if it exists
					if (scrollTriggerInstance) {
						scrollTriggerInstance.kill();
						scrollTriggerInstance = null;
					}

					// Don't run animations on mobile
					if (window.innerWidth <= 1000) {
						return;
					}

					const indicatorContainer = container.querySelector(
						".timeline-work-indicator"
					);

					if (!indicatorContainer) return;

					// Clear and rebuild indicators
					indicatorContainer.innerHTML = "";

					for (let section = 1; section <= 4; section++) {
						const sectionNumber = document.createElement("p");
						sectionNumber.className = "mn";
						sectionNumber.textContent = `0${section}`;
						indicatorContainer.appendChild(sectionNumber);

						for (let i = 0; i < 10; i++) {
							const indicator = document.createElement("div");
							indicator.className = "indicator";
							indicatorContainer.appendChild(indicator);
						}
					}

					// Position configurations for different screen sizes
					const featuredCardPosSmall = [
						{ y: 100, x: 1000 },
						{ y: 1500, x: 100 },
						{ y: 1250, x: 1950 },
						{ y: 1500, x: 850 },
						{ y: 200, x: 2100 },
						{ y: 250, x: 600 },
						{ y: 1100, x: 1650 },
						{ y: 1000, x: 800 },
						{ y: 900, x: 2200 },
						{ y: 150, x: 1600 },
					];

					const featuredCardPosLarge = [
						{ y: 800, x: 5000 },
						{ y: 2000, x: 3000 },
						{ y: 240, x: 4450 },
						{ y: 1200, x: 3450 },
						{ y: 500, x: 2200 },
						{ y: 750, x: 1100 },
						{ y: 1850, x: 3350 },
						{ y: 2200, x: 1300 },
						{ y: 3000, x: 1950 },
						{ y: 500, x: 4500 },
					];

					const featuredCardPos =
						window.innerWidth >= 1600
							? featuredCardPosLarge
							: featuredCardPosSmall;

					const timelineTitles = container.querySelector(".timeline-titles");
					// Calculate distance so last item stops at center
					// Total width = 400vw (4 items), each = 100vw
					// First item centered with margin-left offset
					// Last item (4th) should end centered: move 3 full screens
					const moveDistance = window.innerWidth * 3;

					const imagesContainer = container.querySelector(".timeline-images");

					if (!imagesContainer || !timelineTitles) return;

					// Clear and rebuild image cards
					imagesContainer.innerHTML = "";

					// Use local timeline images
					const timelineImages = [
						"/timeline/img1.avif",
						"/timeline/img2.avif",
						"/timeline/img3.avif",
						"/timeline/img4.avif",
						"/timeline/img5.avif",
						"/timeline/img6.avif",
						"/timeline/img7.avif",
						"/timeline/img8.avif",
						"/timeline/img9.avif",
						"/timeline/img10.avif",
					];

					// Create 8 image cards with better distribution (reduced from 10)
					for (let i = 0; i < timelineImages.length; i++) {
						const timelineImgCard = document.createElement("div");
						timelineImgCard.className = `timeline-img-card timeline-img-card-${
							(i % 4) + 1
						}`;
						timelineImgCard.setAttribute("data-step-index", i % 4);

						const img = document.createElement("img");
						img.src = timelineImages[i];
						img.alt = `Timeline image ${i + 1}`;
						img.loading = "lazy"; // Add lazy loading for external images
						timelineImgCard.appendChild(img);

						const position = featuredCardPos[i % featuredCardPos.length];

						gsap.set(timelineImgCard, {
							x: position.x,
							y: position.y,
							z: -2000,
							scale: 0,
							rotation: Math.random() * 20 - 10, // Random rotation between -10 and 10 degrees
							force3D: true,
						});

						imagesContainer.appendChild(timelineImgCard);
					}

					const timelineImgCards =
						container.querySelectorAll(".timeline-img-card");

					// Create ScrollTrigger animation
					scrollTriggerInstance = ScrollTrigger.create({
						trigger: container,
						start: "top top",
						end: `+=${window.innerHeight * 6}px`, // Increased for slower scroll
						pin: true,
						pinSpacing: true,
						invalidateOnRefresh: true,
						fastScrollEnd: true,
						anticipatePin: 1,
						scrub: true, // Set to true for smooth scroll in both directions
						id: "timeline-main",
						onUpdate: (self) => {
							const progress = self.progress;

							const xPosition = -moveDistance * progress;
							gsap.set(timelineTitles, {
								x: xPosition,
							});

							timelineImgCards.forEach((timelineImgCard, index) => {
								const staggerOffset = index * 0.08; // Adjusted stagger for 8 images
								const scaledProgress = (progress - staggerOffset) * 1.5;
								const individualProgress = Math.max(
									0,
									Math.min(1, scaledProgress)
								);

								// Enhanced Z-axis movement for better depth
								const newZ = -2000 + 3500 * individualProgress;
								const scaleProgress = Math.min(1, individualProgress * 8);
								const scale = Math.max(0, Math.min(1.1, scaleProgress)); // Slightly larger max scale

								// Add rotation animation for more dynamic effect
								const rotationProgress = individualProgress * 360;
								const rotation = rotationProgress % 360;

								// Add opacity fade in/out
								let opacity = 1;
								if (individualProgress < 0.1) {
									opacity = individualProgress * 10;
								} else if (individualProgress > 0.9) {
									opacity = (1 - individualProgress) * 10;
								}

								gsap.set(timelineImgCard, {
									z: newZ,
									scale: scale,
									rotationZ: rotation * 0.1, // Subtle rotation
									opacity: opacity,
									force3D: true,
								});
							});

							const indicators = container.querySelectorAll(".indicator");
							const totalIndicators = indicators.length;
							const progressPerIndicator = 1 / totalIndicators;

							indicators.forEach((indicator, index) => {
								const indicatorStart = index * progressPerIndicator;
								const indicatorOpacity = progress > indicatorStart ? 1 : 0.2;

								gsap.to(indicator, {
									opacity: indicatorOpacity,
									duration: 0.3,
								});
							});
						},
					});
				}); // End of gsap.delayedCall
			};

			initAnimations();

			const handleResize = () => {
				initAnimations();
			};

			window.addEventListener("resize", handleResize);

			return () => {
				if (scrollTriggerInstance) {
					scrollTriggerInstance.kill();
				}
				window.removeEventListener("resize", handleResize);
			};
		},
		{ scope: timelineContainerRef, dependencies: [isMobile] }
	);

	return (
		<>
			<div className="timeline-header-section">
				<h2 className="timeline-header-title">
					Your Journey to Becoming <span className="fancy-word">ArtIcon</span>{" "}
					Starts Here
				</h2>
			</div>
			<section className="timeline-work" ref={timelineContainerRef}>
				<div className="timeline-images"></div>
				<div className="timeline-titles">
					{timelineWorkItems.map((item, index) => (
						<div key={item.id} className="timeline-title-wrapper">
							{!isMobile && index === 0 ? null : (
								<div className="timeline-title-img">
									<img src={item.image} alt={item.alt} />
								</div>
							)}
							<h1 className="timeline-title">{item.title}</h1>
						</div>
					))}
				</div>
				<div className="timeline-work-indicator"></div>
				<div className="timeline-work-footer">
					<p className="mn">Articon 2025</p>
					<p className="mn">||||||||||||||</p>
				</div>
			</section>
		</>
	);
}
