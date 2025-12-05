"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import "./Winners.css";

if (typeof window !== "undefined") {
	gsap.registerPlugin(SplitText);
}

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

		// Split text into characters
		const splits = nameHeadings.map((heading) => {
			const split = new SplitText(heading, { type: "chars" });
			split.chars.forEach((char) => {
				char.classList.add("letter");
			});
			return split;
		});

		if (nameElements[0]) {
			const defaultLetters = nameElements[0].querySelectorAll(".letter");
			gsap.set(defaultLetters, { y: "100%" });

			if (window.innerWidth >= 900) {
				const handlers = [];

				profileImages.forEach((img, index) => {
					if (!img) return;

					const correspondingName = nameElements[index + 1];
					if (!correspondingName) return;

					const letters = correspondingName.querySelectorAll(".letter");

					const isLarge = img.classList.contains("img-large");
					const defaultSize = isLarge ? 120 : 70;
					const hoverSize = isLarge ? 180 : 140;

					const handleMouseEnter = () => {
						gsap.to(img, {
							width: hoverSize,
							height: hoverSize,
							duration: 0.5,
							ease: "power4.out",
						});

						gsap.to(letters, {
							y: "-100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					};

					const handleMouseLeave = () => {
						gsap.to(img, {
							width: defaultSize,
							height: defaultSize,
							duration: 0.5,
							ease: "power4.out",
						});

						gsap.to(letters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					};

					img.addEventListener("mouseenter", handleMouseEnter);
					img.addEventListener("mouseleave", handleMouseLeave);
					handlers.push({
						el: img,
						enter: handleMouseEnter,
						leave: handleMouseLeave,
					});
				});

				if (profileImagesContainer) {
					const containerEnter = () => {
						const defaultLetters = nameElements[0].querySelectorAll(".letter");
						gsap.to(defaultLetters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					};

					const containerLeave = () => {
						const defaultLetters = nameElements[0].querySelectorAll(".letter");
						gsap.to(defaultLetters, {
							y: "100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: { each: 0.025, from: "center" },
						});
					};

					profileImagesContainer.addEventListener("mouseenter", containerEnter);
					profileImagesContainer.addEventListener("mouseleave", containerLeave);

					return () => {
						handlers.forEach(({ el, enter, leave }) => {
							el.removeEventListener("mouseenter", enter);
							el.removeEventListener("mouseleave", leave);
						});
						profileImagesContainer.removeEventListener(
							"mouseenter",
							containerEnter
						);
						profileImagesContainer.removeEventListener(
							"mouseleave",
							containerLeave
						);
						splits.forEach((split) => split.revert());
					};
				}
			}
		}
	}, [isReady]);

	return (
		<section className="winners-section">
			<div className="winners-box" ref={winnersContainerRef}>
				<div className="winners-content">
					<div className="profile-images" ref={profileImagesContainerRef}>
						{/* First Row - 1 larger element */}
						<div className="image-row row-first">
							<div
								key="img1"
								className="img img-large"
								ref={(el) => (profileImagesRef.current[0] = el)}
							>
								<Image
									src="/winners/img1.jpeg"
									alt="Winner 1"
									width={180}
									height={180}
									priority={true}
								/>
							</div>
						</div>

						{/* Second Row - 3 smaller elements */}
						<div className="image-row row-second">
							{[2, 3, 4].map((num, index) => (
								<div
									key={`img${num}`}
									className="img img-small"
									ref={(el) => (profileImagesRef.current[index + 1] = el)}
								>
									<Image
										src={`/winners/img${num}.jpeg`}
										alt={`Winner ${num}`}
										width={140}
										height={140}
										priority={false}
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
							<h1 ref={(el) => (nameHeadingsRef.current[0] = el)}>Artists</h1>
						</div>
						{["Someone", "MULTIICON", "BONTON", "MARKET MAYA"].map(
							(name, index) => (
								<div
									key={name}
									className="name"
									ref={(el) => (nameElementsRef.current[index + 1] = el)}
								>
									<h1 ref={(el) => (nameHeadingsRef.current[index + 1] = el)}>
										{name}
									</h1>
								</div>
							)
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Winners;
