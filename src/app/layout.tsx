import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { ConditionalChat } from "@/components/chat/conditional-chat";
import { getSession } from "@/actions/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Special Resident Retiree's Visa",
  description: "Your trusted partner for visa and immigration services",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        inter.variable,
        manrope.variable,
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="antialiased">
        {children}
        <Toaster />
        <ConditionalChat />
      </body>
    </html>
  );
}
