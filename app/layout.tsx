import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css" // Import des styles globaux (Tailwind)
import { Navbar } from "@/components/layout/navbar"
import { ClerkProvider } from "@clerk/nextjs"
import { frFR } from "@clerk/localizations"

// 2. Configuration de la police
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestion Budget",
  description: "Mieux gerer son budget",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body className={inter.className}>
          {/* Navbar visible partout */}
          <Navbar /> 
          
          <div className="pb-20 md:pb-0 md:pt-4">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
