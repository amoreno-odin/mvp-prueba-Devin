import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, UserCheck, Calculator, BarChart3 } from 'lucide-react';

interface SidebarProps {
  currentUser: {
    name: string;
    role: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/afiliados', icon: Users, label: 'Afiliados' },
    { path: '/grupos', icon: UserCheck, label: 'Grupos' },
    { path: '/liquidaciones', icon: Calculator, label: 'Liquidaciones' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/20 backdrop-blur-lg border-r border-white/30 shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Sistema de Liquidaciones
        </h1>
        
        <div className="mb-8 p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/40">
          <div className="text-sm text-gray-600">Usuario</div>
          <div className="font-semibold text-gray-800">{currentUser.name}</div>
          <div className="text-sm text-blue-600">{currentUser.role}</div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-700 border border-blue-300/50'
                    : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
