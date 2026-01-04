import React, { useState } from 'react';
import { api } from '../services/api';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function ThreatDetection() {
  const [formData, setFormData] = useState({
    flow_duration: '1000',
    fwd_packets: '10',
    bwd_packets: '5',
    fwd_bytes: '500',
    bwd_bytes: '300'
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        flow_duration: parseFloat(formData.flow_duration),
        fwd_packets: parseFloat(formData.fwd_packets),
        bwd_packets: parseFloat(formData.bwd_packets),
        fwd_bytes: parseFloat(formData.fwd_bytes),
        bwd_bytes: parseFloat(formData.bwd_bytes)
      };

      const response = await api.detect(data);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Single Threat Detection</h1>
      <p className="text-gray-400 mb-8">Analyze network traffic for threat detection</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-6">Network Features</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              <Send size={18} />
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-1" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className={`border rounded-lg p-6 ${
              result.prediction === 1
                ? 'bg-red-900/20 border-red-700'
                : 'bg-green-900/20 border-green-700'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                {result.prediction === 1 ? (
                  <AlertCircle className="text-red-400" size={32} />
                ) : (
                  <CheckCircle className="text-green-400" size={32} />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">Analysis Result</h3>
                  <p className={result.prediction === 1 ? 'text-red-300' : 'text-green-300'}>
                    {result.prediction === 1 ? 'Threat Detected' : 'No Threat'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Confidence</p>
                  <div className="mt-1">
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          result.prediction === 1 ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-white font-bold mt-2">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <p className="text-gray-400 text-sm mb-2">Prediction Details</p>
                  <div className="bg-slate-800/50 rounded p-3">
                    <p className="text-white text-sm">
                      <span className="text-gray-400">Type:</span> {result.threat_type || 'Network Intrusion'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
