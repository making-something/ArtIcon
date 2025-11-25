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
					"articon",
					"champion",
					"graphic",
					"design",
					"ui/ux",
					"video",
					"editing",
					"versatile",
					"innovative",
					"consistent",
					"creator",
					"ai",
					"tools",
					"devices",
					"imagination",
					"competition",
					"creativity",
					"explosion",
					"art",
					"future",
					"thinker",
					"designer",
					"wizard",
					"ideas",
					"alive",
					"gujarat's",
					"first",
					"ai-powered",
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
					end: `+=${window.innerHeight * 3}`,
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
						<h2 className="event-overview-title">
							Who will be the ArtIcon Champion?
						</h2>
						<p>
							The one who performs in all 3 categories and delivers the best
							creative results across:
						</p>
						<ul className="event-overview-categories">
							<li>Graphic Design</li>
							<li>UI/UX</li>
							<li>Video Editing</li>
						</ul>
						<p>
							Only the most versatile, innovative, and consistent creator will
							take home the ArtIcon Champion Title!
						</p>
						<p className="event-overview-divider">So creators…</p>
						<p>Bring your AI tools, devices & imagination!</p>
						<p>
							This isn't just a competition — it's a creativity explosion where
							art, design & AI shape the future!
						</p>
						<p>
							Whether you're a UI/UX thinker, Graphic designer, or Video editor
							wizard — your ideas come alive here!
						</p>
						<p className="event-overview-highlight">
							ArtIcon 2025 — Gujarat's FIRST AI-powered creativity competition!
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default EventOverview;
