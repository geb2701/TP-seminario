import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from '@/components/providers'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SidebarInset } from '@/components/ui/sidebar'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Buscador de Carreras',
  description: 'Explorá y comparé carreras universitarias en Argentina',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={geist.variable} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-svh">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </SidebarInset>
        </Providers>
      </body>
    </html>
  )
}
