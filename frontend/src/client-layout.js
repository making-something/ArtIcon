"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import Menu from "./components/Menu/Menu";

export default function ClientLayout({ children }) {
	const pageRef = useRef();
	const pathname = usePathname();

	const [isMobile, setIsMobile] = useState(false);

	// Routes where Menu should be hidden
	const hideMenuRoutes = ["/registration"];

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 1000);
		};

		checkMobile();

		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const scrollSettings = isMobile
		? {
				duration: 0.8,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				direction: "vertical",
				gestureDirection: "vertical",
				smooth: true,
				smoothTouch: true,
				touchMultiplier: 1.5,
				infinite: false,
				lerp: 0.09,
				wheelMultiplier: 1,
				orientation: "vertical",
				smoothWheel: true,
				syncTouch: true,
		  }
		: {
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				direction: "vertical",
				gestureDirection: "vertical",
				smooth: true,
				smoothTouch: false,
				touchMultiplier: 2,
				infinite: false,
				lerp: 0.1,
				wheelMultiplier: 1,
				orientation: "vertical",
				smoothWheel: true,
				syncTouch: true,
		  };

	const shouldHideMenu = hideMenuRoutes.includes(pathname);

	return (
		<ReactLenis root options={scrollSettings}>
			{!shouldHideMenu && <Menu pageRef={pageRef} />}

			<div className="page" ref={pageRef}>
				{children}
			</div>
		</ReactLenis>
	);
}
