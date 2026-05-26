import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Reptisdag",
  description: "Ta reda på vilken dag som passar alla",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className={geist.variable}>
      <body style={{ fontFamily: "var(--font-geist), Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
