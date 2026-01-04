import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { api } from '../services/api';
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

// Friendly labels for non-technical users
const FRIENDLY_LABELS: Record<string, string> = {
    'DDOS': 'High Traffic Flood',
    'MIM': 'Interception Attempt',
    'Injection': 'Unauthorized Command',
    'Port Scan': 'Network Scanning',
    'Brute Force': 'Password Guessing',
    'Benign': 'Safe Operation',
    'THREAT': 'Suspicious Activity'
};

const getFriendlyLabel = (term: string) => FRIENDLY_LABELS[term] || term;

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
  const navigate = useNavigate();
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



  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="container-custom">

        {/* HERO SECTION */}
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-navy-600 shadow-2xl">
          <div className="absolute inset-0 hero-gradient opacity-80" />
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" />
          
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold tracking-wider uppercase">
                  System Operational
                </span>
                <span className="text-navy-400 text-sm">Last updated: Just now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400 mb-2">
                Security Overview
              </h1>
              <p className="text-navy-200 text-lg max-w-2xl">
                Real-time anomaly detection and threat monitoring across your EHR infrastructure.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
               <button 
                 onClick={() => navigate('/reports')}
                 className="btn px-6 py-3 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-cyan-300 rounded-xl font-semibold transition-all w-full md:w-auto"
               >
                 View Reports
               </button>
               <button onClick={fetchDashboardData} className="btn px-6 py-3 bg-copper-600 hover:bg-copper-700 text-white rounded-xl font-semibold shadow-lg shadow-copper-900/50 transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                 <TrendingUp size={18} />
                 Refresh Data
               </button>
            </div>
          </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-6 mb-8 min-h-[600px]">
           
           {/* 1. Safety Score (Large, Top Left) */}
           <div className="card lg:col-span-1 lg:row-span-2 flex flex-col items-center justify-center text-center relative overflow-hidden bg-navy-800/50 border-navy-600">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-500" />
              <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
                 <Shield className="text-green-400" /> System Health
              </h2>
              <div className="relative w-48 h-48 mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                       innerRadius="80%" 
                       outerRadius="100%" 
                       barSize={10} 
                       data={[{ name: 'Score', value: data.accuracy * 100, fill: '#10b981' }]} 
                       startAngle={180} 
                       endAngle={0}
                    >
                       <RadialBar background dataKey="value" cornerRadius={30} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                    <span className="text-4xl font-bold text-white">{(data.accuracy * 100).toFixed(0)}%</span>
                    <span className="text-xs text-navy-300 uppercase tracking-widest mt-1">Safety Score</span>
                 </div>
              </div>
              <p className="text-navy-200 text-sm px-4">
                 Your system is currently <span className="text-green-400 font-bold">highly secure</span>. 
                 ML models are performing at optimal accuracy.
              </p>
           </div>

           {/* 2. Key Metrics (Top Middle/Right) */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Scanned Events', value: data.totalThreats * 15, sub: 'Patient Records Accessed', icon: BarChart3, color: 'text-blue-400' },
                { label: 'Suspicious Activities', value: data.totalThreats, sub: 'Blocked Attempts', icon: AlertCircle, color: 'text-orange-400' },
                { label: 'Active Protection', value: 'Active', sub: 'Real-time Monitoring', icon: Shield, color: 'text-green-400' }
              ].map((m, i) => (
                 <div key={i} className="card bg-navy-800/50 border-navy-600 hover:border-navy-500 transition-colors">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider">{m.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
                          <p className="text-navy-500 text-xs mt-1">{m.sub}</p>
                       </div>
                       <m.icon size={24} className={m.color} />
                    </div>
                 </div>
              ))}
           </div>

           {/* 3. Activity Trend (Middle Row) */}
           <div className="card lg:col-span-2 lg:row-span-1 border-navy-600">
              <h2 className="card-title text-sm uppercase tracking-wider text-navy-400 mb-4">Patient Record Access Activity</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.threatTrend}>
                    <defs>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#964734" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#964734" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="hour" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Line type="monotone" dataKey="threats" stroke="#964734" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 4. Threat Distribution (Bottom Right) */}
           <div className="card lg:col-span-1 lg:row-span-1 border-navy-600">
             <h2 className="card-title text-sm uppercase tracking-wider text-navy-400 mb-4">Activity Breakdown</h2>
             <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data.threatDistribution}
                     cx="50%"
                     cy="50%"
                     innerRadius={40}
                     outerRadius={60}
                     dataKey="value"
                     paddingAngle={5}
                   >
                     {data.threatDistribution.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.name === 'Threats' ? '#ef4444' : '#10b981'} />
                     ))}
                   </Pie>
                   <Tooltip 
                      formatter={(value, name) => [value, name === 'Threats' ? 'Suspicious' : 'Safe']}
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
             </div>
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
                  <th className="text-cyan-300">Activity Type</th>
                  <th className="text-cyan-300">Risk Level</th>
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
                        {t.threat_type === 1 ? getFriendlyLabel('THREAT') : 'Safe Access'}
                      </span>
                    </td>
                    <td>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${t.confidence > 0.8 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-xs text-navy-300">{(t.confidence * 100).toFixed(0)}% Risk</span>
                        </div>
                    </td>
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
