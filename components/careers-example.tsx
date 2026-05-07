'use client';

import { useRouter } from 'next/navigation';
import { useApiQuery, useApiMutation, postData } from '@/lib/api';
import { useState } from 'react';

// Ejemplo de interface para tus datos
interface Career {
  id: string;
  name: string;
  description: string;
}

export function CareersExample() {
  const router = useRouter();
  const [newCareerName, setNewCareerName] = useState('');

  // GET - Obtener lista de carreras
  const { data: careers, isLoading, error } = useApiQuery<Career[]>(
    'careers-list',
    '/careers',
    {
      staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    }
  );

  // POST - Crear nueva carrera
  const createMutation = useApiMutation({
    mutationFn: (newCareer: Omit<Career, 'id'>) =>
      postData<Career>('/careers', newCareer),
    onSuccess: () => {
      // Invalida la query para refrescar los datos
      setNewCareerName('');
      router.refresh();
    },
    onError: (error) => {
      console.error('Error al crear carrera:', error);
    },
  });

  const handleCreateCareer = async () => {
    if (!newCareerName.trim()) return;

    createMutation.mutate({
      name: newCareerName,
      description: '',
    });
  };

  if (isLoading) return <div>Cargando carreras...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Carreras Disponibles</h1>

      {/* Lista de carreras */}
      <div className="mb-8">
        <ul className="space-y-2">
          {careers?.map((career) => (
            <li key={career.id} className="p-3 bg-gray-100 rounded">
              <h3 className="font-semibold">{career.name}</h3>
              <p className="text-sm text-gray-600">{career.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Formulario para crear nueva carrera */}
      <div className="p-4 bg-blue-50 rounded">
        <h2 className="font-semibold mb-3">Agregar Nueva Carrera</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCareerName}
            onChange={(e) => setNewCareerName(e.target.value)}
            placeholder="Nombre de la carrera"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleCreateCareer}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear'}
          </button>
        </div>
        {createMutation.isError && (
          <p className="text-red-500 mt-2">Error al crear la carrera</p>
        )}
      </div>
    </div>
  );
}
