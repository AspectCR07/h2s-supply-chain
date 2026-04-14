import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import './App.css';

import DataIngestion from './pages/DataIngestion';
import Alerts from './pages/Alerts';
import RouteOptimizer from './pages/RouteOptimizer';
import Explainability from './pages/Explainability';
import ScenarioSimulator from './pages/ScenarioSimulator';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <Header />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<DataIngestion />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/routes" element={<RouteOptimizer />} />
              <Route path="/explain" element={<Explainability />} />
              <Route path="/scenario" element={<ScenarioSimulator />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
