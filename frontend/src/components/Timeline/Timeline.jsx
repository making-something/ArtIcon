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
			const RATIO = 0.5;
			let accumulatedHeight = 0;

			sections.forEach((section) => {
				const height = section.clientHeight;
				sectionHeights.push(height * RATIO);
				accumulatedHeight += height;
				accumulatedHeights.push(accumulatedHeight);
			});

			let lastActiveIndex = -1;

			function updateMapHeights(relativeScrollPos) {
				for (let i = 0; i < accumulatedHeights.length; i++) {
					if (i === 0 && relativeScrollPos < accumulatedHeights[i]) {
						if (lastActiveIndex !== i) {
							if (lastActiveIndex >= 0) {
								mapDivs[lastActiveIndex].style.height = "100px";
							}
							mapDivs[i].style.height = `${sectionHeights[i]}px`;
							lastActiveIndex = i;
						}
						break;
					} else if (
						i > 0 &&
						relativeScrollPos >= accumulatedHeights[i - 1] &&
						relativeScrollPos < accumulatedHeights[i]
					) {
						if (lastActiveIndex !== i) {
							if (lastActiveIndex >= 0) {
								mapDivs[lastActiveIndex].style.height = "100px";
							}
							mapDivs[i].style.height = `${sectionHeights[i]}px`;
							lastActiveIndex = i;
						}
						break;
					}
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

				// Get the sections container position
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
				updateMapHeights(clampedScroll);
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
					<p>Section 1</p>
					<p>01</p>
				</div>
				<div>
					<p>Section 2</p>
					<p>02</p>
				</div>
				<div>
					<p>Section 3</p>
					<p>03</p>
				</div>
				<div>
					<p>Section 4</p>
					<p>04</p>
				</div>
				<div>
					<p>Section 5</p>
					<p>05</p>
				</div>
				<div>
					<p>Section 6</p>
					<p>06</p>
				</div>
				<div>
					<p>Section 7</p>
					<p>07</p>
				</div>
				<div>
					<p>Section 8</p>
					<p>08</p>
				</div>
			</div>
			<div className="sections">
				<div className="section-1">
					<div className="header">
						<p>Section 1</p>
						<p>01</p>
					</div>
					<div className="copy">
						<h1>Section 1</h1>
						<div className="whitespace"></div>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
							merninisti licere mihi ista probare, quae sunt a te dicta? Refert
							tamen, quo modo.
						</p>
					</div>
					<div className="whitespace"></div>
					<div className="whitespace"></div>
					<div className="whitespace"></div>
					<div className="whitespace"></div>
					<div className="whitespace"></div>
					<div className="whitespace"></div>
				</div>
				<div className="section-2">
					<div className="header">
						<p>Section 2</p>
						<p>02</p>
					</div>
					<div className="copy">
						<h1>Section 2</h1>
						<div className="whitespace"></div>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
							merninisti licere mihi ista probare, quae sunt a te dicta? Refert
							tamen, quo modo.
						</p>
					</div>
				</div>
				<div className="section-3">
					<div className="header">
						<p>Section 3</p>
						<p>03</p>
					</div>
					<div className="copy">
						<h1>Section 3</h1>
					</div>
				</div>
				<div className="section-4">
					<div className="header">
						<p>Section 4</p>
						<p>04</p>
					</div>
					<div className="copy">
						<h1>Section 4</h1>
					</div>
				</div>
				<div className="section-5">
					<div className="header">
						<p>Section 5</p>
						<p>05</p>
					</div>
					<div className="copy">
						<h1>Section 5</h1>
					</div>
				</div>
				<div className="section-6">
					<div className="header">
						<p>Section 6</p>
						<p>06</p>
					</div>
					<div className="copy">
						<h1>Section 6</h1>
					</div>
				</div>
				<div className="section-7">
					<div className="header">
						<p>Section 7</p>
						<p>07</p>
					</div>
					<div className="copy">
						<h1>Section 7</h1>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
					</div>
				</div>
				<div className="section-8">
					<div className="header">
						<p>Section 8</p>

						<p>08</p>
					</div>
					<div className="copy">
						<h1>Section 8</h1>
						<div className="whitespace"></div>
						<div className="whitespace"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Timeline;
