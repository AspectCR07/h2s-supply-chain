import React, { useState, useEffect } from 'react';
import { Map, RefreshCcw, Compass, Calendar, DollarSign, CloudRain } from 'lucide-react';

const RouteOptimizer = () => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRouteOptimization = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/tracking/route-optimizer", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Shanghai', destination: 'Los Angeles', current_route_id: 'R-7742' })
    })
    .then(res => res.json())
    .then(data => setRouteInfo(data))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRouteOptimization();
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex', height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Map color="var(--color-info)" /> Advanced Route Optimizer</h1>
          <p className="text-muted text-sm">Evaluating live diversions vs current manifest logic.</p>
        </div>
        <button onClick={fetchRouteOptimization} className="btn flex items-center gap-2">
            {loading ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
            Recalculate Routes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ flexGrow: 1 }}>
        <div className="card flex-col justify-between" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
          {/* Mock Map View */}
          <div className="flex-col justify-center items-center h-full text-slate-500 gap-4">
             <Map size={48} opacity={0.5} />
             <p className="text-sm">Geospatial Interface Rendering Disabled for Demo</p>
             {routeInfo && (
                <div className="mt-4 flex gap-4 w-full px-8 opacity-80">
                   <div className="flex-1 border-t-2 border-dashed border-red-500 relative mt-2">
                      <span className="absolute -top-6 left-0 text-xs">Shanghai</span>
                      <span className="absolute -top-6 right-0 text-xs">Los Angeles</span>
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-red-500">Route A (Current)</span>
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="flex-col gap-4">
          <div className="card">
            <h3 className="card-title">Live Route Analysis</h3>
            
            {loading ? (
               <div className="flex justify-center items-center p-8 text-muted"><RefreshCcw className="animate-spin mr-2"/> Querying Optimization Engine...</div>
            ) : routeInfo ? (
               <div className="flex-col gap-6 mt-4">
                  {/* Route A vs B */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                        <h4 className="font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Original Route</h4>
                        <ul className="flex-col gap-2 text-sm">
                           <li className="flex justify-between"><span>ETA</span> <span className="font-bold text-warning">{routeInfo.current_route.eta_days} Days</span></li>
                           <li className="flex justify-between"><span>Cost</span> <span>${routeInfo.current_route.fuel_cost.toLocaleString()}</span></li>
                           <li className="flex justify-between"><span>Carbon</span> <span>{routeInfo.current_route.carbon_emissions_tons} Tons</span></li>
                        </ul>
                     </div>
                     <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-800">
                        <h4 className="font-bold text-emerald-400 border-b border-emerald-800/50 pb-2 mb-3">AI Diversion</h4>
                        <ul className="flex-col gap-2 text-sm">
                           <li className="flex justify-between"><span>ETA</span> <span className="font-bold text-success">{routeInfo.optimized_route.eta_days} Days</span></li>
                           <li className="flex justify-between"><span>Cost</span> <span>${routeInfo.optimized_route.fuel_cost.toLocaleString()}</span></li>
                           <li className="flex justify-between"><span>Carbon</span> <span>{routeInfo.optimized_route.carbon_emissions_tons} Tons</span></li>
                        </ul>
                     </div>
                  </div>
                  
                  {/* Deltas */}
                  <div className="p-4 rounded bg-slate-900 border border-slate-700">
                     <h4 className="font-bold mb-3">Optimization Impact</h4>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 p-2 bg-slate-800 rounded flex items-center justify-between">
                           <Calendar size={16} className="text-slate-400" />
                           <span className={routeInfo.deltas.time_saved_days > 0 ? "text-success font-bold" : "text-critical font-bold"}>
                              {routeInfo.deltas.time_saved_days > 0 ? '-' : '+'}{Math.abs(routeInfo.deltas.time_saved_days)} Days
                           </span>
                        </div>
                        <div className="flex-1 p-2 bg-slate-800 rounded flex items-center justify-between">
                           <DollarSign size={16} className="text-slate-400" />
                           <span className={routeInfo.deltas.cost_difference < 0 ? "text-success font-bold" : "text-warning font-bold"}>
                              {routeInfo.deltas.cost_difference < 0 ? '-' : '+$'}{Math.abs(routeInfo.deltas.cost_difference).toLocaleString()}
                           </span>
                        </div>
                        <div className="flex-1 p-2 bg-slate-800 rounded flex items-center justify-between">
                           <CloudRain size={16} className="text-slate-400" />
                           <span className={routeInfo.deltas.carbon_difference < 0 ? "text-success font-bold" : "text-warning font-bold"}>
                              {routeInfo.deltas.carbon_difference < 0 ? '-' : '+'}{Math.abs(routeInfo.deltas.carbon_difference)} Tons
                           </span>
                        </div>
                     </div>
                  </div>
                  
                  <button className="btn w-full mt-2 bg-emerald-600 hover:bg-emerald-500">Dispatch Diversion Order</button>
               </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;
