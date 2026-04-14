import React, { useState, useEffect } from 'react';
import { Network, Search, FileText, BarChart2, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Explainability = () => {
  const [activeId, setActiveId] = useState('SHP-1042');
  const [inputVal, setInputVal] = useState('SHP-1042');
  const [loading, setLoading] = useState(false);
  const [explainData, setExplainData] = useState(null);

  const fetchExplain = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/ml/explain", {
       method: "POST",
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ shipment_id: inputVal })
    })
    .then(res => res.json())
    .then(data => {
       setActiveId(data.shipment_id);
       setExplainData(data);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExplain(); // Fetch initial SHAP details on mount
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex', height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Network color="var(--color-success)" /> AI Explainability (SHAP Context)</h1>
          <p className="text-muted text-sm">Deconstruct the exact features driving the AI's risk probability for transparency.</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
           <input 
             type="text" 
             value={inputVal}
             onChange={(e) => setInputVal(e.target.value)}
             className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm w-48 text-white focus:outline-none focus:border-blue-500"
             placeholder="Enter Shipment ID..."
           />
           <button onClick={fetchExplain} className="btn btn-secondary flex items-center gap-2">
             {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Search size={14} />} Analyze
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ flexGrow: 1 }}>
        <div className="card flex-col gap-4">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2"><BarChart2 size={16} /> XGBoost Feature Impact Matrix</h3>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center h-full text-muted"><RefreshCcw className="animate-spin mr-2"/> Explaining Neural Weights...</div>
          ) : explainData ? (
             <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={explainData.shap_values} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="var(--text-muted)" fontSize={11} width={130} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                    <Bar dataKey="impact" name="Risk Vector Magnitude" radius={[0, 4, 4, 0]}>
                      {explainData.shap_values.map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.value > 0 ? 'var(--color-critical)' : 'var(--color-success)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
          ) : <div className="text-muted">No data available</div>}
          
          <div className="flex justify-between text-xs text-muted px-4 mt-2">
            <span className="flex items-center gap-2"><span style={{ width: 10, height: 10, backgroundColor: 'var(--color-success)', borderRadius: '2px' }}></span> Reduces Risk (On Time)</span>
            <span className="flex items-center gap-2"><span style={{ width: 10, height: 10, backgroundColor: 'var(--color-critical)', borderRadius: '2px' }}></span> Increases Risk (Delay)</span>
          </div>
        </div>

        <div className="card flex-col gap-4">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2"><FileText size={16} /> Plain-English Interpretation</h3>
          </div>
          
          {loading ? (
             <div className="text-muted">Fetching AI generation...</div>
          ) : explainData ? (
            <div className="flex-col gap-6 p-4 rounded-lg bg-slate-900 border border-slate-700">
               <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl" style={{ borderColor: explainData.base_probability > 70 ? 'var(--color-critical)' : 'var(--color-warning)', color: explainData.base_probability > 70 ? 'var(--color-critical)' : 'var(--color-warning)' }}>
                     {explainData.base_probability}%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Base Probability of Delay</h3>
                    <p className="text-sm text-slate-400">Target ID: {explainData.shipment_id}</p>
                  </div>
               </div>
               
               <p className="leading-relaxed mt-4 text-slate-300">
                 {explainData.human_readable}
               </p>
               
               <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between">
                 <button className="btn">Deploy Mitigation Workflow</button>
                 <button className="btn btn-secondary">Accept Risk</button>
               </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Explainability;
