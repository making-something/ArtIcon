import "./globals.css";
import ClientLayout from "@/client-layout";
import { ViewTransitions } from "next-view-transitions";

export const metadata = {
	title: "ArtIcon",
	description: "",
	icons: {
		icon: "/favicon_articon.svg",
		shortcut: "/favicon_articon.svg",
		apple: "/favicon_articon.svg",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				{/* Google Fonts for JunoLanding component */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap"
					rel="stylesheet"
				/>

				{/* Preload only critical fonts used immediately */}
				<link
					rel="preload"
					href="/fonts/big-shoulders-display/BigShouldersDisplay.ttf"
					as="font"
					type="font/ttf"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/neue-montral/PPNeueMontreal-Regular.otf"
					as="font"
					type="font/otf"
					crossOrigin="anonymous"
				/>
			</head>
			<body>
				<ViewTransitions>
					<ClientLayout>{children}</ClientLayout>
				</ViewTransitions>
			</body>
		</html>
	);
}
