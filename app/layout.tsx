import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileNav from "./mobile-nav";

export const metadata: Metadata = {
  title: "Capital Auto Concierge",
  description: "Explore premium vehicle services and discuss your preliminary estimate with a concierge.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/capital-auto-concierge-icon.png",
    shortcut: "/capital-auto-concierge-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
