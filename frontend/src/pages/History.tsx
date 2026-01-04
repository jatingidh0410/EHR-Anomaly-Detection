import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, Download, Filter, AlertCircle } from 'lucide-react';

export default function History() {
  // Always initialize with empty arrays to prevent initial render crashes
  const [threats, setThreats] = useState<any[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter whenever dependencies change
  useEffect(() => {
    filterThreats();
  }, [searchTerm, severityFilter, threats]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.threats(1000);
      
      // ✅ CRITICAL FIX: Ensure response.data is actually an array
      // If backend sends { "message": "error" } or null, this prevents the crash.
      if (Array.isArray(response.data)) {
        setThreats(response.data);
      } else {
        console.warn("Backend returned non-array data:", response.data);
        setThreats([]); // Fallback to empty array
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setThreats([]); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  const filterThreats = () => {
    // ✅ CRITICAL FIX: Guard clause if threats is not an array
    if (!Array.isArray(threats)) {
      setFilteredThreats([]);
      return;
    }

    let filtered = threats;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.type && t.type.toLowerCase().includes(lowerTerm)) ||
        (t.source_ip && t.source_ip.includes(lowerTerm)) ||
        (t.timestamp && t.timestamp.includes(lowerTerm))
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(t => t.severity === severityFilter);
    }

    setFilteredThreats(filtered);
  };

  const handleExport = () => {
    if (filteredThreats.length === 0) return;
    
    // Simple CSV export logic
    const headers = ["Timestamp", "Type", "Source IP", "Confidence", "Severity"];
    const csvContent = [
      headers.join(","),
      ...filteredThreats.map(t => 
        [t.timestamp, t.type, t.source_ip, t.confidence, t.severity].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Threat History</h1>
        <p className="text-gray-400">View and search past detected threats</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by type, IP, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleExport}
              disabled={filteredThreats.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading history...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Source IP</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Confidence</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredThreats.length > 0 ? (
                    filteredThreats.map((threat, index) => (
                      <tr key={threat.id || index} className="hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          {threat.timestamp ? new Date(threat.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">{threat.type || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">{threat.source_ip || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full ${threat.confidence > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${(threat.confidence || 0) * 100}%` }}
                              />
                            </div>
                            <span>{((threat.confidence || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                            threat.severity === 'critical' ? 'bg-red-900/30 text-red-300 border border-red-900/50' :
                            threat.severity === 'warning' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-900/50' :
                            'bg-blue-900/30 text-blue-300 border border-blue-900/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              threat.severity === 'critical' ? 'bg-red-400' :
                              threat.severity === 'warning' ? 'bg-yellow-400' :
                              'bg-blue-400'
                            }`}></span>
                            {threat.severity ? threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1) : 'Info'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle size={32} className="opacity-50" />
                          <p>No threats found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-800 border-t border-slate-700 text-sm text-gray-400 flex justify-between items-center">
              <span>Showing {filteredThreats.length} of {threats.length} records</span>
              {threats.length > 1000 && (
                <span className="text-xs text-yellow-500/80">Display limited to last 1000 events</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}