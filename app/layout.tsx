import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import siteData from "@/data/site.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteData.name} | ${siteData.title}`,
    template: `%s | ${siteData.name}`,
  },
  description: siteData.bio.long,
  keywords: [
    "Rogit S",
    "Portfolio",
    "Data Engineering",
    "Machine Learning",
    "AI",
    "Computer Science",
    "SRM",
  ],
  authors: [{ name: siteData.name }],
  creator: siteData.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteData.name,
    title: `${siteData.name} | ${siteData.title}`,
    description: siteData.bio.short,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteData.name} | ${siteData.title}`,
    description: siteData.bio.short,
  },
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col gradient-bg`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
