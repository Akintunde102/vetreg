import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <AdminSidebar />
      <main className="pt-[var(--topbar-height)] pb-8 lg:pl-[var(--sidebar-width)]">
        <div className="max-w-[1440px] mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
