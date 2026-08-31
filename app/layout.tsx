import type { Metadata } from "next";

import "./custom.css";
import "@bprogress/core/css";

import { Space_Grotesk, Outfit, Dancing_Script } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-dancing-script",
  display: "swap",
});

import { ThemeProvider } from "@/components/provider/theme-provider";
import ProgressBarProvider from "@/components/navigation-progress";
import { SidebarProvider } from "@/components/sidebarContext";
import QueryProviders from "@/components/provider/query-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

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
      className={cn(
        "font-sans",
        spaceGrotesk.variable,
        outfitHeading.variable,
        dancingScript.variable,
      )}
      lang="en"
    >
      <body
        className={`${spaceGrotesk.variable} ${dancingScript.variable} font-sans antialiased bg-background text-foreground`}
      >
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
                <Toaster />
              </QueryProviders>
            </ProgressBarProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
