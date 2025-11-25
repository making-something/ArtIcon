/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,

	// Optimize GSAP for production builds
	webpack: (config, { isServer }) => {
		// Don't bundle GSAP on server-side
		if (isServer) {
			config.externals = [...(config.externals || []), "gsap"];
		}

		// Ensure GSAP plugins are properly bundled
		config.resolve.alias = {
			...config.resolve.alias,
			"gsap/ScrollTrigger": "gsap/dist/ScrollTrigger",
			"gsap/CustomEase": "gsap/dist/CustomEase",
		};

		return config;
	},

	// Disable static optimization for pages with animations
	// This ensures proper hydration
	experimental: {
		optimizePackageImports: ["gsap"],
	},
};

export default nextConfig;
