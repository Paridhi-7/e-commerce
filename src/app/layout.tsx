import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toasts } from "@/components/toasts";
import { PageTransition } from "@/components/page-transition";
import { Shell } from "@/components/shell";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KARTIFY — A curated marketplace of independent makers",
    template: "%s · KARTIFY",
  },
  description:
    "KARTIFY is a multi-vendor marketplace where independent designers sell considered goods — one cart, many storefronts, one checkout.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Shell>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </Shell>
        <Toasts />
      </body>
    </html>
  );
}
