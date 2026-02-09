import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />
      <main className="pt-[var(--topbar-height)] pb-[var(--bottomnav-height)] lg:pb-0 lg:pl-[var(--sidebar-width)]">
        <div className="max-w-[1440px] mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
