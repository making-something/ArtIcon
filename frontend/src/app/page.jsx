"use client";
import "./home.css";
import Button from "@/components/Button/Button";
import Showreel from "@/components/Showreel/Showreel";
import FeaturedWork from "@/components/FeaturedWork/FeaturedWork";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import Spotlight from "@/components/Spotlight/Spotlight";
import CTACard from "@/components/CTACard/CTACard";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";
import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JunoLanding from "@/components/JunoLanding/JunoLanding";
import AnimatedTeams from "@/components/AnimatedTeams/AnimatedTeams";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
	useEffect(() => {
		const rafId = requestAnimationFrame(() => {
			ScrollTrigger.refresh(true);
		});

		const onLoad = () => ScrollTrigger.refresh(true);
		window.addEventListener("load", onLoad, { passive: true });

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("load", onLoad);
		};
	}, []);

	return (
		<>
			<Preloader />
			<JunoLanding />

			{/* <section className="hero">
				<div className="container">
					<div className="hero-content-main">
						<div className="hero-header">
							<Copy animateOnScroll={false} delay={isInitialLoad ? 5.75 : 0.75}>
								<h1>Crafting Digital Worlds with a Bit of Mischief</h1>
							</Copy>
						</div>

						<div className="hero-footer-outer">
							<Copy animateOnScroll={false} delay={isInitialLoad ? 6.35 : 1.65}>
								<p className="sm">&copy; Codegrid Dept.</p>
								<p className="sm">( Workroom 101 )</p>
							</Copy>
						</div>

						<div className="hero-footer">
							<Copy animateOnScroll={false} delay={isInitialLoad ? 6.05 : 1.15}>
								<p className="lg">
									We build visuals, stories, and systems for people who like
									their creativity a little unpredictable.
								</p>
							</Copy>

							<Button delay={isInitialLoad ? 6.35 : 1.55} href="/studio">
								Visit the Studio
							</Button>
						</div>
					</div>
				</div>
			</section>

			<Showreel />

			<section className="featured-work">
				<div className="container">
					<div className="featured-work-header-content">
						<div className="featured-work-header">
							<Copy animateOnScroll={true} delay={0.25}>
								<h1>Featured Work</h1>
							</Copy>
						</div>

						<div className="arrow">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="100%"
								viewBox="0 0 32 32"
								fill="none"
								className="icon"
							>
								<path
									d="M16 26.6665L16 5.33317"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
								<path
									d="M22.6667 19.9999L16 26.6665L9.33337 19.9998"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
							</svg>
						</div>

						<div className="featured-work-header-copy">
							<Copy animateOnScroll={true} delay={0.25}>
								<p className="lg">
									From motion to concept, pieces born from quiet sketches, late
									nights, and just the right amount of chaos.
								</p>
							</Copy>
						</div>
					</div>

					<FeaturedWork />
				</div>
			</section>

			<section className="client-reviews-header-container">
				<div className="container">
					<div className="client-reviews-header-content">
						<div className="client-reviews-header">
							<Copy animateOnScroll={true} delay={0.25}>
								<h1>People Approved</h1>
							</Copy>
						</div>

						<div className="arrow">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="100%"
								viewBox="0 0 32 32"
								fill="none"
								className="icon"
							>
								<path
									d="M16 26.6665L16 5.33317"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
								<path
									d="M22.6667 19.9999L16 26.6665L9.33337 19.9998"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
							</svg>
						</div>

						<div className="client-reviews-header-copy">
							<Copy animateOnScroll={true} delay={0.25}>
								<p className="lg">
									Unfiltered thoughts from the people who survived our creative
									process. Or at least that’s what they told us.
								</p>
							</Copy>
						</div>
					</div>
				</div>
			</section> */}

			<ClientReviews />

			<Spotlight />

			<AnimatedTeams showHero={true} />

			<CTACard />

			<Footer />
		</>
	);
};

export default Page;
