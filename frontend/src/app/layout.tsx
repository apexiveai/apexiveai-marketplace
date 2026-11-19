
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApexiveAI Marketplace | One Marketplace. Every Industry.",
  description:
    "Discover businesses, products, services and opportunities across multiple industries with ApexiveAI Marketplace.",
  applicationName: "ApexiveAI Marketplace",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
