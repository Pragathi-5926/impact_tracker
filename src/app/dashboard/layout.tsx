import Link from 'next/link';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { Logo } from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <SidebarNav />
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <div className="sm:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="relative ml-auto flex-1 md:grow-0" />
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
