import type { Metadata } from "next";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexProviderWithClerk";

import { ReduxProvider } from "./providers/ReduxProvider";
import ThemeBackground from "./components/ThemeBackground";

export const metadata: Metadata = {
  title: "Orbit Chat",
  description: "AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <div className="relative w-screen min-h-screen">
          <ReduxProvider>
            <ThemeBackground />
            <ClerkProvider>
              <ConvexClientProvider>
                <div className="relative z-10">
                  {children}
                </div>
              </ConvexClientProvider>
            </ClerkProvider>
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
}
