import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingUp, Anchor, CloudLightning, RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// We will use state for chartData now

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch live Forecast
    fetch("http://localhost:8000/api/ml/forecast")
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
           setChartData(data.forecast);
        }
      })
      .catch(err => console.error("Forecast API Error:", err));
    // Fetch LIVE Logistics News from the FastAPI backend to populate disruption alerts
    fetch("http://localhost:8000/api/news/")
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.news) {
          const formattedAlerts = data.news.map((item, index) => ({
            id: `NEWS-${Math.floor(Math.random() * 9000) + 1000}`,
            severity: index === 0 ? 'critical' : 'warning',
            reason: item.title,
            eta: item.source || 'Global Feed',
            url: item.url
          }));
          setAlerts(formattedAlerts);
        } else {
          // Fallback if API keys aren't set
          setAlerts([{ id: 'ERR-500', severity: 'warning', reason: 'Failed to authenticate NewsAPI. Please check your backend .env file.', eta: 'Offline' }]);
        }
      })
      .catch(err => {
        console.error(err);
        setAlerts([{ id: 'SYS-OFF', severity: 'critical', reason: 'Could not connect to FastAPI /api/news interface. Is uvicorn running?', eta: 'Offline' }]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Global Operations Overview</h1>
          <p className="text-muted text-sm">Real-time risk aggregation across 4,203 active shipments.</p>
        </div>
        <button className="btn">Generate Report</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Shipments', value: '4,203', icon: <Package size={20} color="var(--color-info)" />, trend: '+12% from last week' },
          { label: 'At Risk (High)', value: '18', icon: <AlertTriangle size={20} color="var(--color-critical)" />, trend: 'Requires immediate action' },
          { label: 'Predicted Delays', value: '142', icon: <TrendingUp size={20} color="var(--color-warning)" />, trend: 'Avg. 2.4 days' },
          { label: 'Optimization Savings', value: '$1.2M', icon: <Anchor size={20} color="var(--color-success)" />, trend: 'YTD Carbon: -420T' }
        ].map((kpi, i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium">{kpi.label}</h4>
              <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                {kpi.icon}
              </div>
            </div>
            <h2 className="text-2xl font-bold">{kpi.value}</h2>
            <p className="text-xs text-muted mt-2">{kpi.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Network Risk Forecast (Next 7 Days)</h3>
            <span className="badge badge-info">AI Predicted</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.length === 0 ? (
               <div className="flex justify-center items-center h-full text-muted"><RefreshCcw className="animate-spin mr-2"/> Rendering AI Network Forecast...</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="risk" stroke="var(--color-critical)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-critical)' }} activeDot={{ r: 6, fill: 'var(--bg-main)', stroke: 'var(--color-critical)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Disruption Stream via FastAPI */}
        <div className="card flex-col gap-4">
          <div className="card-header">
            <h3 className="card-title"><CloudLightning size={20} color="var(--color-warning)" /> LIVE: NewsAPI Disruptions</h3>
          </div>
          
          <div className="flex-col gap-3" style={{ flexGrow: 1, overflowY: 'auto' }}>
            {loading && <div className="flex items-center gap-2 justify-center h-full text-muted"><RefreshCcw className="animate-spin" size={16}/> Polling FastAPI...</div>}
            
            {!loading && alerts.map((alert, i) => (
              <div key={i} className="flex-col gap-2 p-3" style={{ border: `1px solid ${alert.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'}`, borderRadius: 'var(--radius-md)', backgroundColor: alert.severity === 'critical' ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)' }}>
                <div className="flex justify-between items-center">
                  <span className={`badge ${alert.severity === 'critical' ? 'badge-critical' : 'badge-warning'}`}>{alert.id}</span>
                  <span className="text-xs font-bold" style={{ color: alert.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)' }}>{alert.eta}</span>
                </div>
                <p className="text-sm">{alert.reason}</p>
                <div className="flex gap-2 mt-2">
                  <a href={alert.url} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '100%', textAlign: 'center' }}>Read Source</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
