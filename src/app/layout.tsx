import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://picks-mma.com"),
  title: {
    template: "%s | MMA Picks",
    default: "MMA Picks"
  },
  description: "Predict fight outcomes and compete.",
  icons: {
    icon: '/icon.png',
  },
};

import { Providers } from "@/components/Providers";
import { AutoLogout } from "@/components/AutoLogout";
import { EventResultModal } from "@/components/EventResultModal";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <Providers>
          <AutoLogout />
          <Navbar />
          {children}
          <EventResultModal />
          <Toaster position="top-center" richColors />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
