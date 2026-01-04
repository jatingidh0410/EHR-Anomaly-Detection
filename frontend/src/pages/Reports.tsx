import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDownloadLiveReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.downloadReport('live');
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EHR_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err: any) {
      setError('Failed to generate report. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-cyan-300">Security Reports</h1>
            <p className="text-navy-300 mt-2">Generate comprehensive PDF audits of system activity</p>
          </div>
        </div>

        {/* Generator Card */}
        <div className="card bg-gradient-to-br from-navy-800 to-navy-900 border-navy-600 mb-8">
           <div className="flex flex-col md:flex-row items-center gap-8 p-6">
              <div className="p-6 bg-navy-900 rounded-full border-4 border-navy-700">
                 <FileText size={64} className="text-cyan-400" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                 <h2 className="text-2xl font-bold text-white mb-2">Live System Audit</h2>
                 <p className="text-navy-300 max-w-xl">
                    Generate a real-time snapshot of the EHR security status. 
                    Includes current system health, statistical summaries, and a log of the last 10 critical alerts.
                 </p>
              </div>
              
              <button 
                onClick={handleDownloadLiveReport}
                disabled={loading}
                className="btn px-8 py-4 bg-copper-600 hover:bg-copper-700 text-white rounded-xl font-bold shadow-xl shadow-copper-900/50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                 {loading ? (
                    <>
                       <div className="spinner spinner-sm border-white"></div>
                       Generating PDF...
                    </>
                 ) : (
                    <>
                       <Download size={24} />
                       Download PDF Report
                    </>
                 )}
              </button>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="card border-navy-700 bg-navy-800/50">
              <div className="flex items-center gap-4 mb-4">
                 <ShieldCheck size={32} className="text-green-400" />
                 <div>
                    <h3 className="text-lg font-bold text-cyan-300">Compliance Ready</h3>
                    <p className="text-sm text-navy-400"> Meets HIPAA audit logging standards</p>
                 </div>
              </div>
           </div>
           
           <div className="card border-navy-700 bg-navy-800/50">
              <div className="flex items-center gap-4 mb-4">
                 <Activity size={32} className="text-blue-400" />
                 <div>
                    <h3 className="text-lg font-bold text-cyan-300">Real-Time Data</h3>
                    <p className="text-sm text-navy-400"> Fetches live stats from threat_detector.db</p>
                 </div>
              </div>
           </div>
        </div>

        {error && (
           <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center">
              {error}
           </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
