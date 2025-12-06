import { useState, useEffect } from "react";

const Charts = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({anomalies: 0, total: 0, rate: 0});

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
      } catch (err) {
        console.error('Charts error:', err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 Live Anomaly Trends</h3>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.anomalies}</div>
          <div className="text-sm text-gray-600 mt-1">Anomalies (24h)</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Scans</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.rate}%</div>
          <div className="text-sm text-gray-600 mt-1">Anomaly Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{history.length}</div>
          <div className="text-sm text-gray-600 mt-1">History Points</div>
        </div>
      </div>
      
      {/* Recent History Table */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b font-semibold text-gray-900">
            Recent Scans ({history.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">LOS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.slice(0, 8).map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.timestamp}</td>
                    <td className="px-4 py-3 text-sm font-medium">{entry.age}</td>
                    <td className="px-4 py-3 text-sm">{entry.length_of_stay}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.prediction === -1 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.prediction === -1 ? 'ANOMALY' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
