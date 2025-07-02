import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import SessionWrapper from "@/components/sessionProvider";
import ToasterWrapper from "@/components/ToasterWrapper";
import ProgressBarProvider from "@/components/navigation-progress";
import AuthRedirect from "@/components/auth-redirect";
import SessionSync from "@/components/session-sync";
import AuthStatus from "@/utils/auth-status";

export const metadata: Metadata = {
  title: "Sabnam",
  manifest: "/manifest.json",
  description: "Sabnam - Your Learning Companion",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ]
  }
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html suppressHydrationWarning lang="en">
        <body className={`${GeistSans.className} ${GeistMono.variable} antialiased bg-background text-foreground`}>
          <ThemeProvider
            disableTransitionOnChange
            enableSystem
            attribute="class"
            defaultTheme="light"
          >
            <SessionSync />
            <AuthStatus />
            <ProgressBarProvider>{children}</ProgressBarProvider>
            <ToasterWrapper />
            <AuthRedirect />
          </ThemeProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
