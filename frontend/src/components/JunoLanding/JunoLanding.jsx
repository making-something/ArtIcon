"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import Marquee from "../Marquee/Marquee";
import "./JunoLanding.css";
import { MdHeight } from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

const JunoLanding = () => {
	const heroRef = useRef(null);
	const splitInstancesRef = useRef([]);

	useEffect(() => {
		// Initialize animations
		initAnimations();
		initHeroCards();
		initScrollAnimations();

		return () => {
			// Cleanup
			splitInstancesRef.current.forEach((split) => split.revert());
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, []);

	const initAnimations = () => {
		if (window.innerWidth < 1200) return;

		const animatedElements = document.querySelectorAll("[data-animate-type]");

		animatedElements.forEach((element) => {
			const animationType = element.getAttribute("data-animate-type");
			const delay = parseFloat(element.getAttribute("data-animate-delay")) || 0;
			const animateOnScroll =
				element.getAttribute("data-animate-on-scroll") === "true";

			if (animateOnScroll) {
				gsap.set(element, { opacity: 0 });

				const parentSection = element.closest("section");
				if (!parentSection) return;

				ScrollTrigger.create({
					trigger: parentSection,
					start: "top 70%",
					once: true,
					onEnter: () => {
						gsap.set(element, { opacity: 1 });
						applyAnimation(element, animationType, delay);
					},
				});
			} else {
				applyAnimation(element, animationType, delay);
			}
		});
	};

	const applyAnimation = (element, type, delay) => {
		switch (type) {
			case "scramble":
				scrambleAnimation(element, delay);
				break;
			case "reveal":
				revealAnimation(element, delay);
				break;
			case "line-reveal":
				lineRevealAnimation(element, delay);
				break;
		}
	};

	const scrambleAnimation = (element, delay = 0) => {
		if (window.innerWidth < 1200) return;
		if (!element) return;

		const split = new SplitType(element, { types: "chars" });
		splitInstancesRef.current.push(split);

		if (!split.chars || split.chars.length === 0) return;

		gsap.set(split.chars, { opacity: 0 });

		setTimeout(() => {
			scrambleTextStaggered(split.chars, 0.4);
		}, delay * 1000);
	};

	const revealAnimation = (element, delay = 0) => {
		if (window.innerWidth < 1200) return;

		const split = new SplitType(element, { types: "words" });
		splitInstancesRef.current.push(split);

		gsap.set(split.words, { yPercent: 120 });

		gsap.to(split.words, {
			duration: 0.75,
			yPercent: 0,
			stagger: 0.1,
			ease: "power4.out",
			delay: delay,
		});
	};

	const lineRevealAnimation = (element, delay = 0) => {
		if (window.innerWidth < 1200) return;

		const split = new SplitType(element, { types: "lines" });
		splitInstancesRef.current.push(split);

		gsap.set(split.lines, { yPercent: 120 });

		gsap.to(split.lines, {
			duration: 0.8,
			yPercent: 0,
			stagger: 0.1,
			ease: "power4.out",
			delay: delay,
		});
	};

	const scrambleTextStaggered = (elements, duration = 0.4) => {
		if (!elements || elements.length === 0) return;
		elements.forEach((char, index) => {
			setTimeout(() => {
				scrambleText([char], duration);
			}, index * 30);
		});
	};

	const scrambleText = (elements, duration = 0.4) => {
		if (!elements || elements.length === 0) return;
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

		elements.forEach((char) => {
			const originalText = char.textContent;
			let iterations = 0;
			const maxIterations = Math.floor(Math.random() * 6) + 3;

			gsap.set(char, { opacity: 1 });

			const scrambleInterval = setInterval(() => {
				char.textContent = chars[Math.floor(Math.random() * chars.length)];
				iterations++;

				if (iterations >= maxIterations) {
					clearInterval(scrambleInterval);
					char.textContent = originalText;
				}
			}, 50);

			setTimeout(() => {
				clearInterval(scrambleInterval);
				char.textContent = originalText;
			}, duration * 1000);
		});
	};

	const initHeroCards = () => {
		gsap.set(".hero .hero-cards .card", { transformOrigin: "center center" });

		gsap.to(".hero .hero-cards .card", {
			scale: 1,
			duration: 0.75,
			delay: 0.25,
			stagger: 0.1,
			ease: "power4.out",
			onComplete: () => {
				gsap.set("#hero-card-1", { transformOrigin: "top right" });
				gsap.set("#hero-card-3", { transformOrigin: "top left" });
			},
		});
	};

	const initScrollAnimations = () => {
		const smoothStep = (p) => p * p * (3 - 2 * p);

		if (window.innerWidth > 1000) {
			// Hero cards scroll animation
			ScrollTrigger.create({
				trigger: ".hero",
				start: "top top",
				end: "75% top",
				scrub: 1,
				onUpdate: (self) => {
					const progress = self.progress;

					const heroCardsContainerOpacity = gsap.utils.interpolate(
						1,
						0.5,
						smoothStep(progress)
					);
					gsap.set(".hero-cards", { opacity: heroCardsContainerOpacity });

					["#hero-card-1", "#hero-card-2", "#hero-card-3"].forEach(
						(cardId, index) => {
							const delay = index * 0.9;
							const cardProgress = gsap.utils.clamp(
								0,
								1,
								(progress - delay * 0.1) / (1 - delay * 0.1)
							);

							const y = gsap.utils.interpolate(
								"0%",
								"400%",
								smoothStep(cardProgress)
							);
							const scale = gsap.utils.interpolate(
								1,
								0.75,
								smoothStep(cardProgress)
							);

							let x = "0%";
							let rotation = 0;
							if (index === 0) {
								x = gsap.utils.interpolate(
									"0%",
									"90%",
									smoothStep(cardProgress)
								);
								rotation = gsap.utils.interpolate(
									0,
									-15,
									smoothStep(cardProgress)
								);
							} else if (index === 2) {
								x = gsap.utils.interpolate(
									"0%",
									"-90%",
									smoothStep(cardProgress)
								);
								rotation = gsap.utils.interpolate(
									0,
									15,
									smoothStep(cardProgress)
								);
							}

							gsap.set(cardId, { y, x, rotation, scale });
						}
					);
				},
			});

			// Services section animations
			initServicesAnimations(smoothStep);

			// Spotlight section animations
			initSpotlightAnimations(smoothStep);

			// Outro section animations
			initOutroAnimations(smoothStep);
		}
	};

	const initServicesAnimations = (smoothStep) => {
		ScrollTrigger.create({
			trigger: ".home-services",
			start: "top top",
			end: `+=${window.innerHeight * 8}px`,
			pin: ".home-services",
			pinSpacing: true,
			invalidateOnRefresh: true,
			id: "home-services-pin",
		});

		ScrollTrigger.create({
			trigger: ".home-services",
			start: "top bottom",
			end: `+=${window.innerHeight * 8}`,
			scrub: 1,
			onUpdate: (self) => {
				const progress = self.progress;

				const headerProgress = gsap.utils.clamp(0, 1, progress / 0.9);
				const headerY = gsap.utils.interpolate(
					"300%",
					"0%",
					smoothStep(headerProgress)
				);
				gsap.set(".home-services-header", { y: headerY });

				["#card-1", "#card-2", "#card-3"].forEach((cardId, index) => {
					const delay = index * 0.5;
					const cardProgress = gsap.utils.clamp(
						0,
						1,
						(progress - delay * 0.1) / (0.9 - delay * 0.1)
					);

					const innerCard = document.querySelector(
						`${cardId} .flip-card-inner`
					);

					let y, scale, opacity, x, rotate, rotationY;

					if (cardProgress < 0.4) {
						const normalizedProgress = cardProgress / 0.4;
						y = gsap.utils.interpolate(
							"-100%",
							"50%",
							smoothStep(normalizedProgress)
						);
						scale = gsap.utils.interpolate(
							0.25,
							0.75,
							smoothStep(normalizedProgress)
						);
					} else if (cardProgress < 0.6) {
						const normalizedProgress = (cardProgress - 0.4) / 0.2;
						y = gsap.utils.interpolate(
							"50%",
							"0%",
							smoothStep(normalizedProgress)
						);
						scale = gsap.utils.interpolate(
							0.75,
							1,
							smoothStep(normalizedProgress)
						);
					} else {
						y = "0%";
						scale = 1;
					}

					opacity = cardProgress < 0.2 ? smoothStep(cardProgress / 0.2) : 1;

					if (cardProgress < 0.6) {
						x = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
						rotate = index === 0 ? -5 : index === 1 ? 0 : 5;
						rotationY = 0;
					} else if (cardProgress < 1) {
						const normalizedProgress = (cardProgress - 0.6) / 0.4;
						x = gsap.utils.interpolate(
							index === 0 ? "100%" : index === 1 ? "0%" : "-100%",
							"0%",
							smoothStep(normalizedProgress)
						);
						rotate = gsap.utils.interpolate(
							index === 0 ? -5 : index === 1 ? 0 : 5,
							0,
							smoothStep(normalizedProgress)
						);
						rotationY = smoothStep(normalizedProgress) * 180;
					} else {
						x = "0%";
						rotate = 0;
						rotationY = 180;
					}

					gsap.set(cardId, { opacity, y, x, rotate, scale });
					if (innerCard) gsap.set(innerCard, { rotationY });
				});
			},
		});
	};

	const initSpotlightAnimations = (smoothStep) => {
		const spotlightImages = document.querySelector(".home-spotlight-images");
		if (!spotlightImages) return;

		const containerHeight = spotlightImages.offsetHeight;
		const viewportHeight = window.innerHeight;
		const initialOffset = containerHeight * 0.05;
		const totalMovement = containerHeight + initialOffset + viewportHeight;

		const spotlightHeader = document.querySelector(".spotlight-mask-header h3");
		let headerSplit = null;

		if (spotlightHeader) {
			headerSplit = new SplitType(spotlightHeader, { types: "words" });
			splitInstancesRef.current.push(headerSplit);
			gsap.set(headerSplit.words, { opacity: 0 });
		}

		ScrollTrigger.create({
			trigger: ".home-spotlight",
			start: "top top",
			end: `+=${window.innerHeight * 7}px`,
			pin: true,
			pinSpacing: true,
			invalidateOnRefresh: true,
			scrub: 1,
			id: "home-spotlight-pin",
			onUpdate: (self) => {
				const progress = self.progress;

				if (progress <= 0.5) {
					const animationProgress = progress / 0.5;
					const startY = 5;
					const endY = -(totalMovement / containerHeight) * 100;
					const currentY = startY + (endY - startY) * animationProgress;
					gsap.set(spotlightImages, { y: `${currentY}%` });
				}

				const maskContainer = document.querySelector(
					".spotlight-mask-image-container"
				);
				const maskImage = document.querySelector(".spotlight-mask-image");

				if (maskContainer && maskImage) {
					if (progress >= 0.25 && progress <= 0.75) {
						const maskProgress = (progress - 0.25) / 0.5;
						const maskSize = `${maskProgress * 475}%`;
						const imageScale = 1.25 - maskProgress * 0.25;

						maskContainer.style.setProperty("-webkit-mask-size", maskSize);
						maskContainer.style.setProperty("mask-size", maskSize);
						gsap.set(maskImage, { scale: imageScale });
					} else if (progress < 0.25) {
						maskContainer.style.setProperty("-webkit-mask-size", "0%");
						maskContainer.style.setProperty("mask-size", "0%");
						gsap.set(maskImage, { scale: 1.25 });
					} else if (progress > 0.75) {
						maskContainer.style.setProperty("-webkit-mask-size", "475%");
						maskContainer.style.setProperty("mask-size", "475%");
						gsap.set(maskImage, { scale: 1 });
					}
				}

				if (headerSplit && headerSplit.words.length > 0) {
					if (progress >= 0.75 && progress <= 0.95) {
						const textProgress = (progress - 0.75) / 0.2;
						const totalWords = headerSplit.words.length;

						headerSplit.words.forEach((word, index) => {
							const wordRevealProgress = index / totalWords;
							gsap.set(word, {
								opacity: textProgress >= wordRevealProgress ? 1 : 0,
							});
						});
					} else if (progress < 0.75) {
						gsap.set(headerSplit.words, { opacity: 0 });
					} else if (progress > 0.95) {
						gsap.set(headerSplit.words, { opacity: 1 });
					}
				}
			},
		});
	};

	const initOutroAnimations = (smoothStep) => {
		const outroHeader = document.querySelector(".outro h3");
		let outroSplit = null;

		if (outroHeader) {
			outroSplit = new SplitType(outroHeader, { types: "words" });
			splitInstancesRef.current.push(outroSplit);
			gsap.set(outroSplit.words, { opacity: 0 });
		}

		const outroStrips = document.querySelectorAll(".outro-strip");
		const stripSpeeds = [0.3, 0.4, 0.25, 0.35, 0.2, 0.25];

		ScrollTrigger.create({
			trigger: ".outro",
			start: "top top",
			end: `+=${window.innerHeight * 2}px`, // Reduced from 3 to 2
			pin: true,
			pinSpacing: true,
			invalidateOnRefresh: true,
			scrub: 1,
			id: "outro-pin",
			onUpdate: (self) => {
				const progress = self.progress;

				if (outroSplit && outroSplit.words.length > 0) {
					if (progress >= 0.25 && progress <= 0.75) {
						const textProgress = (progress - 0.25) / 0.5;
						const totalWords = outroSplit.words.length;

						outroSplit.words.forEach((word, index) => {
							const wordRevealProgress = index / totalWords;
							gsap.set(word, {
								opacity: textProgress >= wordRevealProgress ? 1 : 0,
							});
						});
					} else if (progress < 0.25) {
						gsap.set(outroSplit.words, { opacity: 0 });
					} else if (progress > 0.75) {
						gsap.set(outroSplit.words, { opacity: 1 });
					}
				}
			},
		});

		ScrollTrigger.create({
			trigger: ".outro",
			start: "top bottom",
			end: `+=${window.innerHeight * 4}px`, // Reduced from 6 to 4
			scrub: 1,
			onUpdate: (self) => {
				const progress = self.progress;

				outroStrips.forEach((strip, index) => {
					if (stripSpeeds[index] !== undefined) {
						const speed = stripSpeeds[index];
						const movement = progress * 100 * speed;
						gsap.set(strip, { x: `${movement}%` });
					}
				});
			},
		});
	};

	return (
		<>
			<section className="hero" ref={heroRef}>
				<div className="home-services-top-bar">
					<div className="container">
						<div className="symbols-container">
							<div className="symbol">
								{/* <img src="/symbols/s1" alt="Symbol" /> */}
							</div>
						</div>
						<div className="symbols-container">
							<div className="symbol">
								{/* <img src="/symbols/s1" alt="Symbol" /> */}
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="hero-content">
						<div className="hero-header">
							<h1 data-animate-type="reveal" data-animate-delay="0.25">
								ArtIcon
							</h1>
						</div>
					</div>
					<div className="hero-cards">
						<div className="card" id="hero-card-1">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">UI/UX</p>
									<p className="mono">01</p>
								</div>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="#3d424a"
									style={{
										height: "60px",
										width: "60px",
										display: "block",
										margin: "0 auto",
									}}
								>
									<path d="M24 4.5167a2.117 2.117 0 01-2.117 2.117 2.117 2.117 0 01-2.117-2.117 2.117 2.117 0 012.117-2.117A2.117 2.117 0 0124 4.5168zM1.1397 7.7475h5.7055c.5642 0 .9806.1772 1.1465.9716.185.8836.1129 1.4986-.8858 1.5686l-1.7909.132c1.318 8.3303 9.0277 11.0453 13.2221 2.073.6952-1.485.922-1.7548 1.6826-1.5663 1.0314.2561 1.1724.7899.677 2.2828-3.6234 11.0566-15.8186 12.166-18.211-2.6044l-1.4546.105C.0463 10.7942 0 9.7956 0 9.2404c0-1.0992.4074-1.493 1.1397-1.493z" />
								</svg>
								<div className="card-title">
									<p className="mono">01</p>
									<p className="mono">UI/UX</p>
								</div>
							</div>
						</div>
						<div className="card" id="hero-card-2">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">Graphic Designer</p>
									<p className="mono">02</p>
								</div>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="#3d424a"
									style={{
										height: "60px",
										width: "60px",
										display: "block",
										margin: "0 auto",
									}}
								>
									<path d="M19.343 20.672a1.94 1.94 0 0 0 1.94-1.94 1.94 1.94 0 1 0-3.88 0 1.94 1.94 0 0 0 1.94 1.94zM9.058 12.796a6.858 6.858 0 1 0-2.324-9.67c-.062.099-.125.198-.185.3-.06.103-.11.205-.167.31a6.858 6.858 0 0 0 2.676 9.06zm0-.003h-4.23l-2.113 3.663 2.114 3.667h4.229l2.116-3.667zm0 7.33L6.82 23.999h4.48Z" />
								</svg>
								<div className="card-title">
									<p className="mono">02</p>
									<p className="mono">Graphic Designer</p>
								</div>
							</div>
						</div>
						<div className="card" id="hero-card-3">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">Video Editor</p>
									<p className="mono">03</p>
								</div>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="#3d424a"
									style={{
										height: "60px",
										width: "60px",
										display: "block",
										margin: "0 auto",
									}}
								>
									<path d="M9.191 6.777a1.409 1.409 0 0 0-1.384 1.41v7.62a1.406 1.406 0 0 0 2.109 1.218l6.633-3.832a1.38 1.38 0 0 0 0-2.392L9.916 6.969a1.39 1.39 0 0 0-.725-.192zm.381 1.33a.895.895 0 0 1 .602.106l5.22 3.014a.896.896 0 0 1 0 1.546l-5.22 3.014a.894.894 0 0 1-1.342-.773V8.986a.895.895 0 0 1 .74-.878zM8.154.633C3.414 2.233 0 6.716 0 12c0 6.626 5.374 12 12 12 5.161 0 9.568-3.266 11.258-7.84l-3.838-.844-5.148 5.149-8.465-2.272-2.272-8.465 5.059-5.056zM12 0c-.471 0-.929.025-1.387.076l.412 3.801 7.168 1.924 1.91 7.101 3.774.832c.084-.567.123-1.14.123-1.734 0-6.626-5.374-12-12-12z" />
								</svg>
								<div className="card-title">
									<p className="mono">03</p>
									<p className="mono">Video Editor</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="hero-marquee-wrapper">
					<div className="hero-tagline-container">
						<p
							className="md"
							data-animate-type="line-reveal"
							data-animate-delay="0.25"
						>
							Intelligence In <span className="fancy-word">Creation</span>
						</p>
					</div>
					<div className="hero-marquee-container">
						<Marquee />
					</div>
				</div>
			</section>

			<section className="home-about">
				<div className="container">
					<div className="home-about-col">
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s2-light.svg" alt="Symbol" />
							</div>
						</div>
						<div className="home-about-header">
							<h2
								data-animate-type="line-reveal"
								data-animate-delay="0.2"
								data-animate-on-scroll="true"
								style={{ marginBottom: "100px", fontSize: "80px" }}
							>
								4 categories. One integrated vision. That blends creativity,
								motion, and experience into mastery.
							</h2>
							{/* <p
								className="mono"
								data-animate-type="scramble"
								data-animate-delay="0.2"
								data-animate-on-scroll="true"
								style={{ fontSize: "20px" }}
							>
								<span>&#9654;</span> Complete All Three Tasks Under One Theme
							</p> */}
						</div>
					</div>
					<div className="home-about-col">
						<div className="home-about-col-row">
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.2"
									data-animate-on-scroll="true"
								></p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.2"
									data-animate-on-scroll="true"
									style={{ transform: "translateY(-40px)" }}
								>
									Articon Champion
								</h4>
							</div>
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.25"
									data-animate-on-scroll="true"
								></p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.25"
									data-animate-on-scroll="true"
									style={{ transform: "translateY(-40px)" }}
								>
									Graphic Designer
								</h4>
							</div>
						</div>
						<div className="home-about-col-row">
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.3"
									data-animate-on-scroll="true"
								></p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.3"
									data-animate-on-scroll="true"
									style={{ transform: "translateY(-40px)" }}
								>
									UI/UX
								</h4>
							</div>
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.35"
									data-animate-on-scroll="true"
								></p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.35"
									data-animate-on-scroll="true"
									style={{ transform: "translateY(-40px)" }}
								>
									Video Editor
								</h4>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="home-services">
				<div className="container">
					<div className="home-services-header">
						<p className="md">What we expect from you</p>
					</div>
				</div>
				<div className="home-services-top-bar">
					<div className="container">
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s1-dark.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s3-dark.svg" alt="Symbol" />
							</div>
						</div>
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s3-dark.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s1-dark.svg" alt="Symbol" />
							</div>
						</div>
					</div>
				</div>
				<div className="cards">
					<div className="cards-container">
						<div className="card" id="card-1">
							<div className="card-wrapper">
								<div className="flip-card-inner">
									<div className="flip-card-front">
										<div className="card-title">
											<p className="mono">UI/UX</p>
											<p className="mono">01</p>
										</div>
										<svg
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#3d424a"
											style={{
												height: "200px",
												width: "200px",
												display: "block",
												margin: "0 auto",
											}}
										>
											<path d="M24 4.5167a2.117 2.117 0 01-2.117 2.117 2.117 2.117 0 01-2.117-2.117 2.117 2.117 0 012.117-2.117A2.117 2.117 0 0124 4.5168zM1.1397 7.7475h5.7055c.5642 0 .9806.1772 1.1465.9716.185.8836.1129 1.4986-.8858 1.5686l-1.7909.132c1.318 8.3303 9.0277 11.0453 13.2221 2.073.6952-1.485.922-1.7548 1.6826-1.5663 1.0314.2561 1.1724.7899.677 2.2828-3.6234 11.0566-15.8186 12.166-18.211-2.6044l-1.4546.105C.0463 10.7942 0 9.7956 0 9.2404c0-1.0992.4074-1.493 1.1397-1.493z" />
										</svg>
										<div className="card-title">
											<p className="mono">01</p>
											<p className="mono">UI/UX</p>
										</div>
									</div>
									<div className="flip-card-back">
										<svg
											className="card-back-icon"
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M24 4.5167a2.117 2.117 0 01-2.117 2.117 2.117 2.117 0 01-2.117-2.117 2.117 2.117 0 012.117-2.117A2.117 2.117 0 0124 4.5168zM1.1397 7.7475h5.7055c.5642 0 .9806.1772 1.1465.9716.185.8836.1129 1.4986-.8858 1.5686l-1.7909.132c1.318 8.3303 9.0277 11.0453 13.2221 2.073.6952-1.485.922-1.7548 1.6826-1.5663 1.0314.2561 1.1724.7899.677 2.2828-3.6234 11.0566-15.8186 12.166-18.211-2.6044l-1.4546.105C.0463 10.7942 0 9.7956 0 9.2404c0-1.0992.4074-1.493 1.1397-1.493z" />
										</svg>
										<div className="card-title">
											<p className="mono">UI/UX</p>
											<p className="mono">01</p>
										</div>
										<div className="card-copy">
											<ul className="card-points">
												<li>User-Focused</li>
												<li>Wireframe Pro</li>
												<li>Clean Layout Mindset</li>
												<li>Strong UX Logic</li>
												<li>Interactive Thinking</li>
												<li>Data-Driven Decisions</li>
											</ul>
										</div>
										<div className="card-title">
											<p className="mono">01</p>
											<p className="mono">UI/UX</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="card" id="card-2">
							<div className="card-wrapper">
								<div className="flip-card-inner">
									<div className="flip-card-front">
										<div className="card-title">
											<p className="mono">Graphic Designer</p>
											<p className="mono">02</p>
										</div>
										<svg
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#3d424a"
											style={{
												height: "200px",
												width: "200px",
												display: "block",
												margin: "0 auto",
											}}
										>
											<path d="M19.343 20.672a1.94 1.94 0 0 0 1.94-1.94 1.94 1.94 0 1 0-3.88 0 1.94 1.94 0 0 0 1.94 1.94zM9.058 12.796a6.858 6.858 0 1 0-2.324-9.67c-.062.099-.125.198-.185.3-.06.103-.11.205-.167.31a6.858 6.858 0 0 0 2.676 9.06zm0-.003h-4.23l-2.113 3.663 2.114 3.667h4.229l2.116-3.667zm0 7.33L6.82 23.999h4.48Z" />
										</svg>
										<div className="card-title">
											<p className="mono">02</p>
											<p className="mono">Graphic Designer</p>
										</div>
									</div>
									<div className="flip-card-back">
										<svg
											className="card-back-icon"
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M19.343 20.672a1.94 1.94 0 0 0 1.94-1.94 1.94 1.94 0 1 0-3.88 0 1.94 1.94 0 0 0 1.94 1.94zM9.058 12.796a6.858 6.858 0 1 0-2.324-9.67c-.062.099-.125.198-.185.3-.06.103-.11.205-.167.31a6.858 6.858 0 0 0 2.676 9.06zm0-.003h-4.23l-2.113 3.663 2.114 3.667h4.229l2.116-3.667zm0 7.33L6.82 23.999h4.48Z" />
										</svg>
										<div className="card-title">
											<p className="mono">Graphic Designer</p>
											<p className="mono">02</p>
										</div>
										<div className="card-copy">
											<ul className="card-points">
												<li>Creative</li>
												<li>Detail-oriented</li>
												<li>Brand-focused</li>
												<li>Skilled in design tools</li>
												<li>Visual communicator</li>
												<li>Deadline-driven</li>
											</ul>
										</div>
										<div className="card-title">
											<p className="mono">02</p>
											<p className="mono">Graphic Designer</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="card" id="card-3">
							<div className="card-wrapper">
								<div className="flip-card-inner">
									<div className="flip-card-front">
										<div className="card-title">
											<p className="mono">Video Editor</p>
											<p className="mono">03</p>
										</div>
										<svg
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#3d424a"
											style={{
												height: "200px",
												width: "200px",
												display: "block",
												margin: "0 auto",
											}}
										>
											<path d="M9.191 6.777a1.409 1.409 0 0 0-1.384 1.41v7.62a1.406 1.406 0 0 0 2.109 1.218l6.633-3.832a1.38 1.38 0 0 0 0-2.392L9.916 6.969a1.39 1.39 0 0 0-.725-.192zm.381 1.33a.895.895 0 0 1 .602.106l5.22 3.014a.896.896 0 0 1 0 1.546l-5.22 3.014a.894.894 0 0 1-1.342-.773V8.986a.895.895 0 0 1 .74-.878zM8.154.633C3.414 2.233 0 6.716 0 12c0 6.626 5.374 12 12 12 5.161 0 9.568-3.266 11.258-7.84l-3.838-.844-5.148 5.149-8.465-2.272-2.272-8.465 5.059-5.056zM12 0c-.471 0-.929.025-1.387.076l.412 3.801 7.168 1.924 1.91 7.101 3.774.832c.084-.567.123-1.14.123-1.734 0-6.626-5.374-12-12-12z" />
										</svg>
										<div className="card-title">
											<p className="mono">03</p>
											<p className="mono">Video Editor</p>
										</div>
									</div>
									<div className="flip-card-back">
										<svg
											className="card-back-icon"
											role="img"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M9.191 6.777a1.409 1.409 0 0 0-1.384 1.41v7.62a1.406 1.406 0 0 0 2.109 1.218l6.633-3.832a1.38 1.38 0 0 0 0-2.392L9.916 6.969a1.39 1.39 0 0 0-.725-.192zm.381 1.33a.895.895 0 0 1 .602.106l5.22 3.014a.896.896 0 0 1 0 1.546l-5.22 3.014a.894.894 0 0 1-1.342-.773V8.986a.895.895 0 0 1 .74-.878zM8.154.633C3.414 2.233 0 6.716 0 12c0 6.626 5.374 12 12 12 5.161 0 9.568-3.266 11.258-7.84l-3.838-.844-5.148 5.149-8.465-2.272-2.272-8.465 5.059-5.056zM12 0c-.471 0-.929.025-1.387.076l.412 3.801 7.168 1.924 1.91 7.101 3.774.832c.084-.567.123-1.14.123-1.734 0-6.626-5.374-12-12-12z" />
										</svg>
										<div className="card-title">
											<p className="mono">Video Editor</p>
											<p className="mono">03</p>
										</div>
										<div className="card-copy">
											<ul className="card-points">
												<li>Sharp Timing</li>
												<li>Prompt Expert</li>
												<li>Smooth Flow</li>
												<li>Story Driven</li>
												<li>AI-Savvy</li>
												<li>Fast & Efficient</li>
											</ul>
										</div>
										<div className="card-title">
											<p className="mono">03</p>
											<p className="mono">Video Editor</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default JunoLanding;
