import DashboardCard from '@/components/ui/dashboard-card';
import type { Project } from '@/models/projectModel';
import { getProjectsByUserId } from '@/services/project.service';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router';
import { Spinner } from '@/assets/icons/LoadingSpinner';

interface OutletContext {
  searchTerm: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { searchTerm } = useOutletContext<OutletContext>();
  const [ loadingProjects, setLoadingProjects ] = useState(false);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await getProjectsByUserId();
      setProjects(data);
    } catch (error) {
      toast.error(`Error al obtener los proyectos: ${error instanceof Error ? error.message : String(error)}`);
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
          {loadingProjects ? 
            (
              <>
                <Spinner text='Cargando proyectos...' />
              </>
            ):(
              <>{filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <DashboardCard
                    key={project.id}
                    id={project.id}
                    title={project.name ?? 'Proyecto sin nombre'}
                    lastEdited={project.lastEdited ?? project.createdAt}
                    imageUrl={project.imageUrl ?? 'https://i.imgur.com/SBpn2o8.png'}
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
    </div>
  );
};

export default Dashboard;
