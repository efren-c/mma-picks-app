import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://picks-mma.com"),
  title: "MMA Picks",
  description: "Predict fight outcomes and compete.",
  icons: {
    icon: '/icon.png',
  },
};

import { Providers } from "@/components/Providers";
import { AutoLogout } from "@/components/AutoLogout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AutoLogout />
          <Navbar />
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
