"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import SplitType from "split-type";

// Flag to ensure plugins are only registered once
let pluginsRegistered = false;

/**
 * Initialize GSAP plugins with production-safe guards
 * Call this BEFORE any component uses GSAP
 */
export function initGSAP() {
	// Only run on client-side
	if (typeof window === "undefined") {
		return false;
	}

	// Only register once
	if (pluginsRegistered) {
		return true;
	}

	try {
		// Register all GSAP plugins
		gsap.registerPlugin(ScrollTrigger, CustomEase);

		// Configure ScrollTrigger defaults for better production performance
		ScrollTrigger.config({
			// Prevent layout shift during pin
			autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
			// Improve performance
			ignoreMobileResize: true,
		});

		// Set GSAP defaults
		gsap.defaults({
			ease: "power2.out",
			duration: 1,
		});

		pluginsRegistered = true;

		// Log success in development
		if (process.env.NODE_ENV === "development") {
			console.log("✅ GSAP plugins registered successfully");
		}

		return true;
	} catch (error) {
		console.error("❌ Failed to register GSAP plugins:", error);
		return false;
	}
}

/**
 * Safe ScrollTrigger refresh with proper timing
 * Use this instead of direct ScrollTrigger.refresh()
 */
export function safeRefreshScrollTrigger(force = true) {
	if (typeof window === "undefined") return;

	// Use requestAnimationFrame to ensure DOM is painted
	requestAnimationFrame(() => {
		setTimeout(() => {
			ScrollTrigger.refresh(force);
		}, 100);
	});
}

/**
 * Cleanup all ScrollTrigger instances
 * Call this on component unmount or route change
 */
export function cleanupScrollTrigger() {
	if (typeof window === "undefined") return;

	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/**
 * Create a production-safe animation wrapper
 * Ensures animations only run after DOM is ready
 */
export function safeAnimate(animationFn) {
	if (typeof window === "undefined") return;

	// Check if DOM is ready
	if (document.readyState === "complete") {
		// DOM is ready, run immediately
		requestAnimationFrame(animationFn);
	} else {
		// Wait for DOM to be ready
		window.addEventListener("load", () => {
			requestAnimationFrame(animationFn);
		});
	}
}

/**
 * Check if GSAP is ready to use
 */
export function isGSAPReady() {
	return pluginsRegistered && typeof window !== "undefined";
}

// Export GSAP and plugins for convenience
export { gsap, ScrollTrigger, CustomEase, SplitType };

