import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Grupo {
  id: number;
  nombre: string;
  vigente: boolean;
  tipo?: string;
  creadoEn: string;
  grupoAfiliados: Array<{
    afiliado: {
      id: number;
      nombres: string;
      apellido: string;
    };
  }>;
}

const GruposPage: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/grupos`);
      setGrupos(response.data);
    } catch (error) {
      console.error('Error fetching grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Grupos</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{grupo.nombre}</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                  <Edit size={16} />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {grupo.grupoAfiliados.length} miembros
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                grupo.vigente 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {grupo.vigente ? 'Vigente' : 'Inactivo'}
              </span>
              
              {grupo.tipo && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {grupo.tipo}
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos creados</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primer grupo de afiliados</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Crear primer grupo
          </button>
        </div>
      )}
    </div>
  );
};

export default GruposPage;
