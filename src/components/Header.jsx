import React from 'react';
import { Search, User, MessageSquare } from 'lucide-react';

const Header = () => {
  return (
    <div className="app-header">
      <div className="search-bar flex items-center" style={{ width: '300px', backgroundColor: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search Tracking ID, Route, Vessel..." 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.875rem' }}
        />
      </div>
      <div className="header-actions flex items-center gap-4">
        <button className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '999px' }}>
          <MessageSquare size={14} /> AI Assistant
        </button>
        <div className="user-profile flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="white" />
          </div>
          <span className="text-sm font-medium">Logistics Mgr</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
