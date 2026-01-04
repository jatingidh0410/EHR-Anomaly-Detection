import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { api } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface DashboardData {
  totalThreats: number;
  threatsToday: number;
  accuracy: number;
  avgConfidence: number;
  recentThreats: any[];
  threatTrend: any[];
  threatDistribution: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch dashboard data with comprehensive error handling
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data concurrently with timeout
      const controllers = {
        stats: new AbortController(),
        threats: new AbortController(),
      };

      const timeoutIds = [
        setTimeout(() => controllers.stats.abort(), 30000),
        setTimeout(() => controllers.threats.abort(), 30000),
      ];

      try {
        const [statsRes, threatsRes] = await Promise.all([
          api.dashboardStats(),
          api.threats(10),
        ]);

        // Safe data extraction
        const threats = Array.isArray(threatsRes.data) ? threatsRes.data : [];
        const stats = statsRes.data || {};

        setData({
          totalThreats: stats.total_threats || 0,
          threatsToday: stats.threats_today || 0,
          accuracy: stats.model_accuracy || 0,
          avgConfidence: stats.avg_confidence || 0,
          recentThreats: threats.slice(0, 10),
          threatTrend: generateTrendData(threats),
          threatDistribution: [
            {
              name: 'Threats',
              value: threats.filter((t: any) => t.threat_type === 1).length,
            },
            {
              name: 'Benign',
              value: threats.filter(t => t.threat_type === 0).length,
            },
          ],
        });
      } finally {
        timeoutIds.forEach(id => clearTimeout(id));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate trend data from threats
   */
  const generateTrendData = (threats: any[]) => {
    const hourlyData: Record<string, number> = {};
    
    threats.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      threats: hourlyData[i] || 0,
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex-center">
        <div className="text-center">
          <div className="spinner spinner-lg mb-4 mx-auto" />
          <p className="text-navy-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex-center">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-cyan-300 mb-8">Dashboard</h1>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Threats',
              value: data.totalThreats,
              icon: AlertCircle,
              color: 'text-red-400',
            },
            {
              label: 'Today',
              value: data.threatsToday,
              icon: TrendingUp,
              color: 'text-orange-400',
            },
            {
              label: 'Model Accuracy',
              value: `${(data.accuracy * 100).toFixed(1)}%`,
              icon: Shield,
              color: 'text-green-400',
            },
            {
              label: 'Avg Confidence',
              value: `${(data.avgConfidence * 100).toFixed(1)}%`,
              icon: BarChart3,
              color: 'text-blue-400',
            },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-navy-400 text-sm">{metric.label}</p>
                    <p className="text-3xl font-bold text-cyan-300 mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <Icon size={32} className={metric.color + ' opacity-50'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Threat Trend */}
          <div className="lg:col-span-2 card">
            <h2 className="card-title mb-6">Threat Trend (24h)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.threatTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="#964734"
                  strokeWidth={2}
                  dot={{ fill: '#964734' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Threat Distribution */}
          <div className="card">
            <h2 className="card-title mb-6">Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Threats */}
        <div className="card">
          <h2 className="card-title mb-6">Recent Threats</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-navy-700">
                  <th className="text-cyan-300">ID</th>
                  <th className="text-cyan-300">Type</th>
                  <th className="text-cyan-300">Confidence</th>
                  <th className="text-cyan-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentThreats.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-sm">{t.id}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.threat_type === 1
                            ? 'badge-error'
                            : 'badge-success'
                        }`}
                      >
                        {t.threat_type === 1 ? 'THREAT' : 'BENIGN'}
                      </span>
                    </td>
                    <td>{(t.confidence * 100).toFixed(1)}%</td>
                    <td className="text-navy-400 text-sm">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
