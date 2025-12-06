 import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina Journal",
  description: "Your AI-powered journaling companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}