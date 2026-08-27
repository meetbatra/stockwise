'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { InstallPrompt } from '@/components/InstallPrompt'

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-card/80 backdrop-blur-md border-b border-border-hairline">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Stockwise Logo" 
            width={28} 
            height={28} 
            className="rounded shadow-sm" 
          />
          <span className="font-headline-lg text-lg text-primary tracking-tight">
            Stockwise
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <InstallPrompt />
          <Avatar className="w-8 h-8 rounded-full border border-border cursor-pointer transition-transform hover:scale-105">
            <AvatarFallback className="bg-surface-card flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
