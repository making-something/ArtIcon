import "./Timeline.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Timeline = () => {
	const timelineRef = useRef(null);

	useGSAP(
		() => {
			const timeline = timelineRef.current;
			if (!timeline) return;

			const sections = timeline.querySelectorAll(".sections > div");
			const mapDivs = timeline.querySelectorAll(".map > div");

			if (!sections.length || !mapDivs.length) return;

			const sectionHeights = [];
			const accumulatedHeights = [];
			const RATIO = 0.8;
			let accumulatedHeight = 0;

			sections.forEach((section) => {
				const height = section.clientHeight;
				sectionHeights.push(height * RATIO);
				accumulatedHeight += height;
				accumulatedHeights.push(accumulatedHeight);
			});

			let lastActiveIndex = -1;

			function updateMapHeights(relativeScrollPos) {
				// Calculate which section should be active based on scroll position
				let activeIndex = 0;

				for (let i = 0; i < accumulatedHeights.length; i++) {
					if (relativeScrollPos < accumulatedHeights[i]) {
						activeIndex = i;
						break;
					}
					// If we're past the last accumulated height, show the last section
					if (i === accumulatedHeights.length - 1) {
						activeIndex = i;
					}
				}

				// Update the active section's height
				if (lastActiveIndex !== activeIndex) {
					if (lastActiveIndex >= 0 && mapDivs[lastActiveIndex]) {
						mapDivs[lastActiveIndex].style.height = "100px";
					}
					if (mapDivs[activeIndex]) {
						mapDivs[activeIndex].style.height = `${sectionHeights[activeIndex]}px`;
					}
					lastActiveIndex = activeIndex;
				}
			}

			const sectionsTotalHeight = [...sections].reduce(
				(sum, section) => sum + section.clientHeight,
				0
			);
			const mapTotalHeight =
				[...mapDivs].reduce((sum, mapDiv) => sum + mapDiv.clientHeight, 0) +
				(mapDivs.length - 1) * 75;
			const sectionsScrollableHeight = sectionsTotalHeight - window.innerHeight;
			const mapScrollableHeight = mapTotalHeight - window.innerHeight;
			const scrollRatio = mapScrollableHeight / sectionsScrollableHeight;

			const handleScroll = () => {
				const mapElement = timeline.querySelector(".map");
				const sectionsElement = timeline.querySelector(".sections");

				if (!mapElement || !sectionsElement) return;

				// Get each section's position relative to viewport
				let currentSectionIndex = 0;
				sections.forEach((section, index) => {
					const rect = section.getBoundingClientRect();
					// Check if section is in the viewport (top half)
					if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
						currentSectionIndex = index;
					}
				});

				// Update the sidebar based on current section
				if (lastActiveIndex !== currentSectionIndex) {
					if (lastActiveIndex >= 0 && mapDivs[lastActiveIndex]) {
						mapDivs[lastActiveIndex].style.height = "100px";
					}
					if (mapDivs[currentSectionIndex]) {
						mapDivs[currentSectionIndex].style.height = `${sectionHeights[currentSectionIndex]}px`;
					}
					lastActiveIndex = currentSectionIndex;
				}

				// Get the sections container position for map translation
				const sectionsRect = sectionsElement.getBoundingClientRect();
				const sectionsTop = sectionsRect.top;

				// Calculate how much the sections have scrolled
				const scrollProgress = Math.max(0, -sectionsTop);

				// Clamp scroll position to valid range
				const clampedScroll = Math.max(
					0,
					Math.min(scrollProgress, sectionsScrollableHeight)
				);

				const mapTranslateY = clampedScroll * scrollRatio;
				mapElement.style.transform = `translateY(-${mapTranslateY}px)`;
			};

			window.addEventListener("scroll", handleScroll);
			// Initial call
			handleScroll();

			// Cleanup
			return () => {
				window.removeEventListener("scroll", handleScroll);
			};
		},
		{ scope: timelineRef }
	);
	return (
		<div className="timeline" ref={timelineRef}>
			<div className="map">
				<div>
					<p>Registration</p>
					<p>01</p>
				</div>
				<div>
					<p>Opening</p>
					<p>02</p>
				</div>
				<div>
					<p>Task Reveal</p>
					<p>03</p>
				</div>
				<div>
					<p>Phase 1</p>
					<p>04</p>
				</div>
				<div>
					<p>Lunch</p>
					<p>05</p>
				</div>
				<div>
					<p>Phase 2</p>
					<p>06</p>
				</div>
				<div>
					<p>Evaluation</p>
					<p>07</p>
				</div>
				<div>
					<p>Winners</p>
					<p>08</p>
				</div>
			</div>
			<div className="sections">
				<div className="section-1">
					<div className="header">
						<p>9:00 AM</p>
						<p>01</p>
					</div>
					<div className="copy">
						<h1>Registration & Entry</h1>
						<p>
							Check in at the welcome desk, verify ID, and collect your event badge to gear up for the day.
						</p>
					</div>
				</div>
				<div className="section-2">
					<div className="header">
						<p>10:00 to 10:20 AM</p>
						<p>02</p>
					</div>
					<div className="copy">
						<h1>Opening Ceremony</h1>
						<p>
							Lamp lighting, host welcome, and sponsor shout-outs to kick off the creative madness.
						</p>
					</div>
				</div>
				<div className="section-3">
					<div className="header">
						<p>10:20 to 10:40 AM</p>
						<p>03</p>
					</div>
					<div className="copy">
						<h1>Task Reveal & Rules</h1>
						<p>
							Meet the jury, understand the brief, and get your doubts cleared before the battle begins.
						</p>
					</div>
				</div>
				<div className="section-4">
					<div className="header">
						<p>10:40 AM to 2:00 PM</p>
						<p>04</p>
					</div>
					<div className="copy">
						<h1>Creation Round (Phase 1)</h1>
						<p>
							Participants start crafting their masterpieces! Focus mode on, distractions off.
						</p>
					</div>
				</div>
				<div className="section-5">
					<div className="header">
						<p>2:00 to 2:30 PM</p>
						<p>05</p>
					</div>
					<div className="copy">
						<h1>Lunch Break</h1>
						<p>
							Quick recharge with snacks and tea before diving back into the hustle.
						</p>
					</div>
				</div>
				<div className="section-6">
					<div className="header">
						<p>2:30 to 5:00 PM</p>
						<p>06</p>
					</div>
					<div className="copy">
						<h1>Creation Round (Phase 2)</h1>
						<p>
							Resume building your project with a mid-day check-in to track progress and refine.
						</p>
					</div>
				</div>
				<div className="section-7">
					<div className="header">
						<p>5:00 to 6:30 PM</p>
						<p>07</p>
					</div>
					<div className="copy">
						<h1>Jury Evaluation</h1>
						<p>
							Judges review entries, score performances, and pick the finest creators of the day.
						</p>
					</div>
				</div>
				<div className="section-8">
					<div className="header">
						<p>7:00 to 7:30 PM</p>
						<p>08</p>
					</div>
					<div className="copy">
						<h1>Winner Announcement</h1>
						<p>
							Results, certificates, prizes…your deserving spotlight moment.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Timeline;
