"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./AnimatedTeams.css";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedTeams({
	teamMembers = [],
	showHero = true,
	showOutro = true,
}) {
	const teamSectionRef = useRef(null);
	const cardPlaceholderEntranceRef = useRef(null);
	const cardSlideInAnimationRef = useRef(null);

	useGSAP(
		() => {
			const teamSection = teamSectionRef.current;
			const teamMemberElements = gsap.utils.toArray(".team-member");
			const teamMemberCards = gsap.utils.toArray(".team-member-card");

			function initTeamAnimations() {
				// Mobile: Clear all animations
				if (window.innerWidth < 1000) {
					if (cardPlaceholderEntranceRef.current)
						cardPlaceholderEntranceRef.current.kill();
					if (cardSlideInAnimationRef.current)
						cardSlideInAnimationRef.current.kill();

					teamMemberElements.forEach((member) => {
						gsap.set(member, { clearProps: "all" });
						const teamMemberInitial = member.querySelector(
							".team-member-name-initial h1"
						);
						gsap.set(teamMemberInitial, { clearProps: "all" });
					});

					teamMemberCards.forEach((card) => {
						gsap.set(card, { clearProps: "all" });
					});

					return;
				}

				// Desktop: Kill existing animations before creating new ones
				if (cardPlaceholderEntranceRef.current)
					cardPlaceholderEntranceRef.current.kill();
				if (cardSlideInAnimationRef.current)
					cardSlideInAnimationRef.current.kill();

				// Animation 1: Team member entrance with initial letter scale
				cardPlaceholderEntranceRef.current = ScrollTrigger.create({
					trigger: teamSection,
					start: "top bottom",
					end: "top top",
					scrub: 1,
					onUpdate: (self) => {
						const progress = self.progress;

						teamMemberElements.forEach((member, index) => {
							const entranceDelay = 0.15;
							const entranceDuration = 0.7;
							const entranceStart = index * entranceDelay;
							const entranceEnd = entranceStart + entranceDuration;

							if (progress >= entranceStart && progress <= entranceEnd) {
								const memberEntranceProgress =
									(progress - entranceStart) / entranceDuration;

								const entranceY = 125 - memberEntranceProgress * 125;
								gsap.set(member, { y: `${entranceY}%` });

								const teamMemberInitial = member.querySelector(
									".team-member-name-initial h1"
								);
								const initialLetterScaleDelay = 0.4;
								const initialLetterScaleProgress = Math.max(
									0,
									(memberEntranceProgress - initialLetterScaleDelay) /
										(1 - initialLetterScaleDelay)
								);
								gsap.set(teamMemberInitial, {
									scale: initialLetterScaleProgress,
								});
							} else if (progress > entranceEnd) {
								gsap.set(member, { y: `0%` });
								const teamMemberInitial = member.querySelector(
									".team-member-name-initial h1"
								);
								gsap.set(teamMemberInitial, { scale: 1 });
							}
						});
					},
				});

				// Animation 2: Card slide-in with rotation and scale
				cardSlideInAnimationRef.current = ScrollTrigger.create({
					trigger: teamSection,
					start: "top top",
					end: `+=${window.innerHeight * 3}`,
					pin: true,
					pinSpacing: true,
					scrub: 1,
					onUpdate: (self) => {
						const progress = self.progress;

						teamMemberCards.forEach((card, index) => {
							const slideInStagger = 0.075;
							const xRotationDuration = 0.4;
							const xRotationStart = index * slideInStagger;
							const xRotationEnd = xRotationStart + xRotationDuration;

							// Slide in and rotation animation
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

							// Scale animation
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
			}

			// Handle resize with debounce
			let resizeTimer;
			const handleResize = () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					initTeamAnimations();
					ScrollTrigger.refresh();
				}, 250);
			};

			window.addEventListener("resize", handleResize);

			initTeamAnimations();

			return () => {
				window.removeEventListener("resize", handleResize);
				if (cardPlaceholderEntranceRef.current)
					cardPlaceholderEntranceRef.current.kill();
				if (cardSlideInAnimationRef.current)
					cardSlideInAnimationRef.current.kill();
			};
		},
		{ scope: teamSectionRef }
	);

	// Default team members if none provided
	const defaultTeamMembers = [
		{
			initial: "V",
			role: "Art Director / Creative Lead",
			firstName: "Vandna",
			lastName: "Mehta",
			image: "/juries/team-member-1.jpg",
		},
		{
			initial: "K",
			role: "AI Technologist / Designer",
			firstName: "Kashyap",
			lastName: "Pandya",
			image: "/juries/team-member-2.jpg",
		},
		{
			initial: "R",
			role: "Industry Expert / Gallery Curator",
			firstName: "Ronak",
			lastName: "",
			image: "/juries/team-member-3.jpg",
		},
	];

	const members = teamMembers.length > 0 ? teamMembers : defaultTeamMembers;

	return (
		<>
			{showHero && (
				<section className="animated-teams-hero">
					<h1>ArtIcon Jury</h1>
					<p className="hero-subtitle">Inke haath me final scorecard hai... aur nazar me sirf perfection!</p>
				</section>
			)}

			<section className="animated-teams-section team" ref={teamSectionRef}>
				{members.map((member, index) => (
					<div className="team-member" key={index}>
						<div className="team-member-name-initial">
							<h1>{member.initial}</h1>
						</div>
						<div className="team-member-card">
							<div className="team-member-img">
								<img
									src={member.image}
									alt={`${member.firstName} ${member.lastName}`}
								/>
							</div>
							<div className="team-member-info">
								<p>( {member.role} )</p>
								<h1>
									{member.firstName} <span>{member.lastName}</span>
								</h1>
							</div>
						</div>
					</div>
				))}
			</section>

			{/* {showOutro && (
				<section className="animated-teams-outro">
					<h1>Where Vision Becomes Work</h1>
				</section>
			)} */}
		</>
	);
}
