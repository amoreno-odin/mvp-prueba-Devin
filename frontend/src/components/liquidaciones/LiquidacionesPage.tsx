import React, { useState, useEffect } from 'react';
import { Plus, Calculator, Eye, FileText, Filter } from 'lucide-react';
import axios from 'axios';

interface Liquidacion {
  id: number;
  periodoDesde: string;
  periodoHasta: string;
  tipo: 'INDIVIDUAL' | 'GRUPAL';
  estado: 'BORRADOR' | 'CONFIRMADA' | 'ANULADA';
  totalNeto: number;
  grupoNombreLabel?: string;
  creadoEn: string;
  detalles: Array<{
    afiliado: {
      nombres: string;
      apellido: string;
    };
  }>;
}

const LiquidacionesPage: React.FC = () => {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    fetchLiquidaciones();
  }, []);

  const fetchLiquidaciones = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/liquidaciones`);
      setLiquidaciones(response.data);
    } catch (error) {
      console.error('Error fetching liquidaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLiquidaciones = liquidaciones.filter(liquidacion => {
    const matchesTipo = !filtroTipo || liquidacion.tipo === filtroTipo;
    const matchesEstado = !filtroEstado || liquidacion.estado === filtroEstado;
    return matchesTipo && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800';
      case 'ANULADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Liquidaciones</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calculator size={20} />
            <span>Liquidación Individual</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            <span>Liquidación Grupal</span>
          </button>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GRUPAL">Grupal</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Período</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Grupo/Afiliado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Neto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLiquidaciones.map((liquidacion) => (
                <tr key={liquidacion.id} className="border-b border-gray-100 hover:bg-white/30">
                  <td className="py-3 px-4 font-mono text-sm">{liquidacion.id}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {new Date(liquidacion.periodoDesde).toLocaleDateString()} - 
                      {new Date(liquidacion.periodoHasta).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      liquidacion.tipo === 'INDIVIDUAL' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {liquidacion.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {liquidacion.tipo === 'GRUPAL' 
                      ? liquidacion.grupoNombreLabel || 'Grupo'
                      : liquidacion.detalles[0]?.afiliado 
                        ? `${liquidacion.detalles[0].afiliado.apellido}, ${liquidacion.detalles[0].afiliado.nombres}`
                        : '-'
                    }
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ${liquidacion.totalNeto.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(liquidacion.estado)}`}>
                      {liquidacion.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLiquidaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron liquidaciones
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidacionesPage;
