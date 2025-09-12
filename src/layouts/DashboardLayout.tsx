import { UserNav } from '@/components/auth/UserNav';
import SearchInput from '@/components/ui/search-input';
import { Outlet } from 'react-router';
import { CreateProjectDialog } from '@/components/created-components/CreateProjectDialog';

export const DashboardLayout = () => (
  <div className="min-h-screen bg-[#2C2C2C] text-white">
    <header className="border-b border-gray-700 py-5 px-6 md:px-24">
      <nav className="flex items-center gap-6 justify-between">
        <UserNav />
        <div className="flex-grow max-w-md">
          <SearchInput />
        </div>
        <CreateProjectDialog />
      </nav>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
);
