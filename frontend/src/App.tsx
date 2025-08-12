import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AfiliadosPage from './components/afiliados/AfiliadosPage';
import GruposPage from './components/grupos/GruposPage';
import LiquidacionesPage from './components/liquidaciones/LiquidacionesPage';
import './App.css';

function App() {
  const [currentUser] = useState({
    name: 'Usuario Demo',
    role: 'Operador'
  });

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex">
          <Sidebar currentUser={currentUser} />
          <main className="flex-1 ml-64 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/afiliados" element={<AfiliadosPage />} />
              <Route path="/grupos" element={<GruposPage />} />
              <Route path="/liquidaciones" element={<LiquidacionesPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
