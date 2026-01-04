import React, { useState } from 'react';
import Papa from 'papaparse';
import { AlertCircle, Upload, CheckCircle, Download } from 'lucide-react';
import { api } from '../services/api';
import { csvProcessor } from '../services/CsvProcessor';
import { normalizeFeaturesArray, type FillStrategy } from '../hooks/useFeatureNormalization';

interface BatchResult {
  row: number;
  prediction: number;
  confidence: number;
  threat_type: string;
}

const Batch: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [fillStrategy, setFillStrategy] = useState<FillStrategy>('random');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(f);
      setError('');
      setStats(null);
      setResults([]);
      
      // Analyze file immediately
      try {
        const result = await csvProcessor.processFile(f);
        setStats(result.stats);
        if (result.errors.length > 0) {
           // Show warnings but allow proceeding if valid rows exist
           console.warn('CSV Warnings:', result.errors);
        }
      } catch (err: any) {
        setError('Failed to parse CSV: ' + err.message);
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setProgress(10);
    setResults([]);

    try {
      // 1. Process and Normalize client-side
      const result = await csvProcessor.processFile(file);
      
      const normalizedData = result.data.map(row => 
        normalizeFeaturesArray(row, {
          totalRequired: 102,
          minValue: 0,
          maxValue: 1,
          fillStrategy: fillStrategy
        })
      );

      setProgress(30);

      // 2. Create a new CSV from normalized data to send to backend
      // Backend expects a file with normalized features
      const csvString = Papa.unparse(normalizedData);
      const normalizedFile = new File([csvString], "normalized_batch.csv", { type: "text/csv" });

      setProgress(50);

      // 3. Send to backend
      const response = await api.batchProcess(normalizedFile);
      const batchResults = Array.isArray(response.data.results) ? response.data.results : [];

      setResults(
        batchResults.map((r: any, i: number) => ({
          row: i + 1,
          prediction: r.prediction || 0,
          confidence: r.confidence || 0,
          threat_type: r.prediction === 1 ? 'THREAT' : 'BENIGN',
        }))
      );
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Batch processing failed');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    csvProcessor.exportToCsv({
      headers: ['Row', 'Prediction', 'Confidence', 'Type'],
      rows: results.map(r => [r.row, r.prediction, r.confidence.toFixed(4), r.threat_type]),
      filename: 'batch_analysis_results.csv'
    });
  };

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-cyan-300 mb-2">
          Batch Processing
        </h1>
        <p className="text-navy-300 mb-8">
          Upload CSV file for bulk threat analysis (Auto-normalized to 102 features)
        </p>

        <div className="card mb-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-cyan-300 mb-4">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-navy-600 rounded-lg p-8 text-center cursor-pointer hover:border-copper-500 transition-colors bg-navy-800/50">
              <Upload size={32} className="mx-auto mb-2 text-navy-400" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <p className="text-navy-300 mb-1">
                  {file
                    ? file.name
                    : 'Click to select or drag & drop'}
                </p>
                <p className="text-sm text-navy-400">
                  CSV format with numerical features
                </p>
              </label>
            </div>
          </div>

          {/* Configuration & Stats */}
          {stats && (
            <div className="mb-6 p-4 bg-navy-800 rounded-lg border border-navy-700">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                 <div className="text-sm">
                    <p className="text-cyan-300 font-semibold mb-1">File Stats:</p>
                    <ul className="text-navy-300 space-y-1">
                       <li>Rows: {stats.totalRows}</li>
                       <li>Valid Rows: {stats.validRows}</li>
                       <li>Features Detected: {stats.featureCount} {stats.featureCount < 102 && <span className="text-copper-400">(Will be padded to 102)</span>}</li>
                    </ul>
                 </div>
                 
                 <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm text-navy-300 mb-2">Normalization Strategy:</label>
                    <select 
                      value={fillStrategy}
                      onChange={(e) => setFillStrategy(e.target.value as FillStrategy)}
                      className="w-full bg-navy-900 border border-navy-600 text-cyan-300 rounded-lg p-2 focus:border-copper-500"
                    >
                      <option value="random">Random Fill</option>
                      <option value="zero">Zero Fill</option>
                      <option value="mean">Mean Fill</option>
                    </select>
                 </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-navy-300">
                  Processing...
                </p>
                <p className="text-sm text-cyan-300">
                  {progress}%
                </p>
              </div>
              <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-copper-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleProcess}
              disabled={!file || loading}
              className="flex-1 btn btn-primary bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Process CSV'}
            </button>
            {results.length > 0 && (
              <button
                onClick={downloadResults}
                className="flex-1 btn btn-primary bg-copper-600 hover:bg-copper-700"
              >
                <Download size={18} className="inline mr-2"/>
                Download Results
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle size={24} className="text-green-400" />
              <h2 className="text-2xl font-bold text-cyan-300">
                Results ({results.length} rows)
              </h2>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600">
                    <th className="text-left py-3 px-4 text-cyan-300">
                      Row
                    </th>
                    <th className="text-left py-3 px-4 text-cyan-300">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-cyan-300">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr
                      key={r.row}
                      className="border-b border-navy-700 hover:bg-navy-700/50"
                    >
                      <td className="py-3 px-4 text-navy-300">
                        {r.row}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            r.prediction === 1
                              ? 'badge-error'
                              : 'badge-success'
                          }`}
                        >
                          {r.threat_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-navy-300">
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Batch;
