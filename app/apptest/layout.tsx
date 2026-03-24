import { AppShell } from '@/components/layouts/app-shell'
import { ModeToggle } from '@/components/mode-toggle'
import { AppSidebar } from '@/components/sidebars/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { HeaderBackButton } from './_components/header-back-button'

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<AppSidebar />}
      header={
        <div className="flex w-full items-center">
          <HeaderBackButton />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      }
    >
      <Card className='min-h-full bg-transparent'>
        <CardContent className='py-2.5'>
          {children}
        </CardContent>
      </Card>
    </AppShell>
  )
}
