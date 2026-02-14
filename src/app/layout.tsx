import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	weight: ["400","500","600","700","800"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PT AMP",
	description: "Website for PT AMP",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
		return (
			<html lang="id" suppressHydrationWarning>
			<body className={`${plusJakarta.variable} ${geistMono.variable}`} suppressHydrationWarning>
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					{children}
				</AppRouterCacheProvider>
			</body>
			</html>
	);
}
