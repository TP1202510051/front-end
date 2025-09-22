import { useState } from 'react';
import { createProject } from '../services/project.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useProjectCreation = () => {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const createNewProject = async (name: string) => {
    if (!firebaseUser) {
        toast.error('Debes iniciar sesión para crear un proyecto.');
        return;
    }
    try {
    setLoading(true);
      const result = await createProject(firebaseUser.uid, name);
      toast.success('Proyecto creado con éxito!');
      navigate(`/design-interface/${result}/${name}`);
    } catch (error) {
      toast.error('Error al crear el proyecto');
      toast.error(`Error al crear proyecto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return { createNewProject, loading };
};
