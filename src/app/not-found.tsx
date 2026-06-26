import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 animate-fade-up">
      <p className="text-8xl font-bold text-border-active select-none">404</p>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-primary">Page not found</h1>
        <p className="text-sm text-on-surface-variant">
          The ticker or page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-opacity hover:opacity-80"
      >
        Back to Market Overview
      </Link>
    </div>
  )
}
