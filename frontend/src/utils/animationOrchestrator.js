/**
 * Animation Orchestrator
 * Centralized management for all GSAP ScrollTrigger animations
 * This ensures proper initialization order and prevents conflicts
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_CONFIG } from "@/constants/animationPriorities";

gsap.registerPlugin(ScrollTrigger);

class AnimationOrchestrator {
	constructor() {
		this.components = new Map();
		this.scrollTriggerInstances = [];
		this.isInitialized = false;
		this.isMobile = false;
		this.config = ANIMATION_CONFIG;
	}

	/**
	 * Register a component's animation initialization function
	 * @param {string} componentName - Unique name for the component
	 * @param {Function} initFunction - Function that initializes animations and returns cleanup
	 * @param {number} priority - Lower numbers initialize first (default: 100)
	 */
	register(componentName, initFunction, priority = 100) {
		this.components.set(componentName, {
			init: initFunction,
			priority,
			cleanup: null,
		});
	}

	/**
	 * Unregister a component
	 * @param {string} componentName - Component to unregister
	 */
	unregister(componentName) {
		const component = this.components.get(componentName);
		if (component && component.cleanup) {
			component.cleanup();
		}
		this.components.delete(componentName);
	}

	/**
	 * Initialize all registered components in priority order
	 */
	initializeAll() {
		if (this.isInitialized) {
			this.cleanup();
		}

		// Check if mobile
		this.isMobile = window.innerWidth <= 1000;

		// Sort components by priority
		const sortedComponents = Array.from(this.components.entries()).sort(
			(a, b) => a[1].priority - b[1].priority
		);

		// Initialize each component in order
		sortedComponents.forEach(([name, component]) => {
			try {
				const cleanup = component.init(this.isMobile);
				component.cleanup = cleanup;
			} catch (error) {
				console.error(`Error initializing ${name}:`, error);
			}
		});

		// Refresh ScrollTrigger after all components are initialized
		requestAnimationFrame(() => {
			ScrollTrigger.refresh(true);
		});

		this.isInitialized = true;
	}

	/**
	 * Cleanup all animations
	 */
	cleanup() {
		// Kill all ScrollTrigger instances
		this.scrollTriggerInstances.forEach((instance) => {
			if (instance) instance.kill();
		});
		this.scrollTriggerInstances = [];

		// Run component-specific cleanup
		this.components.forEach((component) => {
			if (component.cleanup) {
				component.cleanup();
				component.cleanup = null;
			}
		});

		this.isInitialized = false;
	}

	/**
	 * Reinitialize all animations (useful for resize)
	 */
	reinitialize() {
		this.cleanup();
		this.initializeAll();
	}

	/**
	 * Add a ScrollTrigger instance to be tracked
	 * @param {ScrollTrigger} instance - ScrollTrigger instance to track
	 */
	trackScrollTrigger(instance) {
		this.scrollTriggerInstances.push(instance);
	}

	/**
	 * Get mobile state
	 */
	getIsMobile() {
		return this.isMobile;
	}
}

// Create singleton instance
const orchestrator = new AnimationOrchestrator();

export default orchestrator;
