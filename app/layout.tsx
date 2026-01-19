import type { Metadata } from "next";

import "./globals.css";
import "@bprogress/core/css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { ThemeProvider } from "@/components/provider/theme-provider";

import ProgressBarProvider from "@/components/navigation-progress";
import ToasterWrapper from "@/components/ToasterWrapper";
import { SidebarProvider } from "@/components/sidebarContext";
import QueryProviders from "@/components/provider/query-provider";

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
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
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
