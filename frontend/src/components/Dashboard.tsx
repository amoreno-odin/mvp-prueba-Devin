import React, { useState, useEffect } from 'react';
import { Users, Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAfiliados: 0,
    afiliadosActivos: 0,
    liquidacionesMes: 0,
    montoTotalMes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const afiliadosResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/afiliados`);
        const liquidacionesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/liquidaciones`);
        
        const afiliados = afiliadosResponse.data;
        const liquidaciones = liquidacionesResponse.data;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const liquidacionesMes = liquidaciones.filter((l: any) => {
          const fecha = new Date(l.creadoEn);
          return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
        });

        setStats({
          totalAfiliados: afiliados.length,
          afiliadosActivos: afiliados.filter((a: any) => a.estado === 'ACTIVO').length,
          liquidacionesMes: liquidacionesMes.length,
          montoTotalMes: liquidacionesMes.reduce((sum: number, l: any) => sum + Number(l.totalNeto), 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Afiliados',
      value: stats.totalAfiliados,
      icon: Users,
      color: 'blue',
      subtitle: `${stats.afiliadosActivos} activos`
    },
    {
      title: 'Liquidaciones del Mes',
      value: stats.liquidacionesMes,
      icon: Calculator,
      color: 'green',
      subtitle: 'Confirmadas'
    },
    {
      title: 'Monto Total Mes',
      value: `$${stats.montoTotalMes.toLocaleString()}`,
      icon: TrendingUp,
      color: 'purple',
      subtitle: 'Neto liquidado'
    },
    {
      title: 'Pendientes',
      value: '0',
      icon: AlertCircle,
      color: 'orange',
      subtitle: 'Por revisar'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <Icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nueva liquidación creada</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/30 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Afiliado agregado al sistema</p>
                <p className="text-xs text-gray-500">Hace 4 horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-white/50 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-300/50 transition-colors">
              <div className="font-medium text-blue-700">Nueva Liquidación Individual</div>
              <div className="text-sm text-blue-600">Crear liquidación para un afiliado</div>
            </button>
            <button className="w-full text-left p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-300/50 transition-colors">
              <div className="font-medium text-green-700">Nueva Liquidación Grupal</div>
              <div className="text-sm text-green-600">Liquidar grupo de afiliados</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
