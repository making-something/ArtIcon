"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
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

		const split = new SplitType(element, { types: "chars" });
		splitInstancesRef.current.push(split);

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
		elements.forEach((char, index) => {
			setTimeout(() => {
				scrambleText([char], duration);
			}, index * 30);
		});
	};

	const scrambleText = (elements, duration = 0.4) => {
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
			end: `+=${window.innerHeight * 4}px`,
			pin: ".home-services",
			pinSpacing: true,
		});

		ScrollTrigger.create({
			trigger: ".home-services",
			start: "top bottom",
			end: `+=${window.innerHeight * 4}`,
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
			scrub: 1,
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
			end: `+=${window.innerHeight * 3}px`,
			pin: true,
			pinSpacing: true,
			scrub: 1,
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
			end: `+=${window.innerHeight * 6}px`,
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
								<img src="/symbols/s1-dark.svg" alt="Symbol" />
							</div>
						</div>
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s1-dark.svg" alt="Symbol" />
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="hero-content">
						<div className="hero-header">
							<h1 data-animate-type="reveal" data-animate-delay="0.25">
								Welcome to ArtIcon 2025!!
							</h1>
						</div>
						<div className="hero-footer">
							<div className="hero-footer-copy">
								<p
									className="md"
									data-animate-type="line-reveal"
									data-animate-delay="0.25"
								>
									So, Creators… Get your AI tools, Devices & imagination ready!
									Yeh koi simple competition nahi!! Yeh hai Hackathon of Creativity jaha art,
									design aur AI milke future banate hain! ArtIcon 2025, Gujarat's fusion festival
									of design, logic & futuristic art!
								</p>
							</div>
							<div className="hero-footer-tags">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.5"
								>
									<span>&#9654;</span> Intelligence In Creation
								</p>
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.5"
								>
									<span>&#9654;</span> Hackathon of Creativity
								</p>
							</div>
						</div>
					</div>
					<div className="hero-cards">
						<div className="card" id="hero-card-1">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">Plan</p>

									<p className="mono">01</p>
								</div>

								<div className="card-title">
									<p className="mono">01</p>
									<p className="mono">Plan</p>
								</div>
							</div>
						</div>
						<div className="card" id="hero-card-2">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">Design</p>
									<p className="mono">02</p>
								</div>
								<div className="card-title">
									<p className="mono">02</p>
									<p className="mono">Design</p>
								</div>
							</div>
						</div>
						<div className="card" id="hero-card-3">
							<div className="hero-card-inner">
								<div className="card-title">
									<p className="mono">Develop</p>
									<p className="mono">03</p>
								</div>

								<div className="card-title">
									<p className="mono">03</p>
									<p className="mono">Develop</p>
								</div>
							</div>
						</div>
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
							<p
								className="mono"
								data-animate-type="scramble"
								data-animate-delay="0.2"
								data-animate-on-scroll="true"
							>
								<span>&#9654;</span> Kyu Banoge ArtIcon?
							</p>
							<h3
								data-animate-type="line-reveal"
								data-animate-delay="0.2"
								data-animate-on-scroll="true"
							>
								Jab Creativity aur Competition milte hai, tab banta hai Icon!
							</h3>
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
								>
									[ Category 01 ]
								</p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.2"
									data-animate-on-scroll="true"
								>
									Graphic Design
								</h4>
							</div>
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.25"
									data-animate-on-scroll="true"
								>
									[ Category 02 ]
								</p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.25"
									data-animate-on-scroll="true"
								>
									UI/UX Design
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
								>
									[ Category 03 ]
								</p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.3"
									data-animate-on-scroll="true"
								>
									Video Editing
								</h4>
							</div>
							<div className="home-about-card">
								<p
									className="mono"
									data-animate-type="scramble"
									data-animate-delay="0.35"
									data-animate-on-scroll="true"
								>
									[ Main Rule ]
								</p>
								<h4
									data-animate-type="line-reveal"
									data-animate-delay="0.35"
									data-animate-on-scroll="true"
								>
									One Icon to Rule Them All
								</h4>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="home-services">
				<div className="container">
					<div className="home-services-header">
						<p className="md">Event Details & Registration</p>
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
				<div className="home-services-bottom-bar">
					<div className="container">
						<p
							className="mono"
							data-animate-type="scramble"
							data-animate-delay="0.2"
							data-animate-on-scroll="true"
						>
							<span>&#9654;</span> Date & Time
						</p>
						<p
							className="mono"
							data-animate-type="scramble"
							data-animate-delay="0.25"
							data-animate-on-scroll="true"
						>
							🗓️ 29th November 2025 | 🕘 9:00 AM – 7:30 PM
						</p>
					</div>
				</div>
				<div className="cards">
					<div className="cards-container">
						<div className="card" id="card-1">
							<div className="card-wrapper">
								<div className="flip-card-inner">
									<div className="flip-card-front">
										<div className="card-title">
											<p className="mono">Location</p>
											<p className="mono">01</p>
										</div>
										<div className="card-title">
											<p className="mono">01</p>
											<p className="mono">Location</p>
										</div>
									</div>
									<div className="flip-card-back">
										<div className="card-title">
											<p className="mono">Location</p>
											<p className="mono">01</p>
										</div>
										<div className="card-copy">
											<p>📍 Multiicon: Ideotechnology</p>
											<p>Floor 3, Rumi Plaza</p>
											<p>Airport Main Rd</p>
											<p>near Race Course Road</p>
											<p>Maruti Nagar, Rajkot</p>
											<p>Gujarat 360001</p>
										</div>
										<div className="card-title">
											<p className="mono">01</p>
											<p className="mono">Location</p>
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
											<p className="mono">Awards</p>
											<p className="mono">02</p>
										</div>
										<div className="card-title">
											<p className="mono">02</p>
											<p className="mono">Awards</p>
										</div>
									</div>
									<div className="flip-card-back">
										<div className="card-title">
											<p className="mono">Awards</p>
											<p className="mono">02</p>
										</div>
										<div className="card-copy">
											<p>🏆 ArtIcon 2025 Champion</p>
											<p>₹10,000 + 6-Month Internship</p>
											<p>Social Media Feature</p>
											<p>Category Runner-Ups</p>
											<p>₹5,000 + Feature Post</p>
											<p>Certificates & Recognition</p>
										</div>
										<div className="card-title">
											<p className="mono">02</p>
											<p className="mono">Awards</p>
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
											<p className="mono">Registration</p>
											<p className="mono">03</p>
										</div>
										<div className="card-title">
											<p className="mono">03</p>
											<p className="mono">Registration</p>
										</div>
									</div>
									<div className="flip-card-back">
										<div className="card-title">
											<p className="mono">Registration</p>
											<p className="mono">03</p>
										</div>
										<div className="card-copy">
											<p>🎫 FREE Registration</p>
											<p>Limited seats available</p>
											<p>Applications from 14th Nov</p>
											<p>Results on event day</p>
											<p>Participation kit included</p>
											<p>Mentorship sessions</p>
										</div>
										<div className="card-title">
											<p className="mono">03</p>
											<p className="mono">Registration</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/*<section className="home-spotlight">
				<div className="home-spotlight-top-bar">
					<div className="container">
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s1-light.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s2-light.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s3-light.svg" alt="Symbol" />
							</div>
						</div>
						<div className="symbols-container">
							<div className="symbol">
								<img src="/symbols/s3-light.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s2-light.svg" alt="Symbol" />
							</div>
							<div className="symbol">
								<img src="/symbols/s1-light.svg" alt="Symbol" />
							</div>
						</div>
					</div>
				</div>
				<div className="home-spotlight-bottom-bar">
					<div className="container">
						<p
							className="mono"
							data-animate-type="scramble"
							data-animate-delay="0.2"
							data-animate-on-scroll="true"
						>
							<span>&#9654;</span> Visual logs
						</p>
						<p
							className="mono"
							data-animate-type="scramble"
							data-animate-delay="0.25"
							data-animate-on-scroll="true"
						>
							/ Portfolio Arc
						</p>
					</div>
				</div>
				<div className="container">
					<div className="spotlight-intro-header">
						<h3
							data-animate-type="line-reveal"
							data-animate-delay="0.3"
							data-animate-on-scroll="true"
						>
							Trends shout but Juno whispers
						</h3>
					</div>
				</div>
				<div className="home-spotlight-images">
					<div className="home-spotlight-images-row">
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-1.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-2.jpg" alt="" />
						</div>
					</div>
					<div className="home-spotlight-images-row">
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-3.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image"></div>
					</div>
					<div className="home-spotlight-images-row">
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-4.jpg" alt="" />
						</div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-5.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
					</div>
					<div className="home-spotlight-images-row">
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-6.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-7.jpg" alt="" />
						</div>
					</div>
					<div className="home-spotlight-images-row">
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-8.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
						<div className="home-spotlight-image image-holder">
							<img src="/spotlight-images/spotlight-img-9.jpg" alt="" />
						</div>
						<div className="home-spotlight-image"></div>
					</div>
				</div>
				<div className="spotlight-mask-image-container">
					<div className="spotlight-mask-image">
						<img src="/spotlight-images/spotlight-banner.jpg" alt="" />
					</div>
					<div className="container">
						<div className="spotlight-mask-header">
							<h3>Built This Face with Flexbox</h3>
						</div>
					</div>
				</div>
			</section>

			<section className="outro">
				<div className="container">
					<h3>Scroll ends but ideas don't</h3>
				</div>
				<div className="outro-strips">
					<div className="outro-strip os-1">
						<div className="skill skill-var-1">
							<p className="mono">Frontend</p>
						</div>
						<div className="skill skill-var-2">
							<p className="mono">UX</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Vibe Check</p>
						</div>
						<div className="skill skill-var-1">
							<p className="mono">Clean Code</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Creative Flow</p>
						</div>
						<div className="skill skill-var-1">
							<p className="mono">Pixel Logic</p>
						</div>
					</div>
					<div className="outro-strip os-2">
						<div className="skill skill-var-2">
							<p className="mono">Motion</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Taste</p>
						</div>
						<div className="skill skill-var-1">
							<p className="mono">Grid Game</p>
						</div>
					</div>
					<div className="outro-strip os-3">
						<div className="skill skill-var-2">
							<p className="mono">Details</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Toronto Core</p>
						</div>
						<div className="skill skill-var-1">
							<p className="mono">Builds</p>
						</div>
						<div className="skill skill-var-2">
							<p className="mono">Case Studies</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Scroll Love</p>
						</div>
						<div className="skill skill-var-3">
							<p className="mono">Easings</p>
						</div>
						<div className="skill skill-var-1">
							<p className="mono">HTML Mindset</p>
						</div>
					</div>
				</div>
			</section> */}
		</>
	);
};

export default JunoLanding;
