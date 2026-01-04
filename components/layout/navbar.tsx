"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PieChart, Wallet, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
// Supposant que tu utilises Clerk (sinon retirer cette partie)
import { UserButton, useUser } from "@clerk/nextjs"

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  const links = [
    { href: "/", label: "Journal", icon: Home },
    { href: "/stats", label: "Analyses", icon: PieChart },
    // { href: "/budget", label: "Budget", icon: Wallet }, // Pour la V2
  ]

  return (
    <>
      {/* --- DESKTOP NAVBAR (Top) --- */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Wallet className="h-6 w-6" />
          <span>BudgetApp</span>
        </div>
        
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
           {isSignedIn ? (
             <UserButton afterSignOutUrl="/sign-in" />
           ) : (
             <Link href="/sign-in" className="text-sm font-medium">Connexion</Link>
           )}
        </div>
      </nav>

      {/* --- MOBILE NAVBAR (Bottom) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{link.label}</span>
              </Link>
            )
          })}
          
          {/* Bouton User Mobile */}
          <div className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground">
             {isSignedIn ? (
                <UserButton />
             ) : (
                <Link href="/sign-in"><User className="h-5 w-5" /></Link>
             )}
          </div>
        </div>
      </nav>
      
      {/* Spacer pour éviter que le contenu soit caché par la navbar mobile */}
      <div className="h-16 md:hidden" />
    </>
  )
}