import { Outlet } from 'react-router';

export function BlankLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Outlet />
    </div>
  );
}