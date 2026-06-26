'use client'

import Link from 'next/link'
import { Bell, User } from 'lucide-react'

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-card/80 backdrop-blur-md border-b border-border-hairline">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-surface-card font-label-caps text-[10px] font-bold">SW</span>
          </div>
          <span className="font-headline-lg text-lg text-primary tracking-tight">
            Stockwise
          </span>
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#888888] hover:text-primary transition-colors rounded-full hover:bg-white/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 border-[1.5px] border-surface-card"></span>
          </button>
          
          <button className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center overflow-hidden border border-emerald-500/30">
            <User className="h-4 w-4 text-black" />
          </button>
        </div>
      </div>
    </header>
  )
}
