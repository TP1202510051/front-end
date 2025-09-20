import { UserNav } from '@/components/auth/UserNav';
import ProductInterface from '@/pages/products-interface/ProductInterface';
import { ProjectHeader } from './ProjectHeader';
import { WindowSidebar } from '@/components/created-components/WindowSidebar';
// import { ComponentSidebar } from '@/components/created-components/ComponentSidebar';
import type { AppWindow } from '@/models/windowModel';
// import { useEditing } from '@/contexts/EditingContext';
// import { Button } from '../ui/button';
// import { MessageCircle } from 'lucide-react';
// import { useState } from 'react';

interface SidebarProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
  onSelectWindow: (win: AppWindow | null) => void;
}

export const Sidebar = ({ projectId, projectName, setIsSaving, onSelectWindow }: SidebarProps) => {
  // const { openProject } = useEditing();
  // const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const handleSelectWindow = (win: AppWindow | null) => {
    onSelectWindow(win);
    // setSelectedWindowId(win ? win.id : null);
  };

  return (
    <div className="w-1/4 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col overflow-auto p-4 gap-3">
      <UserNav />
      <ProjectHeader projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />

      {/* <Button
        variant="inverseDark"
        className="flex items-center gap-2"
        onClick={() => openProject(projectId, projectName)}
      >
        <MessageCircle className="h-4 w-4" />
        Chat Proyecto
      </Button> */}

      <WindowSidebar
        projectId={projectId}
        onSelect={handleSelectWindow}
        setIsSaving={setIsSaving}
      />

      {/* {selectedWindowId && <ComponentSidebar windowId={selectedWindowId} />} */}

      <ProductInterface projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
    </div>
  );
};
