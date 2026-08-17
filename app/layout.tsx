import type { Metadata } from "next";

import "./globals.css";
import "./typography.css";
import "./custom.css";
import "@bprogress/core/css";

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-sans",
  display: "swap",
});


import { ThemeProvider } from "@/components/provider/theme-provider";

import ProgressBarProvider from "@/components/navigation-progress";
import ToasterWrapper from "@/components/ToasterWrapper";
import { SidebarProvider } from "@/components/sidebarContext";
import QueryProviders from "@/components/provider/query-provider";
import "vercel-toast/css";

export const metadata: Metadata = {
  title: "Sabnam",
  manifest: "/manifest.json",
  description: "Sabnam - Your Learning Companion",
  icons: {
    icon: [{ url: "/meta/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
    >
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="light"
        >
          <SidebarProvider>
            <ProgressBarProvider>
              <QueryProviders>

                {children}
              </QueryProviders>

            </ProgressBarProvider>
            <ToasterWrapper />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
