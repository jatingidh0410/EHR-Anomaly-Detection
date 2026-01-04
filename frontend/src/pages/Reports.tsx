import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

interface Report {
  id: string;
  name: string;
  created_at: string;
  total_records: number;
  threats_detected: number;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        setReports([
          {
            id: '1',
            name: 'January Report',
            created_at: new Date().toISOString(),
            total_records: 1500,
            threats_detected: 45,
          },
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (id: string) => {
    try {
      const response = await api.downloadReport(id);
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
    } catch (err) {
      setError('Failed to download report');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-cyan-300 mb-2">
          Reports
        </h1>
        <p className="text-navy-300 mb-8">
          Generated threat analysis reports
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-navy-300">Loading reports...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText
              size={48}
              className="mx-auto text-navy-500 mb-4"
            />
            <p className="text-navy-400">No reports available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-navy-800 rounded-lg p-6 border border-navy-600 hover:border-copper-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText size={24} className="text-cyan-400" />
                      <h3 className="text-lg font-semibold text-cyan-300">
                        {report.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-navy-400">Total Records</p>
                        <p className="text-cyan-300 font-semibold">
                          {report.total_records}
                        </p>
                      </div>
                      <div>
                        <p className="text-navy-400">Threats</p>
                        <p className="text-red-400 font-semibold">
                          {report.threats_detected}
                        </p>
                      </div>
                      <div>
                        <p className="text-navy-400">Date</p>
                        <p className="text-navy-300">
                          {new Date(
                            report.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="ml-4 px-4 py-2 bg-copper-600 hover:bg-copper-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
