import { TooltipProvider } from "@/components/ui/tooltip";
import { ToasterContextProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import "../src/globals.css";

export const metadata = {
  title: 'Dyad Apps - Azure Mongoose Wiggle',
  description: 'Retro Mac OS-style desktop environment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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