import DashboardCard from '@/components/ui/dashboard-card';
import type { Project } from '@/models/projectModel';
import { getProjectsByUserId } from '@/services/project.service';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // Función para obtener proyectos de la base de datos
  const fetchProjects = async () => {
    try {
      const data = await getProjectsByUserId(1);
      console.log("Proyectos obtenidos en dashboard:", data);
      setProjects(data); // Establecer proyectos
    } catch (error) {
      console.error("Error al obtener los proyectos", error);
    }
  };

  // Llamar a fetchProjects cuando el componente se monta
  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <div className="w-full p-8 px-24 min-h-screen bg-[var(--dashboard-background)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <DashboardCard
                key={project.id}
                id={project.id}
                title={project.projectName ?? 'Proyecto sin nombre'}
                lastEdited={project.lastEdited ?? project.createdAt}
                imageUrl={project.imageUrl ?? 'https://i.imgur.com/SBpn2o8.png'}
              />
            ))
          ) : (
            <p>No hay proyectos disponibles.</p>
          )}
        </div>
    </div>
  );
};

export default Dashboard;
