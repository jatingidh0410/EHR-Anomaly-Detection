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
  const [features, setFeatures] = useState<number[]>(Array(102).fill(0));
  
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Strategy State
  const [fillStrategy, setFillStrategy] = useState<FillStrategy>('random');
  
  const { normalizeFeatures, updateConfig } = useFeatureNormalization({
     fillStrategy
  });

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const strategy = e.target.value as FillStrategy;
    setFillStrategy(strategy);
    updateConfig({ fillStrategy: strategy });
  };

  const handleManualChange = (value: string) => {
      // Parse comma separated values, but DON'T pad immediately.
      // Allow the user to type freely.
      const parts = value.split(',').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
      setFeatures(parts);
  };
  
  const handleAutoFill = () => {
    // Strategy-specific behaviors for better UX
    
    if (fillStrategy === 'random') {
        // "Smart Random": Generates a Cohesive Scenario (Safe or Threat)
        // Overwrites existing data to provide a fresh test case
        const isThreat = Math.random() > 0.5;
        const base = new Array(102).fill(0);
        
        if (isThreat) {
            // GENERATE THREAT DATA
            // Reverting to MASSIVE values because the model clearly expects
            // DDoS-scale traffic (millions of bytes/packets) to trigger a threat.
            const attackType = Math.random() > 0.5 ? 'ddos' : 'brute';
            
            if (attackType === 'ddos') {
                // DDoS: EXTREME traffic on first 40 features
                for(let i=0; i<102; i++) {
                    if (i < 40) base[i] = 100000 + Math.random() * 500000; // 100k - 600k
                    else base[i] = Math.random() * 1000; // High noise
                }
            } else {
                // Brute Force: High traffic on specific login-related features
                for(let i=0; i<102; i++) {
                    if (i >= 40 && i < 60) base[i] = 5000 + Math.random() * 5000; // 5k - 10k
                    else base[i] = Math.random() * 500;
                }
            }
        } else {
            // GENERATE SAFE DATA
            // Range: 0 - 50 (Quiet, normal traffic)
            for(let i=0; i<102; i++) {
                base[i] = Math.random() * 50; 
            }
        }
        setFeatures(base);
        
    } else if (fillStrategy === 'zero') {
        // "Fill Zero": Explicitly RESET the form to all zeros
        // This ensures it works even if the form is already full
        setFeatures(Array(102).fill(0));
        
    } else {
        // "Fill Mean": PAD the remaining slots using mean of existing
        // This preserves user input and just fills the gaps
        const normalized = normalizeFeatures(features);
        setFeatures(normalized);
    }
  };

  const handlePredict = async () => {
    if (features.length === 0) {
      setError('Please enter at least one feature');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure we always send 102 features, padding if necessary
      // This handles cases where user types "0.5" and clicks Predict immediately
      const finalFeatures = normalizeFeatures(features);
      
      const response = await api.detectAnomaly(finalFeatures);

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
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* MANUAL INPUT FORM */}
              <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm text-navy-300">
                          Manual Feature Input (Comma Separated, 102 features)
                      </label>
                      <div className="flex items-center gap-3">
                          <select 
                             value={fillStrategy}
                             onChange={handleStrategyChange}
                             className="bg-navy-900 border border-navy-600 text-cyan-300 text-sm rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                          >
                             <option value="random">Fill Random</option>
                             <option value="zero">Fill Zero</option>
                             <option value="mean">Fill Mean</option>
                          </select>
                          <button 
                             onClick={handleAutoFill}
                             className="text-sm px-3 py-2 bg-navy-700 hover:bg-navy-600 border border-navy-500 rounded text-cyan-300 transition-colors"
                          >
                             Apply Auto-Fill
                          </button>
                      </div>
                  </div>
                  
                  <textarea
                      rows={6} 
                      value={features.join(', ')}
                      onChange={(e) => handleManualChange(e.target.value)}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-cyan-300 font-mono text-xs focus:border-copper-500 focus:outline-none"
                      placeholder="e.g. 0.5, 1.2, 0.0, ..."
                  />
                  <div className="mt-2 flex justify-between text-xs text-navy-400">
                      <span>Current Count: {features.length} / 102</span>
                  </div>
              </div>

              {/* ACTION BUTTONS */}
              <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full btn btn-primary bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 py-4 text-lg font-bold shadow-lg shadow-cyan-900/20 mb-8"
                >
                  {loading ? 'Analyzing Pattern...' : 'Run Analysis'}
              </button>

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
