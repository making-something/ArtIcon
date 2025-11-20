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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JunoLanding from "@/components/JunoLanding/JunoLanding";
import Timeline from "@/components/Timeline/Timeline";
import EventOverview from "@/components/EventOverview/EventOverview";
import JuriesCards from "@/components/JuriesCards/JuriesCards";
import Clients from "@/components/Clients/Clients";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated()) {
			router.push("/dashboard");
		}

		const onLoad = () => {
			// Initial refresh to calculate pinned heights correctly
			setTimeout(() => {
				ScrollTrigger.refresh(true);
			}, 100);
		};

		const onVisibilityChange = () => {
			if (!document.hidden) {
				ScrollTrigger.refresh(true);
			}
		};

		window.addEventListener("load", onLoad);
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			window.removeEventListener("load", onLoad);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	// Helper style for sections to ensure they stack cleanly
	const sectionStyle = {
		position: "relative",
		backgroundColor: "var(--base-100)",
	};

	return (
		<>
			<Preloader />

			{/* Main wrapper ensures background continuity */}
			<main
				style={{
					width: "100%",
					overflowX: "hidden",
					backgroundColor: "var(--base-100)",
				}}
			>
				<div style={{ ...sectionStyle, zIndex: 1 }}>
					<JunoLanding />
				</div>

				<div style={{ ...sectionStyle, zIndex: 2 }}>
					<EventOverview />
				</div>

				<div style={{ ...sectionStyle, zIndex: 3 }}>
					<Timeline />
				</div>

				<div style={{ ...sectionStyle, zIndex: 4 }}>
					<ClientReviews />
				</div>

				<div style={{ ...sectionStyle, zIndex: 5 }}>
					<Spotlight />
				</div>

				<div style={{ ...sectionStyle, zIndex: 6 }}>
					<JuriesCards />
				</div>

				<div style={{ ...sectionStyle, zIndex: 7 }}>
					<Clients />
				</div>

				<div style={{ ...sectionStyle, zIndex: 8 }}>
					<CTACard />
				</div>

				<div style={{ ...sectionStyle, zIndex: 9 }}>
					<Footer />
				</div>
			</main>
		</>
	);
};

export default Page;
