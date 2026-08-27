import DashboardCard from '@/components/ui/dashboard-card';
import type { Project } from '@/models/projectModel';
import { listProjects } from '@/api/projects';
import { safeProblem, type ApiProblem, type RecoveryAction } from '@/api/problems';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

interface OutletContext {
  searchTerm: string;
}

const recoveryLabels: Record<RecoveryAction, string> = {
  SIGN_IN: 'Iniciar sesión', RETURN_TO_PROJECTS: 'Volver a proyectos', REFRESH: 'Actualizar',
  EDIT_REQUEST: 'Volver a cargar proyectos', RETRY_LATER: 'Reintentar', CONTACT_SUPPORT: 'Copiar referencia de soporte',
};

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { searchTerm } = useOutletContext<OutletContext>();
  const [ loadingProjects, setLoadingProjects ] = useState(false);
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const navigate = useNavigate();

  const recover = () => {
    if (!problem) return;
    if (problem.action === 'SIGN_IN') navigate('/login');
    else if (problem.action === 'CONTACT_SUPPORT') {
      if (problem.correlationId) void navigator.clipboard.writeText(problem.correlationId).catch(() => undefined);
    } else if (problem.action === 'REFRESH') window.location.reload();
    else void fetchProjects();
  };

  const fetchProjects = async (after?: string) => {
    setLoadingProjects(true);
    setProblem(null);
    try {
      const data = await listProjects(after);
      setProjects(previous => after ? [...previous, ...data.items] : data.items);
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      setProblem(safeProblem(error));
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase() || '')
  );
  return (
    <div className="w-full p-8 px-24 min-h-screen bg-[var(--dashboard-background)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {problem ? (
            <div role="alert" className="col-span-full">
              <p>{problem.message}</p>
              {problem.correlationId && <p>Referencia: {problem.correlationId}</p>}
              {problem.action === 'CONTACT_SUPPORT' && <p>Contacta al responsable de soporte e indica la referencia, si está disponible.</p>}
              {(problem.action !== 'CONTACT_SUPPORT' || problem.correlationId) && <Button onClick={recover}>
                {recoveryLabels[problem.action]}
              </Button>}
            </div>
          ) : loadingProjects && projects.length === 0 ?
            (
              <>
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
                <DashboardSkeleton />
              </>
            ):(
              <>{filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <DashboardCard
                    key={project.id}
                    id={project.id}
                    title={project.name ?? 'Proyecto sin nombre'}
                    lastEdited={project.createdAt}
                    imageUrl={project.imageUrl ?? 'https://i.imgur.com/SBpn2o8.png'}
                    loadingProjects={setLoadingProjects}
                    setProjects={setProjects}
                  />
                )
              )
            ) : (
              <div className="col-span-full text-center text-gray-400">
                <p>No hay proyectos disponibles.</p>
              </div>
            )}
          </>) 
        }
        </div>
        {!problem && nextCursor && <Button disabled={loadingProjects} onClick={() => void fetchProjects(nextCursor)}>Cargar más proyectos</Button>}
    </div>
  );
};

export default Dashboard;
