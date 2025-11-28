"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Menu from "./components/Menu/Menu";

export default function ClientLayout({ children }) {
	const pageRef = useRef();
	const pathname = usePathname();

	const [isMobile, setIsMobile] = useState(false);

	// Routes where Menu should be hidden
	const hideMenuRoutes = ["/registration", "/dashboard", "/admin"];

	const shouldHideMenu =
		hideMenuRoutes.includes(pathname) ||
		pathname.startsWith("/admin") ||
		pathname.startsWith("/dashboard");

	return (
		<ReactLenis
			root
			options={{
				// Mobile: Native scroll (duration 0) for performance and feel

				// Desktop: Smooth scroll (duration 1.2) for effect

				duration: isMobile ? 0 : 1.2,

				smoothTouch: false, // CRITICAL: Native touch handling

				touchMultiplier: 2,

				infinite: false,

				lerp: 0.1,

				wheelMultiplier: 1,

				orientation: "vertical",

				smoothWheel: true,

				syncTouch: false,
			}}
		>
			<LenisGSAPSync />

			{!shouldHideMenu && <Menu pageRef={pageRef} />}

			<div className="page" ref={pageRef}>
				{children}
			</div>
		</ReactLenis>
	);
}

// Separate component to use the useLenis hook within the context

function LenisGSAPSync() {
	const lenis = useLenis();

	useEffect(() => {
		if (!lenis) return;

		// Register ScrollTrigger if not already

		gsap.registerPlugin(ScrollTrigger);

		// Update ScrollTrigger on Lenis scroll

		lenis.on("scroll", ScrollTrigger.update);

		// Add Lenis RAF to GSAP ticker to sync animations

		// Note: ReactLenis handles the RAF loop, we just need GSAP to be aware

		const tickerFn = (time) => {
			// This keeps GSAP in sync with Lenis's internal time

			lenis.raf(time * 1000);
		};

		gsap.ticker.add(tickerFn);

		// Disable lag smoothing to prevent jumps during heavy processing

		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(tickerFn);

			lenis.off("scroll", ScrollTrigger.update);
		};
	}, [lenis]);

	return null;
}
