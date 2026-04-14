import React, { useState, useEffect } from 'react';
import { Bell, Search, ShieldAlert, CheckCircle, Clock, RefreshCcw } from 'lucide-react';

const rawShipments = [
  { id: 'SHP-9192', origin: 'Shanghai', dest: 'Los Angeles', weather_condition: 'storm', recent_news_headline: 'dockworker strike', time: '12h ago' },
  { id: 'SHP-4012', origin: 'Rotterdam', dest: 'New York', weather_condition: 'rain', recent_news_headline: '', time: '2h ago' },
  { id: 'SHP-8811', origin: 'Mumbai', dest: 'Dubai', weather_condition: 'clear', recent_news_headline: '', time: '5m ago' },
  { id: 'SHP-2099', origin: 'Singapore', dest: 'Tokyo', weather_condition: 'clear', recent_news_headline: '', time: '1d ago' },
];

const Alerts = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hit the LIVE XGBoost Model from the FastAPI backend for every shipment natively
    const fetchPredictions = async () => {
      try {
        const results = await Promise.all(
          rawShipments.map(async (shipment) => {
            const res = await fetch("http://localhost:8000/api/ml/predict_risk", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shipment_id: shipment.id,
                weather_condition: shipment.weather_condition,
                recent_news_headline: shipment.recent_news_headline
              })
            });
            
            if (!res.ok) {
              return { ...shipment, risk: 0, status: 'API Error' };
            }
            
            const data = await res.json();
            return {
              ...shipment,
              risk: data.ai_risk_score !== undefined ? data.ai_risk_score : 0,
              status: data.interpretation || 'Unknown'
            };
          })
        );
        
        // Sort highest risk to the top
        results.sort((a, b) => b.risk - a.risk);
        setShipments(results);
      } catch (err) {
        console.error("FastAPI backend not running or unreachable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex', height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell color="var(--color-warning)" /> Live Actionable Risk Engine</h1>
          <p className="text-muted text-sm">Evaluating real-time XGBoost ML predictions across live fleet.</p>
        </div>
        <div className="search-bar flex items-center" style={{ width: '250px', backgroundColor: 'var(--bg-card)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
           <Search size={14} color="var(--text-muted)" />
           <input type="text" placeholder="Filter ID or Route" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.75rem' }}/>
        </div>
      </div>

      <div className="card" style={{ flexGrow: 1, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tracking ID</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Route</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LIVE AI Risk Score</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Alert Severity</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action Time</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div className="flex flex-col items-center justify-center gap-4">
                     <span className="status-indicator status-warning" style={{ width: 20, height: 20, animation: 'pulse 1s infinite' }}></span>
                     <span className="text-muted">Inference Engine running XGBoost predictions via FastAPI...</span>
                  </div>
                </td>
              </tr>
            ) : shipments.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover:bg-slate-800">
                <td style={{ padding: '1rem', fontWeight: 500 }}>{s.id}</td>
                <td style={{ padding: '1rem' }}><div className="flex gap-2 items-center"><span>{s.origin}</span> <span className="text-muted">&rarr;</span> <span>{s.dest}</span></div></td>
                <td style={{ padding: '1rem' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.risk}%`, height: '100%', backgroundColor: s.risk > 70 ? 'var(--color-critical)' : s.risk > 45 ? 'var(--color-warning)' : 'var(--color-success)' }}></div>
                    </div>
                    <span className="text-sm font-bold">{s.risk}/100</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {s.risk > 70 ? <span className="badge badge-critical flex items-center gap-1 w-max"><ShieldAlert size={12}/> Critical Alert</span> : 
                   s.risk > 45 ? <span className="badge badge-warning flex items-center gap-1 w-max"><ShieldAlert size={12}/> Warning</span> : 
                   <span className="badge badge-success flex items-center gap-1 w-max"><CheckCircle size={12}/> On Time</span>}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}><Clock size={12} className="inline mr-1" /> {s.time}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>View Analytics</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
