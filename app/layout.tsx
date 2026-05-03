import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Performance Gym | Premium Fitness Experience",
  description:
    "Transform your body at Performance Gym. 1800m² premium fitness space with expert trainers, state-of-the-art equipment, and luxury spa facilities.",
  keywords: ["gym", "fitness", "personal training", "spa", "kickboxing", "Egypt"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Performance Gym | Premium Fitness Experience",
    description:
      "Transform your body at Performance Gym. Premium fitness space with expert trainers and luxury facilities.",
    type: "website",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "Performance Gym Logo" }],
  },
};

export const viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://soayokjfafifhmhjuavf.supabase.co" />
        <link rel="dns-prefetch" href="https://soayokjfafifhmhjuavf.supabase.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
