import { Metadata } from "next";
import React from "react";
import { Toaster } from "sonner";
import localFont from "next/font/local";

import { auth } from "@/app/(auth)/auth";
import { Footer } from "@/components/custom/footer";
import { Navbar } from "@/components/custom/navbar";
import { SessionProvider } from "@/components/custom/session-provider";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { AiProvider } from "@/lib/ai-provider";
import { VisitorTracker } from "@/components/custom/visitor-tracker";
// import { AcceptedTasksProvider } from "@/lib/context/accepted-tasks-context";

import "./globals.css";

import { PLATFORM_NAME } from "@/app/config/constants";

const geistSans = localFont({
  src: "../public/fonts/geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gemini.vercel.ai"),
  title: PLATFORM_NAME,
  description: `Next.js chatbot template using the AI SDK and Gemini, powered by ${PLATFORM_NAME}.`,
  icons: {
    icon: "/images/logo.svg",
    shortcut: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head></head>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <AcceptedTasksProvider> */}
            <AiProvider>
              <VisitorTracker />
              <Toaster position="top-center" />
              {/* We use Header in page.tsx usually, but if Navbar is global: */}
              {session?.user && <Navbar />}
              {children}
              <Footer />
            </AiProvider>
            {/* </AcceptedTasksProvider> */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
