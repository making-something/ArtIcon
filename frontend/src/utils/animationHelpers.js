/**
 * Animation Helper Utilities
 * Common functions used across animated components
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_CONFIG } from "@/constants/animationPriorities";

/**
 * Check if current viewport is mobile
 * @returns {boolean}
 */
export const isMobileViewport = () => {
	return window.innerWidth <= ANIMATION_CONFIG.MOBILE_BREAKPOINT;
};

/**
 * Check if current viewport is tablet
 * @returns {boolean}
 */
export const isTabletViewport = () => {
	return (
		window.innerWidth > ANIMATION_CONFIG.MOBILE_BREAKPOINT &&
		window.innerWidth <= ANIMATION_CONFIG.TABLET_BREAKPOINT
	);
};

/**
 * Safely get element(s) from DOM
 * @param {string} selector - CSS selector
 * @param {boolean} multiple - Whether to get all matching elements
 * @returns {Element|NodeList|null}
 */
export const getElement = (selector, multiple = false) => {
	if (multiple) {
		return document.querySelectorAll(selector);
	}
	return document.querySelector(selector);
};

/**
 * Create a ScrollTrigger with common defaults
 * @param {Object} config - ScrollTrigger configuration
 * @returns {ScrollTrigger}
 */
export const createScrollTrigger = (config) => {
	return ScrollTrigger.create({
		scrub: ANIMATION_CONFIG.DEFAULT_SCRUB,
		...config,
	});
};

/**
 * Clear all GSAP properties from element(s)
 * @param {Element|NodeList|Array} elements - Element(s) to clear
 */
export const clearGSAPProps = (elements) => {
	if (!elements) return;

	const elementArray = Array.isArray(elements)
		? elements
		: elements instanceof NodeList
		? Array.from(elements)
		: [elements];

	elementArray.forEach((element) => {
		if (element) {
			gsap.set(element, { clearProps: "all" });
		}
	});
};

/**
 * Kill all ScrollTrigger instances
 * @param {Array<ScrollTrigger>} instances - Array of ScrollTrigger instances
 */
export const killScrollTriggers = (instances) => {
	if (!instances || !Array.isArray(instances)) return;

	instances.forEach((instance) => {
		if (instance && typeof instance.kill === "function") {
			instance.kill();
		}
	});
};

/**
 * Smooth step interpolation function
 * @param {number} p - Progress value (0-1)
 * @returns {number} - Smoothed progress value
 */
export const smoothStep = (p) => {
	return p * p * (3 - 2 * p);
};

/**
 * Ease out cubic function
 * @param {number} t - Time value (0-1)
 * @returns {number} - Eased value
 */
export const easeOutCubic = (t) => {
	return 1 - Math.pow(1 - t, 3);
};

/**
 * Ease in out cubic function
 * @param {number} t - Time value (0-1)
 * @returns {number} - Eased value
 */
export const easeInOutCubic = (t) => {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export const clamp = (value, min, max) => {
	return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} progress - Progress (0-1)
 * @returns {number} - Interpolated value
 */
export const lerp = (start, end, progress) => {
	return start + (end - start) * progress;
};

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} - Mapped value
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Wait for element to exist in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Maximum wait time in ms
 * @returns {Promise<Element>}
 */
export const waitForElement = (selector, timeout = 5000) => {
	return new Promise((resolve, reject) => {
		const element = document.querySelector(selector);
		if (element) {
			resolve(element);
			return;
		}

		const observer = new MutationObserver(() => {
			const element = document.querySelector(selector);
			if (element) {
				observer.disconnect();
				resolve(element);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		setTimeout(() => {
			observer.disconnect();
			reject(new Error(`Element ${selector} not found within ${timeout}ms`));
		}, timeout);
	});
};

