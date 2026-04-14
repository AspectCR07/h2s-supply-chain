import React, { useState, useEffect } from 'react';
import { Activity, Database, Radio, Wifi, DatabaseZap, RefreshCcw } from 'lucide-react';

const mockSources = [
  { id: '1', source: 'NOAA Weather API', status: 'connected', events: 342, latency: '42ms' },
  { id: '3', source: 'Live Tracking Simulator API', status: 'connected', events: 4521, latency: '15ms' },
  { id: '4', source: 'Global Disruption DB (NewsAPI)', status: 'connected', events: 12, latency: '450ms' },
];

const DataIngestion = () => {
  const [logs, setLogs] = useState([]);
  const [waitTimes, setWaitTimes] = useState([]);
  const [fetchingInfra, setFetchingInfra] = useState(false);

  // Poll wait times from backend scraper
  useEffect(() => {
    setFetchingInfra(true);
    fetch("http://localhost:8000/api/infrastructure/wait-times")
      .then(res => res.json())
      .then(data => {
        if (data.congestion_data) {
           setWaitTimes(data.congestion_data);
        } else if (data.data) {
           // Fallback path
           setWaitTimes(data.data);
        }
      })
      .catch(err => console.error("Scraper failed:", err))
      .finally(() => setFetchingInfra(false));
  }, []);

  // Simulate terminal stream
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = `[${new Date().toISOString().split('T')[1].split('.')[0]}] LIVE STREAM: Incoming telemetry packet parsed...`;
        const updated = [newLog, ...prev];
        return updated.slice(0, 15);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex', height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><DatabaseZap color="var(--color-info)" /> Data Ingestion & Integration</h1>
          <p className="text-muted text-sm">Real-time telemetry and external API feeds routing to your ML model.</p>
        </div>
        <button className="btn"><Activity size={16} /> Run Diagnostics</button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ flexGrow: 1 }}>
        <div className="card flex-col gap-4">
          <h3 className="card-title">Connected Sources</h3>
          <div className="flex-col gap-3">
            {mockSources.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between p-3" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-card)', borderRadius: '50%' }}>
                    {feed.status === 'connected' ? <Wifi size={14} color="var(--color-success)" /> : <Radio size={14} color="var(--color-warning)" className="animate-pulse" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{feed.source}</div>
                    <div className="text-xs text-muted flex gap-2">
                       <span>{feed.events} msgs/min</span> &bull; <span>{feed.latency}</span>
                    </div>
                  </div>
                </div>
                <div className={`status-indicator ${feed.status === 'connected' ? 'status-success' : 'status-warning'}`}></div>
              </div>
            ))}
          </div>

          <h3 className="card-title mt-4">Live Infrastructure Scraper</h3>
          <p className="text-xs text-muted mb-2">BeautifulSoup polling the FastAPI `/api/infrastructure/wait-times` route:</p>
          <div className="flex-col gap-2">
            {fetchingInfra && <div className="text-xs flex items-center gap-2 text-warning"><RefreshCcw size={12} className="animate-spin"/> Scraping target...</div>}
            {!fetchingInfra && waitTimes.map((w, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-700 text-sm">
                 <span className="font-semibold">{w.port}</span>
                 <span className={`badge ${w.trend === 'critical' ? 'badge-critical' : 'badge-warning'}`}>{w.wait_time_minutes}m wait</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex-col gap-4" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title">Live Terminal Stream</h3>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.875rem', height: '100%', overflowY: 'hidden', border: '1px solid var(--border-color)', color: 'var(--color-success)' }}>
            {logs.map((log, index) => (
              <div key={index} style={{ opacity: 1 - index * 0.05, marginBottom: '0.25rem' }}>{log}</div>
            ))}
            {logs.length === 0 && <span className="animate-pulse">Awaiting incoming telemetry...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;
