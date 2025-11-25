"use client";
import "./home.css";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import Spotlight from "@/components/Spotlight/Spotlight";
import CTACard from "@/components/CTACard/CTACard";
import Footer from "@/components/Footer/Footer";
import Preloader from "@/components/Preloader/Preloader";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/services/api";
import { initGSAP, ScrollTrigger } from "@/utils/gsapConfig";
import JunoLanding from "@/components/JunoLanding/JunoLanding";
import Timeline from "@/components/Timeline/Timeline";
import EventOverview from "@/components/EventOverview/EventOverview";
import JuriesCards from "@/components/JuriesCards/JuriesCards";
import Clients from "@/components/Clients/Clients";
import About from "@/components/About/About";
import WorkGallery from "@/components/WorkGallery/WorkGallery";
import FAQ from "@/components/FAQ/FAQ";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import Overview from "@/components/overview/Overview";

// Initialize GSAP plugins before any component uses them
if (typeof window !== "undefined") {
	initGSAP();
}

const Page = () => {
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated()) {
			router.push("/dashboard");
		}

		// Production-safe ScrollTrigger refresh strategy
		const refreshScrollTrigger = () => {
			// Use requestAnimationFrame to ensure DOM is painted
			requestAnimationFrame(() => {
				// Increased delay for production builds (500ms instead of 100ms)
				setTimeout(() => {
					ScrollTrigger.refresh(true);
				}, 500);
			});
		};

		// Multiple checkpoints for better reliability
		const onLoad = () => {
			refreshScrollTrigger();
		};

		const onDOMContentLoaded = () => {
			refreshScrollTrigger();
		};

		const onVisibilityChange = () => {
			if (!document.hidden) {
				refreshScrollTrigger();
			}
		};

		// Refresh when fonts are loaded (critical for text animations)
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				refreshScrollTrigger();
			});
		}

		// Add event listeners
		window.addEventListener("load", onLoad);
		document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
		document.addEventListener("visibilitychange", onVisibilityChange);

		// Initial refresh if DOM is already loaded
		if (document.readyState === "complete") {
			refreshScrollTrigger();
		}

		return () => {
			window.removeEventListener("load", onLoad);
			document.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	// Helper style for sections to ensure they stack cleanly
	const sectionStyle = {
		position: "relative",
	};

	return (
		<>
			<Preloader />

			{/* Main wrapper ensures background continuity */}
			<main
				style={{
					width: "100%",
					overflowX: "hidden",
				}}
			>
				<div style={{ ...sectionStyle, zIndex: 1 }}>
					<JunoLanding />
				</div>

				<div style={{ ...sectionStyle, zIndex: 2 }}>
					{/* <EventOverview /> */}
					<About />
				</div>

				<div style={{ ...sectionStyle, zIndex: 3 }}>
					<Timeline />
				</div>

				<div style={{ ...sectionStyle, zIndex: 4 }}>
					<Overview />
				</div>

				<div style={{ ...sectionStyle, zIndex: 5 }}>
					<WorkGallery />
				</div>

				<div style={{ ...sectionStyle, zIndex: 6 }}>
					<Spotlight />
				</div>

				<div style={{ ...sectionStyle, zIndex: 7 }}>
					<JuriesCards />
				</div>

				<div style={{ ...sectionStyle, zIndex: 8 }}>
					<Clients />
				</div>

				<div style={{ ...sectionStyle, zIndex: 9 }}>
					<CTACard />
				</div>

				<div style={{ ...sectionStyle, zIndex: 10 }}>
					<FAQ />
				</div>

				<div style={{ ...sectionStyle, zIndex: 11 }}>
					<Footer />
				</div>
			</main>
			<ScrollToTop />
		</>
	);
};

export default Page;
