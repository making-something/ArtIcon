"use client";
import "./Spotlight.css";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Spotlight = () => {
	const spotlightRef = useRef(null);

	useGSAP(
		() => {
			const scrollTriggerInstances = [];

			// Wait for ClientReviews to initialize first
			gsap.delayedCall(0.4, () => {
				// Initialize spotlight animations
				new SplitType(".marquee-text-item h1", { types: "chars" });

				document
					.querySelectorAll(".marquee-container")
					.forEach((container, index) => {
						const marquee = container.querySelector(".marquee");
						const chars = container.querySelectorAll(".char");

						const marqueeTrigger = gsap.to(marquee, {
							x: index % 2 === 0 ? "5%" : "-15%",
							scrollTrigger: {
								trigger: container,
								start: "top bottom",
								end: "150% top",
								scrub: true,
							},
							force3D: true,
						});

						const charsTrigger = gsap.fromTo(
							chars,
							{ fontWeight: 100 },
							{
								fontWeight: 900,
								duration: 1,
								ease: "none",
								stagger: {
									each: 0.35,
									from: index % 2 === 0 ? "end" : "start",
									ease: "linear",
								},
								scrollTrigger: {
									trigger: container,
									start: "50% bottom",
									end: "top top",
									scrub: true,
								},
							}
						);

						if (marqueeTrigger.scrollTrigger) {
							scrollTriggerInstances.push(marqueeTrigger.scrollTrigger);
						}
						if (charsTrigger.scrollTrigger) {
							scrollTriggerInstances.push(charsTrigger.scrollTrigger);
						}
					});

				return () => {
					scrollTriggerInstances.forEach((trigger) => trigger.kill());
				};
			}); // End of gsap.delayedCall
		},
		{ scope: spotlightRef }
	);

	return (
		<section className="spotlight" ref={spotlightRef}>
			<div className="marquees">
				<div className="marquee-container" id="marquee-1">
					<div className="marquee">
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-1.avif" alt="" />
						</div>
						<div className="marquee-img-item marquee-text-item">
							<h1>Graphics</h1>
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-2.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-3.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-4.avif" alt="" />
						</div>
					</div>
				</div>

				<div className="marquee-container" id="marquee-2">
					<div className="marquee">
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-5.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-6.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-7.avif" alt="" />
						</div>
						<div className="marquee-img-item marquee-text-item">
							<h1>Video Editor</h1>
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-8.avif" alt="" />
						</div>
					</div>
				</div>

				<div className="marquee-container" id="marquee-3">
					<div className="marquee">
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-9.avif" alt="" />
						</div>
						<div className="marquee-img-item marquee-text-item">
							<h1>UI/UX</h1>
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-10.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-11.avif" alt="" />
						</div>
						<div className="marquee-img-item">
							<img src="/spotlight/spotlight-12.avif" alt="" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Spotlight;
