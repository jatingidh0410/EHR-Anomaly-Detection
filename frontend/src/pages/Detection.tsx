import React, { useState } from 'react';
import { AlertCircle, Brain } from 'lucide-react';
import { api } from '../services/api';
import { useFeatureNormalization, type FillStrategy } from '../hooks/useFeatureNormalization';

interface PredictionResult {
  prediction: number;
  confidence: number;
  threat_type: string;
  models?: Record<string, any>;
}

const Detection: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('custom');
  const [features, setFeatures] = useState<number[]>(Array(102).fill(0));
  const [fillStrategy, setFillStrategy] = useState<FillStrategy>('random');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { normalizeFeatures, updateConfig } = useFeatureNormalization({
     fillStrategy
  });

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const strategy = e.target.value as FillStrategy;
    setFillStrategy(strategy);
    updateConfig({ fillStrategy: strategy });
  };


  const handleAutoFill = () => {
    const normalized = normalizeFeatures(features);
    setFeatures(normalized);
  };

  const handlePredict = async () => {
    if (features.length === 0) {
      setError('Please enter at least one feature');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalized = normalizeFeatures(features);
      const response = await api.detectAnomaly(normalized);

      setResult({
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        threat_type:
          response.data.prediction === 1 ? 'THREAT' : 'BENIGN',
        models: response.data.model_predictions,
      });
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-300 mb-2">
            Threat Detection
          </h1>
          <p className="text-navy-300">
            Analyze EHR records for anomalies and threats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-semibold text-cyan-300">
                  Feature Input
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-navy-300">Fill Strategy:</label>
                  <select 
                    value={fillStrategy}
                    onChange={handleStrategyChange}
                    className="bg-navy-700 border border-navy-600 text-cyan-300 text-sm rounded-lg p-2 focus:ring-copper-500 focus:border-copper-500"
                  >
                    <option value="random">Random</option>
                    <option value="zero">Zero Fill</option>
                    <option value="mean">Mean Fill</option>
                  </select>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* SCENARIO SELECTOR */}
              <div className="mb-6 bg-navy-800 p-4 rounded-lg border border-navy-700">
                <label className="block text-lg font-semibold text-cyan-300 mb-3">
                  <Brain size={20} className="inline mr-2" />
                  Select Simulation Scenario
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                     { id: 'normal', label: 'Normal Patient Access', desc: 'Standard physician record review', color: 'bg-green-500/10 border-green-500/30 hover:border-green-500' },
                     { id: 'ddos', label: 'High Traffic (DDoS)', desc: 'Rapid repeated requests from same IP', color: 'bg-red-500/10 border-red-500/30 hover:border-red-500' },
                     { id: 'mim', label: 'Man-in-the-Middle', desc: 'Intercepted packets with altered headers', color: 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500' },
                     { id: 'brute', label: 'Brute Force Login', desc: 'Multiple failed auth attempts', color: 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500' }
                   ].map(scenario => (
                     <div 
                        key={scenario.id}
                        onClick={() => {
                           setSelectedScenario(scenario.id);
                           // Mock feature generation logic for demo
                           const base = Array(102).fill(0);
                           if (scenario.id === 'normal') {
                              // Low entropy, normal values
                              setFeatures(base.map(() => Math.random() * 0.1));
                           } else if (scenario.id === 'ddos') {
                              // High packet counts (features 0-10)
                              setFeatures(base.map((_, i) => i < 10 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1));
                           } else if (scenario.id === 'mim') {
                              // Abnormal protocol flags
                              setFeatures(base.map((_, i) => i > 50 && i < 60 ? 0.9 : Math.random() * 0.2));
                           } else {
                              // Random noise
                              setFeatures(base.map(() => Math.random()));
                           }
                        }}
                        className={`cursor-pointer border rounded-lg p-4 transition-all ${selectedScenario === scenario.id ? 'ring-2 ring-cyan-400 bg-navy-700' : ''} ${scenario.color}`}
                     >
                        <h3 className="font-bold text-gray-200">{scenario.label}</h3>
                        <p className="text-xs text-gray-400 mt-1">{scenario.desc}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Advanced (Hidden by default or minimized) */}
              <div className="mb-6">
                <details className="text-sm text-navy-400 cursor-pointer">
                  <summary className="hover:text-cyan-300 transition-colors">Advanced: View Raw Features Vector</summary>
                  <div className="mt-4 p-2 bg-navy-900 rounded font-mono text-xs break-all border border-navy-700">
                    [{features.slice(0, 10).map(n => n.toFixed(2)).join(', ')} ... {features.length} total]
                  </div>
                </details>
              </div>

              {/* Status */}
              <div className="mb-6 p-3 bg-navy-800 rounded-lg border border-navy-700">
                <p className="text-sm text-navy-300">
                  <span className="text-cyan-300 font-semibold">
                    {features.length}
                  </span>
                  {' '}
                  features provided
                  {features.length < 102 && (
                    <>
                      {' '}
                      •{' '}
                      <span className="text-copper-400 font-semibold">
                        {102 - features.length}
                      </span>
                      {' '}
                      will be auto-filled using <span className="text-copper-400 font-semibold uppercase">{fillStrategy}</span> strategy
                    </>
                  )}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAutoFill}
                  className="flex-1 btn btn-primary bg-copper-600 hover:bg-copper-700"
                >
                  Auto-Fill to 102
                </button>
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="flex-1 btn btn-primary bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Predict'}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div>
            {result ? (
              <div className="bg-navy-800 rounded-lg p-6 border border-navy-600">
                <div className="flex items-center gap-3 mb-4">
                  <Brain size={24} className="text-cyan-400" />
                  <h3 className="text-lg font-semibold text-cyan-300">
                    Result
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-navy-400 mb-1">Status</p>
                    <p
                      className={`text-2xl font-bold ${
                        result.prediction === 1
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {result.threat_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-navy-400 mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-copper-500"
                          style={{
                            width: `${
                              result.confidence * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-cyan-300 font-semibold text-sm">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {result.models && (
                    <div>
                      <p className="text-sm text-navy-400 mb-2">
                        Model Votes
                      </p>
                      <div className="space-y-2">
                        {Object.entries(
                          result.models
                        ).map(([model, vote]: any) => (
                          <div
                            key={model}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-navy-300">
                              {model}
                            </span>
                            <span
                              className={
                                vote === 1
                                  ? 'text-red-400'
                                  : 'text-green-400'
                              }
                            >
                              {vote === 1 ? 'Threat' : 'Benign'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-navy-800 rounded-lg p-6 border border-navy-600 text-center text-navy-400">
                <p>Enter features and click Predict</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
