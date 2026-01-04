import React, { useEffect, useState } from 'react';
// import { AlertCircle, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

interface AdminMetrics {
  modelAccuracy: number;
  avgConfidence: number;
  totalThreats: number;
  totalBenign: number;
  perModelAccuracy: Record<string, number>;
  processingStats: {
    avgTime: number;
    totalProcessed: number;
  };
}

const Admin: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch admin metrics
   */
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await api.adminMetrics();
        const data = response.data || {};

        setMetrics({
          modelAccuracy: data.model_accuracy || 0,
          avgConfidence: data.avg_confidence || 0,
          totalThreats: data.total_threats || 0,
          totalBenign: data.total_benign || 0,
          perModelAccuracy: data.per_model_accuracy || {},
          processingStats: {
            avgTime: data.avg_processing_time || 0,
            totalProcessed: data.total_processed || 0,
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to load admin metrics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!isMounted) return;
      await fetchMetrics();
      if (isMounted) {
        timerId = setTimeout(poll, 10000); // Refresh every 10s
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex-center">
        <div className="text-center">
          <div className="spinner spinner-lg mb-4 mx-auto" />
          <p className="text-navy-300">Loading admin metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex-center">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchMetrics}
            className="btn btn-primary w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const modelData = Object.entries(metrics.perModelAccuracy).map(
    ([model, accuracy]) => ({
      model: model.replace('_', ' '),
      accuracy: Math.round(accuracy as number * 100),
    })
  );

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-cyan-300 mb-8">
          Admin Panel
        </h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Model Accuracy',
              value: `${(metrics.modelAccuracy * 100).toFixed(2)}%`,
              subtext: 'Overall accuracy',
            },
            {
              label: 'Avg Confidence',
              value: `${(metrics.avgConfidence * 100).toFixed(2)}%`,
              subtext: 'Prediction confidence',
            },
            {
              label: 'Threats Detected',
              value: metrics.totalThreats,
              subtext: 'Total threats',
            },
            {
              label: 'Benign Samples',
              value: metrics.totalBenign,
              subtext: 'Non-threat samples',
            },
          ].map((m, i) => (
            <div key={i} className="card">
              <p className="text-navy-400 text-sm">{m.label}</p>
              <p className="text-3xl font-bold text-cyan-300 mt-2">
                {m.value}
              </p>
              <p className="text-navy-400 text-xs mt-2">{m.subtext}</p>
            </div>
          ))}
        </div>

        {/* Per-Model Accuracy Chart */}
        {modelData.length > 0 && (
          <div className="card mb-8">
            <h2 className="card-title mb-6">Per-Model Accuracy</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="model" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#964734" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Processing Stats */}
        <div className="card">
          <h2 className="card-title mb-6">Processing Statistics</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-navy-400 text-sm mb-2">Avg Processing Time</p>
              <p className="text-2xl font-bold text-copper-400">
                {metrics.processingStats.avgTime.toFixed(2)}ms
              </p>
            </div>
            <div>
              <p className="text-navy-400 text-sm mb-2">Total Processed</p>
              <p className="text-2xl font-bold text-cyan-300">
                {metrics.processingStats.totalProcessed}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
