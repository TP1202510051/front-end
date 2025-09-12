import { UserNav } from '@/components/auth/UserNav';
import ProductInterface from '@/pages/products-interface/ProductInterface';
import { ProjectHeader } from './ProjectHeader';

interface SidebarProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
}

export const Sidebar = ({ projectId, projectName, setIsSaving }: SidebarProps) => {
  return (
    <div className="w-1/4 bg-[#2C2C2C] flex flex-col overflow-auto p-4 gap-3">
      <UserNav />
      <ProjectHeader projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
      <ProductInterface projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
    </div>
  );
};
