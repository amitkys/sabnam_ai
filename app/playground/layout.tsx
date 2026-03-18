import { AppShell } from '@/components/layouts/app-shell'
import { PlaygroundSidebar } from '@/components/sidebars/playground-sidebar'
import { Card, CardContent } from '@/components/ui/card'

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<PlaygroundSidebar />}
      header={<span>Playground</span>}
    >
      <Card className='min-h-full bg-transparent'>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </AppShell>
  )
}
