"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./EventOverview.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EventOverview = () => {
	const containerRef = useRef(null);

	useGSAP(
		() => {
			if (typeof window === "undefined") return;

			// Wait for JunoLanding to initialize first
			gsap.delayedCall(0.1, () => {
				const wordHighlightBgColor = "191, 188, 180";
				const keywords = [
					"ai",
					"tools",
					"hackathon",
					"art",
					"ui/ux",
					"video",
					"design",
					"ideas",
					"articon",
					"fusion",
					"festival",
				];

				// Process text and create word elements
				const animeTextParagraphs = document.querySelectorAll(
					".event-overview-anime-text p"
				);

				animeTextParagraphs.forEach((paragraph) => {
					const text = paragraph.textContent;
					const words = text.split(/\s+/);
					paragraph.innerHTML = "";

					words.forEach((word) => {
						if (word.trim()) {
							const wordContainer = document.createElement("div");
							wordContainer.className = "event-overview-word";

							const wordText = document.createElement("span");
							wordText.textContent = word;

							const normalizedWord = word
								.toLowerCase()
								.replace(/[.,!?;:"]/g, "");
							if (keywords.includes(normalizedWord)) {
								wordContainer.classList.add("event-overview-keyword-wrapper");
								wordText.classList.add(
									"event-overview-keyword",
									normalizedWord
								);
							}

							wordContainer.appendChild(wordText);
							paragraph.appendChild(wordContainer);
						}
					});
				});

				// Setup ScrollTrigger for word animation
				const animeTextContainer = containerRef.current;
				if (!animeTextContainer) return;

				const scrollTrigger = ScrollTrigger.create({
					trigger: animeTextContainer,
					pin: animeTextContainer,
					start: "top top",
					end: `+=${window.innerHeight * 4}`,
					pinSpacing: true,
					invalidateOnRefresh: true,
					fastScrollEnd: true,
					anticipatePin: 1,
					id: "event-overview-main",
					onUpdate: (self) => {
						const progress = self.progress;
						const words = Array.from(
							animeTextContainer.querySelectorAll(
								".event-overview-anime-text .event-overview-word"
							)
						);
						const totalWords = words.length;

						words.forEach((word, index) => {
							const wordText = word.querySelector("span");

							if (progress <= 0.7) {
								const progressTarget = 0.7;
								const revealProgress = Math.min(1, progress / progressTarget);

								const overlapWords = 15;
								const totalAnimationLength = 1 + overlapWords / totalWords;

								const wordStart = index / totalWords;
								const wordEnd = wordStart + overlapWords / totalWords;

								const timelineScale =
									1 /
									Math.min(
										totalAnimationLength,
										1 +
											(totalWords - 1) / totalWords +
											overlapWords / totalWords
									);

								const adjustedStart = wordStart * timelineScale;
								const adjustedEnd = wordEnd * timelineScale;
								const duration = adjustedEnd - adjustedStart;

								const wordProgress =
									revealProgress <= adjustedStart
										? 0
										: revealProgress >= adjustedEnd
										? 1
										: (revealProgress - adjustedStart) / duration;

								word.style.opacity = wordProgress;

								const backgroundFadeStart =
									wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
								const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
								word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

								const textRevealThreshold = 0.9;
								const textRevealProgress =
									wordProgress >= textRevealThreshold
										? (wordProgress - textRevealThreshold) /
										  (1 - textRevealThreshold)
										: 0;
								wordText.style.opacity = Math.pow(textRevealProgress, 0.5);
							} else {
								const reverseProgress = (progress - 0.7) / 0.3;
								word.style.opacity = 1;
								const targetTextOpacity = 1;

								const reverseOverlapWords = 5;
								const reverseWordStart = index / totalWords;
								const reverseWordEnd =
									reverseWordStart + reverseOverlapWords / totalWords;

								const reverseTimelineScale =
									1 /
									Math.max(
										1,
										(totalWords - 1) / totalWords +
											reverseOverlapWords / totalWords
									);

								const reverseAdjustedStart =
									reverseWordStart * reverseTimelineScale;
								const reverseAdjustedEnd =
									reverseWordEnd * reverseTimelineScale;
								const reverseDuration =
									reverseAdjustedEnd - reverseAdjustedStart;

								const reverseWordProgress =
									reverseProgress <= reverseAdjustedStart
										? 0
										: reverseProgress >= reverseAdjustedEnd
										? 1
										: (reverseProgress - reverseAdjustedStart) /
										  reverseDuration;

								if (reverseWordProgress > 0) {
									wordText.style.opacity =
										targetTextOpacity * (1 - reverseWordProgress);
									word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
								} else {
									wordText.style.opacity = targetTextOpacity;
									word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
								}
							}
						});
					},
				});

				return () => {
					if (scrollTrigger) scrollTrigger.kill();
				};
			}); // End of gsap.delayedCall
		},
		{ scope: containerRef }
	);

	return (
		<section className="event-overview-anime-text-container" ref={containerRef}>
			<div className="event-overview-container">
				<div className="event-overview-copy-container">
					<div className="event-overview-anime-text">
						<p>So, Creators… Get your AI tools, Devices & imagination ready!</p>
						<p>
							Yeh koi simple competition nahi!! Yeh hai Hackathon of Creativity
							jaha art, design aur AI milke future banate hain! Har UI/UX
							master, video magician aur design genius yaha apne ideas ko life
							dene wala hai.
						</p>
						<p>
							ArtIcon 2025, Gujarat's fusion festival of design, logic &
							futuristic art!
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default EventOverview;
