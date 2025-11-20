"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./JuriesCards.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function JuriesCards() {
	const juriesSectionRef = useRef(null);
	const juriesHeroRef = useRef(null);
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
			// Animate hero paragraph on scroll
			const heroParagraph = juriesHeroRef.current?.querySelector("p");
			if (heroParagraph) {
				gsap.to(heroParagraph, {
					opacity: 1,
					y: 0,
					duration: 1,
					ease: "power2.out",
					scrollTrigger: {
						trigger: heroParagraph,
						start: "top 80%",
						toggleActions: "play none none none",
					},
				});
			}

			// Don't run card animations on mobile
			if (window.innerWidth <= 1000) {
				return;
			}

			// Wait for Spotlight to initialize first
			gsap.delayedCall(0.5, () => {
				const juriesSection = juriesSectionRef.current;
				if (!juriesSection) return;

				const juryMembers = gsap.utils.toArray(".jury-member");
				const juryMemberCards = gsap.utils.toArray(".jury-member-card");

				// Create first ScrollTrigger instance
				const cardPlaceholderEntrance = ScrollTrigger.create({
					trigger: juriesSection,
					start: "top bottom",
					end: "top top",
					scrub: 0.5,
					ease: "power2.out",
					id: "juries-entrance",
					onUpdate: (self) => {
						const progress = self.progress;

						juryMembers.forEach((member, index) => {
							const entranceDelay = 0.15;
							const entranceDuration = 0.7;
							const entranceStart = index * entranceDelay;
							const entranceEnd = entranceStart + entranceDuration;

							if (progress >= entranceStart && progress <= entranceEnd) {
								const memberEntranceProgress =
									(progress - entranceStart) / entranceDuration;

								const entranceY = 125 - memberEntranceProgress * 125;
								gsap.set(member, { y: `${entranceY}%` });

								const juryMemberInitial = member.querySelector(
									".jury-member-name-initial h1"
								);
								const initialLetterScaleDelay = 0.4;
								const initialLetterScaleProgress = Math.max(
									0,
									(memberEntranceProgress - initialLetterScaleDelay) /
										(1 - initialLetterScaleDelay)
								);
								gsap.set(juryMemberInitial, {
									scale: initialLetterScaleProgress,
								});
							} else if (progress > entranceEnd) {
								gsap.set(member, { y: `0%` });
								const juryMemberInitial = member.querySelector(
									".jury-member-name-initial h1"
								);
								gsap.set(juryMemberInitial, { scale: 1 });
							}
						});
					},
				});

				// Create second ScrollTrigger instance
				const cardSlideInAnimation = ScrollTrigger.create({
					trigger: juriesSection,
					start: "top top",
					end: `+=${window.innerHeight * 2}`,
					pin: true,
					pinSpacing: true,
					invalidateOnRefresh: true,
					fastScrollEnd: true,
					anticipatePin: 1,
					scrub: 0.3,
					ease: "power2.inOut",
					id: "juries-slide-in",
					onUpdate: (self) => {
						const progress = self.progress;

						juryMemberCards.forEach((card, index) => {
							const slideInStagger = 0.075;
							const xRotationDuration = 0.4;
							const xRotationStart = index * slideInStagger;
							const xRotationEnd = xRotationStart + xRotationDuration;

							if (progress >= xRotationStart && progress <= xRotationEnd) {
								const cardProgress =
									(progress - xRotationStart) / xRotationDuration;

								const cardInitialX = 300 - index * 100;
								const cardTargetX = -50;
								const cardSlideInX =
									cardInitialX + cardProgress * (cardTargetX - cardInitialX);

								const cardSlideInRotation = 20 - cardProgress * 20;

								gsap.set(card, {
									x: `${cardSlideInX}%`,
									rotation: cardSlideInRotation,
								});
							} else if (progress > xRotationEnd) {
								gsap.set(card, {
									x: `-50%`,
									rotation: 0,
								});
							}

							const cardScaleStagger = 0.12;
							const cardScaleStart = 0.4 + index * cardScaleStagger;
							const cardScaleEnd = 1;

							if (progress >= cardScaleStart && progress <= cardScaleEnd) {
								const scaleProgress =
									(progress - cardScaleStart) / (cardScaleEnd - cardScaleStart);
								const scaleValue = 0.75 + scaleProgress * 0.25;

								gsap.set(card, {
									scale: scaleValue,
								});
							} else if (progress > cardScaleEnd) {
								gsap.set(card, {
									scale: 1,
								});
							}
						});
					},
				});

				// Return cleanup function
				return () => {
					cardPlaceholderEntrance.kill();
					cardSlideInAnimation.kill();
				};
			}); // End of gsap.delayedCall
		},
		{ scope: juriesSectionRef, dependencies: [isMobile] }
	);

	return (
		<>
			<section className="juries-hero" ref={juriesHeroRef}>
				<div className="juries-hero-content">
					<h1>Meet Our Expert Jury Panel</h1>
					<p>
						Three industry experts who will evaluate your creativity,
						consistency, storytelling, and time mastery
					</p>
				</div>
			</section>

			<section className="juries" ref={juriesSectionRef}>
				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h3>R R</h3>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/JURY 1-01.avif" alt="Ronak Raiyani" />
						</div>
						<div className="jury-member-info">
							<p>President of RITA Groups</p>
						</div>
					</div>
				</div>

				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h3>K P</h3>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/JURY 2-01.avif" alt="Kashyap Pandya" />
						</div>
						<div className="jury-member-info">
							<p>Senior Project Manager at Multiicon</p>
						</div>
					</div>
				</div>

				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h3>V M</h3>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/JURY 3-01.avif" alt="Vandana Mehta" />
						</div>
						<div className="jury-member-info">
							<p>Founder, Elevate Consulting Partner</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
