import "./globals.css";
import "@/components/editor/editor.css";

import {
  Montserrat,
  Playfair_Display,
  Source_Code_Pro,
} from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider } from "@/auth/components/ConvexProvider";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AskSync - Monorepo Demo",
  description: "Next.js SSG + Convex + Shared Package Demo",
};

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} ${sourceCodePro.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexProvider>{children}</ConvexProvider>
        </ClerkProvider>
        <Toaster />
        <ConfirmDialog />
      </body>
    </html>
  );
}
