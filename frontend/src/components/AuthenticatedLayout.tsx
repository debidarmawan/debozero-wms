'use client'

import { Navigation } from './Navigation'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  title?: string
  headerActions?: React.ReactNode
}

export function AuthenticatedLayout({ children, title, headerActions }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {headerActions && <div>{headerActions}</div>}
          </div>
        </header>
      )}
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
