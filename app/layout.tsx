import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider";
import SessionWrapper from "@/components/sessionProvider";
import { inter } from "@/config/fonts";
import ToasterWrapper from "@/components/ToasterWrapper";
import ProgressBarProvider from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: "Sabnam",
  description: "Sabnam - Your Learning Companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html suppressHydrationWarning lang="en">
        <body className={`${inter.className} antialiased bg-background text-foreground`}>
          <ThemeProvider
            disableTransitionOnChange
            enableSystem
            attribute="class"
            defaultTheme="system"
          >
            <ProgressBarProvider>{children}</ProgressBarProvider>
            <ToasterWrapper />
          </ThemeProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
