"use client";
import "./ClientReviews.css";
import { clientReviewsData } from "./clientReviewsData.js";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ClientReviews = () => {
	const clientReviewsContainerRef = useRef(null);

	useGSAP(
		() => {
			const mm = gsap.matchMedia();

			mm.add("(min-width: 1000px)", () => {
				const reviewCards = document.querySelectorAll(".review-card");
				const cardContainers = document.querySelectorAll(
					".review-card-container"
				);

				cardContainers.forEach((cardContainer, index) => {
					const rotation = index % 2 === 0 ? 3 : -3;
					gsap.set(cardContainer, { rotation: rotation });

					const computedStyle = window.getComputedStyle(cardContainer);
				});

				const scrollTriggerInstances = [];

				// Wait for Timeline to initialize first
				gsap.delayedCall(0.3, () => {
					// Initialize review cards stacking animation
					reviewCards.forEach((card, index) => {
						if (index < reviewCards.length - 1) {
							const trigger = ScrollTrigger.create({
								trigger: card,
								start: "top top",
								endTrigger: reviewCards[reviewCards.length - 1],
								end: "top top",
								pin: true,
								pinSpacing: false,
								invalidateOnRefresh: true,
								scrub: 1,
								id: `client-review-${index}`,
							});
							scrollTriggerInstances.push(trigger);
						}

						if (index < reviewCards.length - 1) {
							const trigger = ScrollTrigger.create({
								trigger: reviewCards[index + 1],
								start: "top bottom",
								end: "top top",
							});
							scrollTriggerInstances.push(trigger);
						}
					});

					const refreshHandler = () => {
						ScrollTrigger.refresh();
					};
					window.addEventListener("orientationchange", refreshHandler);
					const onLoad = () => ScrollTrigger.refresh();
					window.addEventListener("load", onLoad, { passive: true });

					return () => {
						scrollTriggerInstances.forEach((trigger) => trigger.kill());
						window.removeEventListener("orientationchange", refreshHandler);
						window.removeEventListener("load", onLoad);
					};
				}); // End of gsap.delayedCall
			});

			mm.add("(max-width: 999px)", () => {
				const reviewCards = document.querySelectorAll(".review-card");
				const cardContainers = document.querySelectorAll(
					".review-card-container"
				);

				const mobileTweens = [];

				reviewCards.forEach((card, index) => {
					if (card) {
						gsap.set(card, { clearProps: "all", opacity: 0, y: 30 });
						const tween = gsap.to(card, {
							opacity: 1,
							y: 0,
							duration: 0.6,
							ease: "power2.out",
							delay: index * 0.05,
							scrollTrigger: {
								trigger: card,
								start: "top 85%",
								toggleActions: "play none none reverse",
							},
						});
						mobileTweens.push(tween);
					}
				});

				cardContainers.forEach((cardContainer) => {
					if (cardContainer)
						gsap.set(cardContainer, { clearProps: "rotation" });
				});

				ScrollTrigger.refresh();

				const refreshHandler = () => {
					ScrollTrigger.refresh();
				};
				window.addEventListener("orientationchange", refreshHandler);
				const onLoad = () => ScrollTrigger.refresh();
				window.addEventListener("load", onLoad, { passive: true });

				return () => {
					mobileTweens.forEach((tween) => tween?.kill());
					window.removeEventListener("orientationchange", refreshHandler);
					window.removeEventListener("load", onLoad);
				};
			});

			return () => {
				mm.revert();
			};
		},
		{ scope: clientReviewsContainerRef }
	);

	return (
		<div className="client-reviews" ref={clientReviewsContainerRef}>
			{clientReviewsData.map((item, index) => (
				<div className="review-card" key={index}>
					<div
						className="review-card-container"
						id={`review-card-${index + 1}`}
					>
						<div className="review-card-content">
							<div className="review-card-content-wrapper">
								<h3 className="review-card-text lg">{item.review}</h3>
								<div className="review-card-client-info">
									<p className="review-card-client cap">{item.clientName}</p>
									<p className="review-card-client-company sm">
										{item.clientCompany}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ClientReviews;
