import UserIcon from '@/components/ui/user-icon';
import { Outlet } from 'react-router-dom';

const IconLayout = () => {
  return (
    <header>
      <nav className='absolute p-4'>
        <UserIcon imgUrl="https://avatars.githubusercontent.com/u/84928376?v=4" />
      </nav>
      <div className="min-h-screen bg-[#2C2C2C] text-white">
        <main>
          <Outlet />
        </main>
      </div>
    </header>
  );
};

export default IconLayout;
