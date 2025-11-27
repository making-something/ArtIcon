/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,

	// Add cache headers for static assets
	async headers() {
		return [
			{
				source: "/fonts/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

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
