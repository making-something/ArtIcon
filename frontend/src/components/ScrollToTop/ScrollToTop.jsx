"use client";

import { useState, useEffect } from "react";
import { ArrowUpIcon } from "lucide-react";
import "./ScrollToTop.css";

export default function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			// Show button when page is scrolled down 400px
			if (window.scrollY > 400) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);

		return () => {
			window.removeEventListener("scroll", toggleVisibility);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<button
			className={`scroll-to-top ${isVisible ? "visible" : ""}`}
			onClick={scrollToTop}
			aria-label="Scroll to top"
		>
			<ArrowUpIcon />
		</button>
	);
}

