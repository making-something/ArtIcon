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
					"ui/ux",
					"video",
					"graphics",
					"design",
					"articon",
					"hackathon",
					"creativity",
					"theme",
					"ai",
					"tools",
					"compete",
					"champion",
					"versatility",
					"storytelling",
					"innovation",
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
					start: "top top",
					end: `+=${window.innerHeight * 2}`,
					pin: animeTextContainer,
					pinSpacing: true,
					scrub: 1,
					invalidateOnRefresh: true,
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

							// Only reveal animation, no reverse
							const revealProgress = progress;

							const overlapWords = 15;
							const totalAnimationLength = 1 + overlapWords / totalWords;

							const wordStart = index / totalWords;
							const wordEnd = wordStart + overlapWords / totalWords;

							const timelineScale =
								1 /
								Math.min(
									totalAnimationLength,
									1 + (totalWords - 1) / totalWords + overlapWords / totalWords
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
						<p>
							What if you could design a UI/UX masterpiece, edit a stunning
							video, and craft breathtaking graphics — all in one day, under one
							theme?
						</p>
						<p>
							Welcome to ArtIcon 2025, Gujarat's premier creativity hackathon
							where 100 talented creators compete in a fusion of design, art,
							and AI tools. This isn't just another competition — it's a
							full-day creative marathon that tests your versatility,
							storytelling, and innovation.
						</p>
						<p>
							Three categories. One unified theme. 10.5 hours of pure
							creativity. Are you ready to prove you're the ultimate creative
							champion?
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default EventOverview;
