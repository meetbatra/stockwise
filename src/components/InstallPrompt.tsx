'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (isStandalone || !installEvent) return null

  const install = async () => {
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  return (
    <button
      type="button"
      onClick={install}
      aria-label="Install Stockwise"
      title="Install Stockwise"
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-border-active hover:text-primary"
    >
      <Download className="h-4 w-4" />
    </button>
  )
}
