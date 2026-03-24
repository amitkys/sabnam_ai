"use client"

import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { ReactNode } from 'react'

interface AppShellProps {
  sidebar: ReactNode    // ← caller passes their own <Sidebar>...</Sidebar>
  header?: ReactNode    // ← caller passes custom header content
  footer?: ReactNode
  children: ReactNode   // ← page content (main)
}

export function AppShell({ sidebar, header, footer, children }: AppShellProps) {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        {sidebar}
        <AppShellContent header={header} footer={footer}>
          {children}
        </AppShellContent>
      </SidebarProvider>
    </div>
  )
}

function AppShellContent({
  header,
  footer,
  children,
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  const { open, isMobile } = useSidebar()
  const headerPaddingClass =
    open && !isMobile ? 'pl-0 pr-4 sm:pr-6' : 'px-4 sm:px-6'

  return (
    <div className='flex flex-1 flex-col'>
      <header
        className={`bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b py-2 ${headerPaddingClass}`}
      >
        <SidebarTrigger className='[&_svg]:!size-5' />
        {header}
      </header>
      <main className='size-full flex-1 px-2.5 py-3 sm:px-6'>
        {children}
      </main>
      {footer && (
        <footer className='bg-card h-10 border-t px-4 sm:px-6'>
          {footer}
        </footer>
      )}
    </div>
  )
}
