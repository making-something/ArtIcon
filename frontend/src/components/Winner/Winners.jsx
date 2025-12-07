"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import "./Winners.css";

if (typeof window !== "undefined") {
	gsap.registerPlugin(SplitText);
}

const winnerData = [
	{ id: 2, name: "Uttam P.", category: "Graphic Designer" },
	{ id: 3, name: "Dipen J.", category: "Video Editor" },
	{ id: 4, name: "Hitanshu A.", category: "UI/UX Designer" },
];

const Winners = () => {
	const [isReady, setIsReady] = useState(false);
	const winnersContainerRef = useRef(null);
	const profileImagesContainerRef = useRef(null);
	const profileImagesRef = useRef([]);
	const nameElementsRef = useRef([]);
	const nameHeadingsRef = useRef([]);

	// Set ready after component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReady(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	// Winners section animation
	useEffect(() => {
		if (!isReady) return;

		const profileImagesContainer = profileImagesContainerRef.current;
		const profileImages = profileImagesRef.current.filter(Boolean);
		const nameElements = nameElementsRef.current.filter(Boolean);
		const nameHeadings = nameHeadingsRef.current.filter(Boolean);

		if (nameHeadings.length === 0) return;

		let mm = gsap.matchMedia();
		const splits = [];

		// Split text into characters
		nameHeadings.forEach((heading) => {
			const split = new SplitText(heading, { type: "chars" });
			split.chars.forEach((char) => {
				char.classList.add("letter");
			});
			splits.push(split);
		});

		const defaultLetters = nameElements[0]?.querySelectorAll(".letter");

		mm.add("(min-width: 900px)", () => {
			// Desktop Logic
			// Ensure default is visible (0%) and others are hidden (100%)
			if (defaultLetters) gsap.set(defaultLetters, { y: "0%" });
			nameElements.slice(1).forEach((el) => {
				const letters = el.querySelectorAll(".letter");
				const category = el.querySelector(".category");
				gsap.set(letters, { y: "100%" });
				if (category) gsap.set(category, { y: "100%", opacity: 0 });
			});

			const handlers = [];

			profileImages.forEach((img, index) => {
				if (!img) return;

				const correspondingName = nameElements[index + 1];
				if (!correspondingName) return;

				const letters = correspondingName.querySelectorAll(".letter");
				const category = correspondingName.querySelector(".category");
				const isLarge = img.classList.contains("img-large");
				const defaultSize = isLarge ? 150 : 80;
				const hoverSize = isLarge ? 220 : 160;

				const handleMouseEnter = () => {
					// Image Scale
					gsap.to(img, {
						width: hoverSize,
						height: hoverSize,
						duration: 0.5,
						ease: "power4.out",
					});

					// Show Name (Up from bottom)
					gsap.to(letters, {
						y: "0%",
						ease: "power4.out",
						duration: 0.75,
						stagger: { each: 0.025, from: "center" },
					});

					if (category) {
						gsap.to(category, {
							y: "0%",
							opacity: 1,
							ease: "power4.out",
							duration: 0.75,
						});
					}

					// Hide Artists (Up to top)
					if (defaultLetters) {
						gsap.to(defaultLetters, {
							y: "-100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					}
				};

				const handleMouseLeave = () => {
					// Image Scale Reset
					gsap.to(img, {
						width: defaultSize,
						height: defaultSize,
						duration: 0.5,
						ease: "power4.out",
					});

					// Hide Name (Down to bottom)
					gsap.to(letters, {
						y: "100%",
						ease: "power4.out",
						duration: 0.75,
						stagger: { each: 0.025, from: "center" },
					});

					if (category) {
						gsap.to(category, {
							y: "100%",
							opacity: 0,
							ease: "power4.out",
							duration: 0.75,
						});
					}

					// Show Artists (Down from top)
					if (defaultLetters) {
						gsap.to(defaultLetters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					}
				};

				img.addEventListener("mouseenter", handleMouseEnter);
				img.addEventListener("mouseleave", handleMouseLeave);
				handlers.push({
					el: img,
					enter: handleMouseEnter,
					leave: handleMouseLeave,
				});
			});

			return () => {
				handlers.forEach(({ el, enter, leave }) => {
					el.removeEventListener("mouseenter", enter);
					el.removeEventListener("mouseleave", leave);
				});
			};
		});

		mm.add("(max-width: 899px)", () => {
			// Mobile Logic
			if (defaultLetters) gsap.set(defaultLetters, { y: "0%" });
			nameElements.slice(1).forEach((el) => {
				const letters = el.querySelectorAll(".letter");
				const category = el.querySelector(".category");
				gsap.set(letters, { y: "100%" });
				if (category) gsap.set(category, { y: "100%", opacity: 0 });
			});

			let activeIndex = -1;
			const handlers = [];

			profileImages.forEach((img, index) => {
				const correspondingName = nameElements[index + 1];
				if (!correspondingName || !img) return;

				const letters = correspondingName.querySelectorAll(".letter");
				const category = correspondingName.querySelector(".category");
				const isLarge = img.classList.contains("img-large");
				const defaultSize = isLarge ? 110 : 80;
				const activeSize = isLarge ? 140 : 100;

				const handleClick = (e) => {
					e.stopPropagation();

					if (activeIndex === index) {
						// Deactivate current
						gsap.to(img, {
							width: defaultSize,
							height: defaultSize,
							duration: 0.5,
							ease: "power4.out",
						});

						// Hide Name (Down)
						gsap.to(letters, {
							y: "100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});

						if (category) {
							gsap.to(category, {
								y: "100%",
								opacity: 0,
								ease: "power4.out",
								duration: 0.75,
							});
						}

						// Show Artists (Down)
						if (defaultLetters) {
							gsap.to(defaultLetters, {
								y: "0%",
								ease: "power4.out",
								duration: 0.75,
								stagger: { each: 0.025, from: "center" },
							});
						}
						activeIndex = -1;
					} else {
						// Deactivate previous
						if (activeIndex !== -1) {
							const prevImg = profileImages[activeIndex];
							const prevName = nameElements[activeIndex + 1];
							if (prevImg && prevName) {
								const prevLetters = prevName.querySelectorAll(".letter");
								const prevCategory = prevName.querySelector(".category");
								const prevIsLarge = prevImg.classList.contains("img-large");
								const prevDefSize = prevIsLarge ? 110 : 80;

								gsap.to(prevImg, {
									width: prevDefSize,
									height: prevDefSize,
									duration: 0.5,
									ease: "power4.out",
								});
								// Hide Previous Name (Down)
								gsap.to(prevLetters, { y: "100%", duration: 0.5 });
								if (prevCategory)
									gsap.to(prevCategory, { y: "100%", opacity: 0, duration: 0.5 });
							}
						}

						// Activate new
						gsap.to(img, {
							width: activeSize,
							height: activeSize,
							duration: 0.5,
							ease: "power4.out",
						});

						// Show New Name (Up)
						gsap.to(letters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});

						if (category) {
							gsap.to(category, {
								y: "0%",
								opacity: 1,
								ease: "power4.out",
								duration: 0.75,
							});
						}

						// Hide Artists (Up)
						if (defaultLetters) {
							gsap.to(defaultLetters, {
								y: "-100%",
								ease: "power4.out",
								duration: 0.75,
								stagger: { each: 0.025, from: "center" },
							});
						}

						activeIndex = index;
					}
				};

				img.addEventListener("click", handleClick);
				handlers.push({ el: img, click: handleClick });
			});

			const reset = () => {
				if (activeIndex !== -1) {
					const prevImg = profileImages[activeIndex];
					const prevName = nameElements[activeIndex + 1];
					if (prevImg && prevName) {
						const prevLetters = prevName.querySelectorAll(".letter");
						const prevCategory = prevName.querySelector(".category");
						const prevIsLarge = prevImg.classList.contains("img-large");
						const prevDefSize = prevIsLarge ? 110 : 80;
						gsap.to(prevImg, {
							width: prevDefSize,
							height: prevDefSize,
							duration: 0.5,
							ease: "power4.out",
						});
						// Hide Prev Name (Down)
						gsap.to(prevLetters, { y: "100%", duration: 0.5 });
						if (prevCategory)
							gsap.to(prevCategory, { y: "100%", opacity: 0, duration: 0.5 });
					}
					// Show Artists (Down)
					if (defaultLetters) {
						gsap.to(defaultLetters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					}
					activeIndex = -1;
				}
			};

			if (winnersContainerRef.current) {
				winnersContainerRef.current.addEventListener("click", reset);
			}

			return () => {
				handlers.forEach((h) => h.el.removeEventListener("click", h.click));
				if (winnersContainerRef.current) {
					winnersContainerRef.current.removeEventListener("click", reset);
				}
			};
		});

		return () => {
			mm.revert();
			splits.forEach((split) => split.revert());
		};
	}, [isReady]);

	return (
		<section className="winners-section">
			<div className="winners-box" ref={winnersContainerRef}>
				<div className="winners-content">
					<div className="profile-images" ref={profileImagesContainerRef}>
						{/* Only one row with 3 winners now */}
						<div className="image-row">
							{winnerData.map((data, index) => (
								<div
									key={`img${data.id}`}
									className="img img-large"
									ref={(el) => (profileImagesRef.current[index] = el)}
								>
									<Image
										src={`/winners/img${data.id}.jpeg`}
										alt={data.name}
										width={180}
										height={180}
										priority={true}
									/>
								</div>
							))}
						</div>
					</div>

					<div className="profile-names">
						<div
							className="name default"
							ref={(el) => (nameElementsRef.current[0] = el)}
						>
							<h1 ref={(el) => (nameHeadingsRef.current[0] = el)}>Winners</h1>
						</div>
						{winnerData.map((data, index) => (
							<div
								key={data.name}
								className="name"
								ref={(el) => (nameElementsRef.current[index + 1] = el)}
							>
								<h1 ref={(el) => (nameHeadingsRef.current[index + 1] = el)}>
									{data.name}
								</h1>
								<div className="category">{data.category}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Winners;