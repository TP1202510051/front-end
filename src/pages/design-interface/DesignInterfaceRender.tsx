import React, { useState, useEffect } from 'react';
import ChatInterface from '../chat-interface/ChatInterface';
import { useParams, useNavigate } from 'react-router-dom';
import WindowInterface from '../window-interface/WindowInterface';
import type { Window } from '@/models/windowModel';
import ProductInterface from '../products-interface/ProductInterface';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Save } from 'lucide-react';
import { updateProjectName, deleteProject } from '@/services/project.service';

const DesignInterfaceRender: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const { projectId, projectName } = useParams<{ projectId: string; projectName: string }>();
  const [selectedWindow, setSelectedWindow] = useState<Window>();
  const [liveCode, setLiveCode] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState<string>(projectName ?? '');

  useEffect(() => {
    console.log('Nuevo liveCode recibido:', liveCode);
  }, [liveCode]);

  useEffect(() => {
    if (!isSaving) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  const handleUpdateName = async () => {
    try {
      if (!projectId) return;
      await updateProjectName(projectId, newProjectName);
      setIsDialogOpen(false);
      if (setIsSaving) setIsSaving(false);
      navigate(`/design-interface/${projectId}/${newProjectName}`);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!projectId) return;
      await deleteProject(projectId);
      navigate(`/dashboard`);
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden">
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 bg-[#2C2C2C] flex flex-col overflow-auto p-4 gap-3">
          <Button className='p-6 bg-white rounded-4xl w-1/8'>
          </Button>
          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">{projectName}</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#2C2C2C] text-white rounded">
                <DialogTitle>Editar nombre del proyecto</DialogTitle>
                <div className="mt-4">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="text-white bg-[#1a1a1a] border border-gray-600"
                  />
                </div>
                <DialogFooter className="pt-4 flex justify-between">
                  <Button onClick={() => { handleUpdateName(); if (setIsSaving) setIsSaving(true); }} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                  <Button onClick={handleDeleteProject} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ProductInterface projectId={projectId ?? ''} projectName={projectName ?? ''} setIsSaving={setIsSaving} />
        </div>

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[#202123] p-4">
            { isSaving ? (
            <div className='left-0 w-full flex gap-1 items-center animate-pulse'>
              <h1 className="text-xs">Saving...</h1>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            ) : (
            <div className={`left-0 w-full flex gap-1 items-center transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>
              <h1 className="text-xs">Saved</h1>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
              </svg>
            </div>
            )}
          <WindowInterface
            projectId={projectId ?? ''}
            webSocketCode={liveCode}
            onWindowSelect={setSelectedWindow}
            setIsSaving={setIsSaving}
          />
        </div>

        <div className="w-1/3 bg-[#2C2C2C] flex flex-col overflow-auto">
          {selectedWindow && (
            <ChatInterface
              onCode={setLiveCode}
              window={selectedWindow}
              projectId={projectId ?? ''}
              setIsSaving={setIsSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;
