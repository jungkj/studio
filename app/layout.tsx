import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToasterContextProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import "@/globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Andy Jung',
  description: 'Step back into the 1990s with this nostalgic recreation of the classic Mac OS desktop experience',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <ToasterContextProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster />
          </ToasterContextProvider>
        </Providers>
      </body>
    </html>
  )
}