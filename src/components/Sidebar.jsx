import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Bell, Map, Network, PlaySquare } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Live Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Data Streams', path: '/data', icon: <Database size={20} /> },
    { name: 'Pre-Alerts', path: '/alerts', icon: <Bell size={20} /> },
    { name: 'Route Optimizer', path: '/routes', icon: <Map size={20} /> },
    { name: 'Explainability', path: '/explain', icon: <Network size={20} /> },
    { name: 'Simulator', path: '/scenario', icon: <PlaySquare size={20} /> },
  ];

  return (
    <div className="app-sidebar">
      <div className="sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="font-bold flex items-center gap-2 text-xl" style={{ color: 'var(--text-primary)' }}>
          <Network color="var(--bg-accent)" /> 
          SupplyAI
        </h2>
        <p className="text-xs text-muted mt-1">v2.0 (Hackathon Build)</p>
      </div>
      <nav className="flex-col gap-2" style={{ padding: '1.5rem 1rem' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.2s'
            })}
            className="hover-nav-item"
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-card-hover)', border: 'none' }}>
          <h4 className="text-sm font-semibold mb-2">System Status</h4>
          <div className="flex justify-between items-center text-xs">
            <span>Prediction Engine</span>
            <span className="flex items-center gap-1"><span className="status-indicator status-success"></span> Online</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2">
            <span>API Feeds</span>
            <span className="flex items-center gap-1"><span className="status-indicator status-success"></span> Syncing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
