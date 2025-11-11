import "./globals.css";
import ClientLayout from "@/client-layout";
import { ViewTransitions } from "next-view-transitions";

export const metadata = {
	title: "ArtIcon",
	description: "finding ART-ICONs",
	icons: {
		icon: "/site-logo.png",
		shortcut: "/site-logo.png",
		apple: "/site-logo.png",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<ViewTransitions>
					<ClientLayout>{children}</ClientLayout>
				</ViewTransitions>
			</body>
		</html>
	);
}
