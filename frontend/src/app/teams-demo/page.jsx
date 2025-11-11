"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ReactLenis } from "lenis/react";
import AnimatedTeams from "@/components/AnimatedTeams/AnimatedTeams";

export default function TeamsDemoPage() {
	const lenisRef = useRef();

	useEffect(() => {
		function update(time) {
			lenisRef.current?.lenis?.raf(time * 1000);
		}

		gsap.ticker.add(update);

		return () => gsap.ticker.remove(update);
	}, []);

	return (
		<>
			<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
			<AnimatedTeams showHero={true} />
		</>
	);
}
