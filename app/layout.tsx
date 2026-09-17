import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import MobileNav from "./mobile-nav";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-display" });
const body = Jost({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Capital Auto Concierge",
  description: "Your car, in good hands. Paint protection, ceramic coating, tint, detailing, wraps, wheel repair and transport — coordinated by one concierge across suburban DC, Maryland and Virginia.",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
