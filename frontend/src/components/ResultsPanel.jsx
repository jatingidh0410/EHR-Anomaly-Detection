export default function ResultsPanel({ result, explainResult, onExplain, loading }) {
  if (!result) {
    return (
      <div className="card-base p-8 animate-fade-in flex flex-col items-center justify-center min-h-96">
        <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
        <p className="text-slate-400 text-center">Enter patient data and click "Detect Anomaly"</p>
      </div>
    );
  }

  const isAnomaly = result.predictions[0] === -1;

  return (
    <div className="card-base p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Prediction Result</h2>
      
      {/* Status Card */}
      <div className={`p-6 rounded-xl border mb-6 animate-slide-up ${
        isAnomaly 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-green-500/10 border-green-500/30'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Status</h3>
          <span className={`text-3xl font-bold ${isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
            {isAnomaly ? '🚨 ANOMALY' : '✅ NORMAL'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Prediction</p>
            <p className="text-xl font-mono font-bold text-cyan-400">{result.predictions[0]}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Anomaly Score</p>
            <p className={`text-xl font-mono font-bold ${isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
              {result.anomaly_scores[0].toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Confidence</p>
            <p className="text-xl font-mono font-bold text-blue-400">
              {Math.abs(result.anomaly_scores[0]).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Explain Button */}
      <button
        onClick={onExplain}
        className="w-full mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-smooth text-sm"
      >
        🔍 Explain Why?
      </button>

      {/* SHAP Results */}
      {explainResult && (
        <div className="p-6 bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl animate-slide-up">
          <h4 className="font-bold text-white mb-4">Feature Contributions</h4>
          <div className="space-y-2">
            {explainResult.top_features.map(([feature, impact], i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-slate-300 capitalize">{feature.replace('_', ' ')}</span>
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  Math.abs(impact) > 0.5 ? (impact < 0 ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300') :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {impact > 0 ? '+' : ''}{impact.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
