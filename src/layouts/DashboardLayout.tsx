import { UserNav } from '@/components/auth/UserNav';
import SearchInput from '@/components/ui/search-input';
import { Outlet } from 'react-router';
import { CreateProjectDialog } from '@/components/created-components/CreateProjectDialog';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

export const DashboardLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname]);
  return (
  <div className="min-h-screen bg-[var(--dashboard-background)] text-[var(--dashboard-foreground)]">
    <header className="border-b border-[var(--nav-foreground)]/50 py-5 px-6 md:px-24 bg-[var(--nav-background)]">
      <nav className="flex items-center gap-6 justify-between">
        <UserNav />
        {location.pathname === '/dashboard' && (
          <div className="flex-grow max-w-md">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
        )}
        <CreateProjectDialog />
      </nav>
    </header>
    <main>
      <Outlet context={{ searchTerm }} />
    </main>
  </div>
);
}
