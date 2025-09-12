import { useState } from 'react';
import { createProject } from '../services/project.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useProjectCreation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const createNewProject = async (name: string) => {
    if (!currentUser) {
        toast.error('Debes iniciar sesión para crear un proyecto.');
        return;
    }
    try {
    setLoading(true);
      const result = await createProject(currentUser.uid, name);
      toast.success('Proyecto creado con éxito!');
      navigate(`/design-interface/${result}/${name}`);
    } catch (error) {
      toast.error('Error al crear el proyecto');
      console.error('Error al crear proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  return { createNewProject, loading };
};
