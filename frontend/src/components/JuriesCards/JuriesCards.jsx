"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./JuriesCards.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function JuriesCards() {
	const juriesSectionRef = useRef(null);
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
			// Don't run animations on mobile
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
					scrub: 1,
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
					end: `+=${window.innerHeight * 3}`,
					pin: true,
					pinSpacing: true,
					invalidateOnRefresh: true,
					fastScrollEnd: true,
					anticipatePin: 1,
					scrub: 1,
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
			<section className="juries-hero">
				<h1>Meet Our Juries</h1>
			</section>

			<section className="juries" ref={juriesSectionRef}>
				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h1>R</h1>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/01.png" alt="Jury Member 1" />
						</div>
					</div>
				</div>

				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h1>K</h1>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/02.png" alt="Jury Member 2" />
						</div>
					</div>
				</div>

				<div className="jury-member">
					<div className="jury-member-name-initial">
						<h1>V</h1>
					</div>
					<div className="jury-member-card">
						<div className="jury-member-img">
							<img src="/juries/03.png" alt="Jury Member 3" />
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
