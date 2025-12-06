import { useState, useEffect } from "react";

const Charts = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ anomalies: 0, total: 0, rate: 0 });
  const [loading, setLoading] = useState(true);

  // Load history on mount + every 5s
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/anomaly/history');
        const data = await res.json();
        setHistory(data);
        
        // Calculate stats
        const anomalies = data.filter(h => h.prediction === -1).length;
        const total = data.length;
        setStats({
          anomalies,
          total,
          rate: total > 0 ? ((anomalies / total) * 100).toFixed(1) : 0
        });
        setLoading(false);
      } catch (err) {
        console.error('Charts error:', err);
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && history.length === 0) {
    return (
      <div className="card-base p-8 mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-slate-300">Loading live data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          📈 Live Anomaly Trends
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></span>
        </h2>
        <span className="text-xs text-slate-400">Last {history.length} scans</span>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Anomalies Card */}
        <div className="card-base p-6 bg-linear-to-br from-red-500/10 to-rose-500/10 border-red-500/30 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Anomalies (24h)</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.anomalies}</p>
            </div>
            <span className="text-4xl">🚨</span>
          </div>
          {history.length > 0 && (
            <p className="text-xs text-slate-400 mt-3">
              {stats.rate}% anomaly rate
            </p>
          )}
        </div>

        {/* Total Scans Card */}
        <div className="card-base p-6 bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Total Scans</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.total}</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
          {history.length > 0 && (
            <p className="text-xs text-slate-400 mt-3">
              Updated live
            </p>
          )}
        </div>

        {/* Normal Cases Card */}
        <div className="card-base p-6 bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Normal Cases</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.total - stats.anomalies}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
          {history.length > 0 && (
            <p className="text-xs text-slate-400 mt-3">
              {((((stats.total - stats.anomalies) / stats.total) * 100) || 0).toFixed(1)}% healthy
            </p>
          )}
        </div>

        {/* Anomaly Rate Card */}
        <div className="card-base p-6 bg-linear-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-medium">Anomaly Rate</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.rate}%</p>
            </div>
            <span className="text-4xl">📉</span>
          </div>
          {history.length > 0 && (
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div 
                className="bg-linear-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.rate, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent History Table */}
      {history.length > 0 && (
        <div className="card-base overflow-hidden animate-fade-in">
          <div className="px-6 py-4 bg-slate-700/50 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Scans</h3>
            <span className="text-xs text-slate-400">{history.length} records</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">LOS (days)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {history.slice(0, 10).map((entry, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{entry.timestamp}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{entry.age}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{entry.length_of_stay}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.prediction === -1 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {entry.prediction === -1 ? '🚨 ANOMALY' : '✅ NORMAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-cyan-400">{entry.anomaly_score?.toFixed(4) || '0.0000'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 && !loading && (
        <div className="card-base p-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <span className="text-5xl mb-4">📭</span>
          <h3 className="text-xl font-semibold text-white mb-2">No Predictions Yet</h3>
          <p className="text-slate-400">Make a prediction to start tracking history</p>
        </div>
      )}
    </div>
  );
};

export default Charts;
