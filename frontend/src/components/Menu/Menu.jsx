"use client";
import "./Menu.css";
import { useRef, useState, useEffect } from "react";
import { useLenis } from "lenis/react";
import { useViewTransition } from "@/hooks/useViewTransition"; // Assuming you have this hook
// If you don't have useViewTransition, use: import { useRouter } from 'next/navigation';

const Menu = () => {
	const [isAtTop, setIsAtTop] = useState(true);
	const lenis = useLenis();
	const { navigateWithTransition } = useViewTransition();
	// OR: const router = useRouter();

	// Handle Logo Visibility on Scroll
	useEffect(() => {
		const updateVisibility = (scrollValue = 0) => {
			setIsAtTop(scrollValue <= 40);
		};

		if (lenis) {
			const handleLenisScroll = ({ scroll }) => updateVisibility(scroll);
			lenis.on("scroll", handleLenisScroll);
			updateVisibility(lenis.scroll || 0);
			return () => lenis.off("scroll", handleLenisScroll);
		}

		const handleWindowScroll = () =>
			updateVisibility(window.scrollY || window.pageYOffset || 0);

		window.addEventListener("scroll", handleWindowScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleWindowScroll);
	}, [lenis]);

	const handleRegisterClick = () => {
		// Use your transition hook
		navigateWithTransition("/register");
		// OR if standard: router.push("/register");
	};

	const hiddenClass = isAtTop ? "" : "nav-scroll-hidden";

	return (
		<nav>
			<div className={`nav-logo ${hiddenClass}`}>
				<a href="/">
					<img src="/LOGO PNG-04.png" alt="ArtIcon Logo" />
				</a>
			</div>

			<div
				className={`nav-cta-wrapper ${hiddenClass}`}
				onClick={handleRegisterClick}
			>
				<p className="cta-label">REGISTER NOW</p>
			</div>
		</nav>
	);
};

export default Menu;
