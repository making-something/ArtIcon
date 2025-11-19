/**
 * Scramble text animation utility
 * Based on negative-films scramble effect
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

/**
 * Scrambles a single character element with random characters
 * @param {HTMLElement} char - The character element to scramble
 * @param {Object} options - Animation options
 */
function scrambleChar(char, options = {}) {
	const {
		duration = 0.3,
		charDelay = 30,
		maxIterations = 3,
	} = options;

	// Store original text
	if (!char.dataset.originalText) {
		char.dataset.originalText = char.textContent;
	}
	const originalText = char.dataset.originalText;
	let iterations = 0;

	// Clear any existing intervals
	if (char.scrambleInterval) {
		clearInterval(char.scrambleInterval);
	}
	if (char.scrambleTimeout) {
		clearTimeout(char.scrambleTimeout);
	}

	const interval = setInterval(() => {
		// Preserve spaces
		if (originalText === " ") {
			char.textContent = " ";
		} else {
			char.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
		}
		iterations++;

		if (iterations >= maxIterations) {
			clearInterval(interval);
			char.scrambleInterval = null;
			char.textContent = originalText;
		}
	}, charDelay);

	char.scrambleInterval = interval;

	const timeout = setTimeout(() => {
		clearInterval(interval);
		char.scrambleInterval = null;
		char.scrambleTimeout = null;
		char.textContent = originalText;
	}, duration * 1000);

	char.scrambleTimeout = timeout;
}

/**
 * Scrambles text with stagger effect
 * @param {HTMLElement} element - The element containing text to scramble
 * @param {Object} options - Animation options
 */
export function scrambleText(element, options = {}) {
	if (!element || !element.textContent.trim()) return;

	const {
		duration = 0.3,
		charDelay = 30,
		stagger = 20,
		maxIterations = 3,
	} = options;

	// Split text into individual characters
	const text = element.textContent;
	const chars = text.split("");
	
	// Clear element and create span for each character
	element.innerHTML = "";
	const charElements = chars.map((char) => {
		const span = document.createElement("span");
		span.textContent = char;
		span.style.display = "inline-block";
		element.appendChild(span);
		return span;
	});

	// Scramble each character with stagger
	charElements.forEach((charEl, index) => {
		if (charEl.staggerTimeout) {
			clearTimeout(charEl.staggerTimeout);
		}

		const staggerTimeout = setTimeout(() => {
			scrambleChar(charEl, { duration, charDelay, maxIterations });
			charEl.staggerTimeout = null;
		}, index * stagger);

		charEl.staggerTimeout = staggerTimeout;
	});
}

/**
 * Cleanup function to clear all scramble intervals and timeouts
 * @param {HTMLElement} element - The element to cleanup
 */
export function cleanupScramble(element) {
	if (!element) return;

	const chars = element.querySelectorAll("span");
	chars.forEach((char) => {
		if (char.scrambleInterval) {
			clearInterval(char.scrambleInterval);
		}
		if (char.scrambleTimeout) {
			clearTimeout(char.scrambleTimeout);
		}
		if (char.staggerTimeout) {
			clearTimeout(char.staggerTimeout);
		}
	});
}

