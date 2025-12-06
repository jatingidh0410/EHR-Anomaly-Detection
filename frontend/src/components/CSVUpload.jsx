import { useState } from 'react';

export default function CSVUpload({ onUpload, loading, result }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    onUpload(formData);
  };

  return (
    <div className="card-base p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">📊 Batch CSV Analysis</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])}
          className="input-base"
        />
        <button
          onClick={handleUpload} disabled={!file || loading}
          className="btn-primary disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '⏳ Processing...' : '🚀 Analyze CSV'}
        </button>
      </div>

      {result && (
        <div className="grid md:grid-cols-3 gap-4 p-6 bg-linear-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl animate-slide-up">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{result.num_anomalies}</div>
            <div className="text-sm text-slate-400 mt-1">Anomalies Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{result.anomaly_rate}</div>
            <div className="text-sm text-slate-400 mt-1">Anomaly Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{result.total_records}</div>
            <div className="text-sm text-slate-400 mt-1">Total Records</div>
          </div>
        </div>
      )}
    </div>
  );
}
