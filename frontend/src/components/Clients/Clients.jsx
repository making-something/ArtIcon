"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import "./Clients.css";

const Clients = () => {
	const containerRef = useRef(null);
	const highlightRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);
	const currentActiveElementRef = useRef(null);

	// Client data - placeholder logos live in /public and can be swapped later
	const clients = [
		[
			{
				name: "MULTIICON",
				logoSrc: "/multiicon.avif",
				alt: "Multiicon sponsor logo",
			},
		],
		[
			{
				name: "RITA",
				logoSrc: "/rita.avif",
				alt: "Rita sponsor logo",
			},
		],
	];

	useEffect(() => {
		const checkScreenSize = () => {
			const newIsMobile = window.innerWidth < 1000;

			if (newIsMobile !== isMobile) {
				setIsMobile(newIsMobile);

				if (newIsMobile) {
					// Mobile - hide highlighter
					if (highlightRef.current) {
						highlightRef.current.style.opacity = "0";
					}

					// Reset active states
					const gridItems =
						containerRef.current?.querySelectorAll(".grid-item");
					gridItems?.forEach((item) => {
						item.classList.remove("is-active");
					});

					currentActiveElementRef.current = null;
				} else {
					// Desktop - show highlighter
					if (highlightRef.current) {
						highlightRef.current.style.opacity = "1";
					}

					// Move to first item
					const firstItem = containerRef.current?.querySelector(".grid-item");
					if (firstItem) {
						moveToElement(firstItem);
					}
				}
			}
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);

		// Initialize on desktop
		if (!isMobile) {
			const firstItem = containerRef.current?.querySelector(".grid-item");
			if (firstItem) {
				moveToElement(firstItem);
			}
		}

		return () => {
			window.removeEventListener("resize", checkScreenSize);
		};
	}, [isMobile]);

	const getHighlightColor = () => {
		return "#b1c1ef";
	};

	const moveToElement = (element) => {
		if (!element || isMobile || !containerRef.current || !highlightRef.current)
			return;

		if (currentActiveElementRef.current === element) return;

		// Reset previous active state
		if (currentActiveElementRef.current) {
			currentActiveElementRef.current.classList.remove("is-active");
		}

		// Update highlighter position and size
		const rect = element.getBoundingClientRect();
		const containerRect = containerRef.current.getBoundingClientRect();

		highlightRef.current.style.transform = `translate(${
			rect.left - containerRect.left
		}px, ${rect.top - containerRect.top}px)`;
		highlightRef.current.style.width = `${rect.width}px`;
		highlightRef.current.style.height = `${rect.height}px`;
		highlightRef.current.style.backgroundColor = getHighlightColor();

		currentActiveElementRef.current = element;
		element.classList.add("is-active");

		// Active state flag is enough for logo styling
	};

	const handleMouseMove = (e) => {
		if (isMobile) return;

		const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
		let targetElement = null;

		if (hoveredElement && hoveredElement.classList.contains("grid-item")) {
			targetElement = hoveredElement;
		} else if (
			hoveredElement &&
			hoveredElement.parentElement &&
			hoveredElement.parentElement.classList.contains("grid-item")
		) {
			targetElement = hoveredElement.parentElement;
		}

		if (targetElement) {
			moveToElement(targetElement);
		}
	};

	return (
		<section className="clients">
			<div
				className="container"
				ref={containerRef}
				onMouseMove={handleMouseMove}
			>
				<div className="clients-header">
					<p>[ &nbsp;Selected Collaborations&nbsp; ]</p>
					<h3>Sponsors in Creation</h3>
				</div>

				<div className="grid">
					{clients.map((row, rowIndex) => (
						<div className="grid-row" key={rowIndex}>
							{row.map((client, clientIndex) => (
								<div className="grid-item" key={`${client.name}-${clientIndex}`}>
									<div className="grid-item-content">
										<div className="logo-wrapper">
											<Image
												src={client.logoSrc}
												alt={client.alt}
												fill
												sizes="(max-width: 1000px) 60vw, 20vw"
												className="client-logo"
												priority={rowIndex === 0 && clientIndex === 0}
												style={{ objectFit: "contain" }}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					))}
				</div>

				<div className="highlight" ref={highlightRef}></div>
			</div>
		</section>
	);
};

export default Clients;
