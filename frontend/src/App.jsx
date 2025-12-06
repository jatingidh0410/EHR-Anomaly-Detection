import { useState } from 'react';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import PredictionForm from './components/PredictionForm';
import ResultsPanel from './components/ResultsPanel';
import CSVUpload from './components/CSVUpload';
import Charts from './Charts';

function App() {
  const [result, setResult] = useState(null);
  const [explainResult, setExplainResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const predictAnomaly = async (formData) => {
    setLoading(true);
    setResult(null);
    setExplainResult(null);

    try {
      const response = await fetch('http://localhost:8000/anomaly/predict', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data: [formData]})
      });
      const data = await response.json();
      setResult(data);

      // Auto-save history
      fetch('http://localhost:8000/anomaly/history/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          timestamp: new Date().toLocaleTimeString(),
          age: formData.age,
          length_of_stay: formData.length_of_stay,
          prediction: data.predictions[0],
          anomaly_score: data.anomaly_scores[0]
        })
      }).catch(console.error);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const explainPrediction = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/anomaly/explain', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data: [formData]})
      });
      setExplainResult(await response.json());
    } catch (err) {
      console.error('Explain error:', err);
    }
  };

  const handleCSVUpload = async (formData) => {
    setCsvLoading(true);
    try {
      const response = await fetch('http://localhost:8000/anomaly/batch', {
        method: 'POST',
        body: formData
      });
      setBatchResult(await response.json());
    } catch (err) {
      console.error('CSV error:', err);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Charts */}
        <Charts />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatsCard icon="🏥" label="Live Status" value="Active" color="cyan" />
          <StatsCard icon="📊" label="Total Scans" value="∞" color="blue" />
          <StatsCard icon="✅" label="Normal Cases" value="+240" color="green" trend="↑ 12% this week" />
          <StatsCard icon="🚨" label="Anomalies" value="+18" color="red" trend="↓ 3% this week" />
        </div>

        {/* CSV Upload */}
        <div className="mb-12">
          <CSVUpload onUpload={handleCSVUpload} loading={csvLoading} result={batchResult} />
        </div>

        {/* Main Analysis */}
        <div className="grid lg:grid-cols-2 gap-8">
          <PredictionForm onPredict={predictAnomaly} loading={loading} />
          <ResultsPanel 
            result={result} 
            explainResult={explainResult}
            onExplain={() => result && explainPrediction({
              age: 60, length_of_stay: 5, num_icu_stays: 1, gender: 1,
              admission_type: 0, admission_location: 0, discharge_location: 0,
              insurance: 0, first_careunit: 0, last_careunit: 0
            })}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
