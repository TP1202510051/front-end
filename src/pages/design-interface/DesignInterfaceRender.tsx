import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AppWindow } from "@/models/windowModel";
import ChatInterface from "../chat-interface/ChatInterface";
import CodeInterface from "../code-interface/CodeInterface";
import { Sidebar } from "@/components/created-components/Sidebar";
import { SavingStatus } from "@/components/created-components/SavingStatus";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditing } from "@/contexts/EditingContext";
import { DocumentCanvas } from "@/components/renderers/DocumentCanvas";
import type { ProjectDocument } from '@/canvas/intention'
import { getStoreProject, type StoreProject } from '@/api/projects'
import { safeProblem, type ApiProblem } from '@/api/problems'

const DesignInterfaceRender: React.FC = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);
  const [assistantRevision, setAssistantRevision] = useState(0);
  const [project, setProject] = useState<StoreProject | null>(null);
  const [preview, setPreview] = useState<ProjectDocument | null>(null);
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const navigate = useNavigate();

  const { target, showChat, closeChat, clearTarget } = useEditing();

  useEffect(() => {
    clearTarget();
    let active = true;
    setProject(null);
    setPreview(null);
    setProblem(null);
    if (!projectId) {
      setProblem(safeProblem(null));
      return () => { active = false };
    }
    getStoreProject(projectId).then(value => {
      if (active) setProject(value);
    }).catch(error => {
      if (active) setProblem(safeProblem(error));
    });
    return () => { active = false };
  }, [projectId]);

  if (problem) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--dashboard-background)] p-8">
      <div role="alert" className="space-y-4 text-[var(--dashboard-foreground)]">
        <p>{problem.message}</p>
        <Button onClick={() => navigate(problem.code === 'AUTHENTICATION_REQUIRED' ? '/login' : '/dashboard')}>
          {problem.code === 'AUTHENTICATION_REQUIRED' ? 'Iniciar sesión' : 'Volver a proyectos'}
        </Button>
      </div>
    </main>;
  }

  if (!project) {
    return <main role="status" className="flex min-h-screen items-center justify-center bg-[var(--dashboard-background)] text-[var(--dashboard-foreground)]">
      Cargando proyecto…
    </main>;
  }

  // Ventanas de vista individual de producto
  const singleProductViews = [
    "Detalle de Producto",
    "Vista de Producto",
    "Informacion de Producto",
  ];

  const isSingleProductView =
    selectedWindow && singleProductViews.includes(selectedWindow.name);

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden relative">
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          projectId={projectId ?? ""}
          projectName={project.name}
          setIsSaving={setIsSaving}
          onSelectWindow={setSelectedWindow}
        />

        <div className="w-full flex-grow flex flex-col items-center justify-center bg-[var(--dashboard-background)] p-4 relative">
          <div className="w-full flex justify-between items-center">
            <SavingStatus isSaving={isSaving} />
          </div>

          <DocumentCanvas project={project} onAccepted={setProject} onPreview={setPreview} />

          {isSingleProductView && (
            <div className="text-sm text-gray-400 mb-4 italic border px-12 py-6">
              <p className="animate-pulse">
                Esta interfaz es una demostración de cómo va a quedar.
              </p>
            </div>
          )}

          <CodeInterface
            selectedWindow={selectedWindow}
            reloadKey={assistantRevision}
            project={preview
              ? { ...project, acceptedRevision: { ...project.acceptedRevision, document: preview } }
              : project}
          />
        </div>
      </div>

      <div
        className={`absolute rounded-2xl top-14 right-4 w-250 h-9/10 bg-transparent text-[var(--sidebar-foreground)] shadow-2xl z-50 flex flex-col transform transition-all duration-300
          ${showChat ? "translate-x-0 w-1/3 opacity-100 pointer-events-auto" : "translate-x-full w-0 opacity-0 pointer-events-none"}`}
      >
        <div className="justify-end w-full p-4 flex absolute">
          <Button
            onClick={closeChat}
            className="p-2 rounded-md transition"
            aria-label="Cerrar chat"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto rounded-md">
          {target && (
            <ChatInterface
              onCode={() => setAssistantRevision(revision => revision + 1)}
              projectId={projectId ?? ""}
              setIsSaving={setIsSaving}
              target={target}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignInterfaceRender;
