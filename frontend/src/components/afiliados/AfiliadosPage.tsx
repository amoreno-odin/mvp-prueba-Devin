import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Afiliado {
  id: number;
  nLegajo: string;
  tipoDoc: string;
  nroDoc: string;
  apellido: string;
  nombres: string;
  email?: string;
  telefono?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  creadoEn: string;
}

const AfiliadosPage: React.FC = () => {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAfiliados();
  }, []);

  const fetchAfiliados = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/afiliados`);
      setAfiliados(response.data);
    } catch (error) {
      console.error('Error fetching afiliados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAfiliados = afiliados.filter(afiliado =>
    afiliado.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    afiliado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    afiliado.nLegajo.includes(searchTerm) ||
    afiliado.nroDoc.includes(searchTerm)
  );

  const handleEdit = (afiliado: Afiliado) => {
    console.log('Edit afiliado:', afiliado);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea inactivar este afiliado?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/afiliados/${id}`);
        fetchAfiliados();
      } catch (error) {
        console.error('Error deleting afiliado:', error);
      }
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Afiliados</h1>
        <button
          onClick={() => {
            console.log('Create new afiliado');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Afiliado</span>
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, legajo o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Legajo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Apellido y Nombres</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Documento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAfiliados.map((afiliado) => (
                <tr key={afiliado.id} className="border-b border-gray-100 hover:bg-white/30">
                  <td className="py-3 px-4">{afiliado.nLegajo}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{afiliado.apellido}, {afiliado.nombres}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{afiliado.tipoDoc} {afiliado.nroDoc}</td>
                  <td className="py-3 px-4">{afiliado.email || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      afiliado.estado === 'ACTIVO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {afiliado.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(afiliado)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(afiliado.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAfiliados.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron afiliados
          </div>
        )}
      </div>
    </div>
  );
};

export default AfiliadosPage;
