import type { Metadata } from "next";

import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { ThemeProvider } from "@/components/provider/theme-provider";
import SessionWrapper from "@/components/sessionProvider";
import ProgressBarProvider from "@/components/navigation-progress";
import AuthRedirect from "@/components/auth-redirect";
import SessionSync from "@/components/session-sync";
import AuthStatus from "@/utils/auth-status";
import ToasterWrapper from "@/components/ToasterWrapper";
import { SidebarProvider } from "@/components/sidebarContext";

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
    <SessionWrapper>
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
            defaultTheme="light"
          >
            <SidebarProvider>
              <SessionSync />
              <AuthStatus />
              <ProgressBarProvider>{children}</ProgressBarProvider>
              <ToasterWrapper />
              <AuthRedirect />
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
