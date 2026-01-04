import React, { useState } from 'react';
import { api } from '../services/api';
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setFile(files[0]);
    } else {
        setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.batch(file);
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Batch Analysis</h1>
      <p className="text-gray-400 mb-8">Upload CSV file for bulk threat analysis</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles && droppedFiles.length > 0) {
                const droppedFile = droppedFiles[0];
                if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                }
            }
            }}
            >
              <Upload className="text-blue-400 mb-2" size={32} />
              <label className="cursor-pointer">
                <span className="text-blue-400 hover:text-blue-300">Choose CSV file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">or drag and drop</p>
            </div>

            {file && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                <p className="text-white text-sm font-semibold">Selected File:</p>
                <p className="text-gray-400 text-sm mt-1">{file.name}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {loading ? 'Processing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <div className="flex gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-400" size={32} />
                  <h3 className="text-lg font-bold text-white">Analysis Complete</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Samples</span>
                    <span className="text-white font-bold">{results.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Threats Found</span>
                    <span className="text-red-400 font-bold">{results.threats || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-green-400 font-bold">{((results.accuracy || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
                  <Download size={18} />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
