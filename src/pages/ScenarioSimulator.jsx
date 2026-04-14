import React, { useState } from 'react';
import { Layers, PlayCircle, ShieldAlert, TrendingUp } from 'lucide-react';

const ScenarioSimulator = () => {
  const [event, setEvent] = useState('strike');
  const [severity, setSeverity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/ml/simulate", {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ event_type: event, severity: parseInt(severity) })
    })
    .then(res => res.json())
    .then(data => setResult(data))
    .finally(() => setLoading(false));
  };

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex', height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers color="var(--color-info)" /> "What-If" Scenario Simulator</h1>
          <p className="text-muted text-sm">Calculate cascading network impacts of potential global disruptions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ flexGrow: 1 }}>
        {/* Controls */}
        <div className="card flex-col gap-6">
          <div>
            <label className="block text-sm mb-2 font-semibold">Select Disruption Event</label>
            <select 
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-3 focus:outline-none focus:border-blue-500 text-sm"
              style={{ appearance: 'none' }}
            >
              <option value="strike">Major Port Strike (e.g. West Coast)</option>
              <option value="weather">Maritime Typhoon / Extreme Weather</option>
              <option value="customs">Customs System Outage</option>
              <option value="blockage">Canal Blockage (e.g. Suez)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-2 font-semibold flex justify-between">
              <span>Severity Index</span>
              <span className={severity > 7 ? 'text-critical' : 'text-warning'}>Level {severity}</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full accent-blue-500" 
            />
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>Moderate</span>
              <span>Catastrophic</span>
            </div>
          </div>
          
          <button 
            onClick={runSimulation}
            disabled={loading}
            className="btn w-full flex justify-center items-center gap-2 mt-4 py-3"
            style={{ backgroundColor: 'var(--color-info)' }}
          >
            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <PlayCircle size={18} />}
            {loading ? 'Simulating Cascading Impacts...' : 'Run Mathematical Simulation'}
          </button>
        </div>

        {/* Results */}
        <div className="card relative overflow-hidden flex-col">
           <h3 className="card-title border-b border-slate-700 pb-4 mb-4">Network Impact Forecast</h3>
           
           {!result && !loading && (
             <div className="flex-col items-center justify-center h-full text-slate-500 gap-2">
                <Layers size={48} opacity={0.3} />
                <p>Configure parameters and run simulation.</p>
             </div>
           )}
           
           {loading && (
             <div className="flex-col items-center justify-center h-full gap-4">
                <div className="h-1 w-full bg-slate-800 overflow-hidden rounded relative">
                   <div className="absolute top-0 bottom-0 left-0 bg-blue-500 w-1/3 animate-pulse" style={{ animationDuration: '0.5s' }}></div>
                </div>
                <p className="text-sm text-slate-400 font-mono">Calculating multi-node delay propagation...</p>
             </div>
           )}
           
           {result && !loading && (
             <div className="flex-col gap-6 animate-fade-in h-full justify-center">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg flex-col items-center text-center gap-2">
                      <ShieldAlert color="var(--color-critical)" size={24} />
                      <span className="text-3xl font-bold text-critical">+{result.impact.additional_delayed_shipments}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-widest">Added Delays</span>
                   </div>
                   <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg flex-col items-center text-center gap-2">
                      <TrendingUp color="var(--color-warning)" size={24} />
                      <span className="text-3xl font-bold text-warning">+{result.impact.network_delay_hours} hrs</span>
                      <span className="text-xs text-slate-400 uppercase tracking-widest">Network Propagation</span>
                   </div>
                </div>
                
                <div className="p-4 bg-red-900/20 border border-red-800 rounded mt-2">
                   <h4 className="text-sm font-bold text-red-400 mb-1">Financial Impact</h4>
                   <p className="text-xl font-bold text-white">+${result.impact.estimated_cost_impact.toLocaleString()}</p>
                </div>
                
                <div className="p-4 bg-blue-900/20 border border-blue-800 rounded">
                   <h4 className="text-sm font-bold text-blue-400 mb-1">AI Recommendation</h4>
                   <p className="text-sm text-slate-300">{result.impact.recommendation}</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
