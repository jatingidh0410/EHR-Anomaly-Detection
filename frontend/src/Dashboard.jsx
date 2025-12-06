import { useState } from "react";
import Charts from "./Charts";

const Dashboard = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: 60,
    length_of_stay: 5,
    num_icu_stays: 1,
    gender: 1,
    admission_type: 0,
    admission_location: 0,
    discharge_location: 0,
    insurance: 0,
    first_careunit: 0,
    last_careunit: 0,
  });
  const [explainResult, setExplainResult] = useState(null); // ← ADD THIS LINE

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  // 🔴 TEST BUTTONS - QUICK DATA ENTRY
  const testNormal = () => {
    setFormData({
      age: 65,
      length_of_stay: 4,
      num_icu_stays: 1,
      gender: 1,
      admission_type: 0,
      admission_location: 0,
      discharge_location: 0,
      insurance: 0,
      first_careunit: 0,
      last_careunit: 0,
    });
  };

  const testAnomaly = () => {
    setFormData({
      age: 5,
      length_of_stay: 100,
      num_icu_stays: 10,
      gender: 1,
      admission_type: 0,
      admission_location: 0,
      discharge_location: 0,
      insurance: 0,
      first_careunit: 0,
      last_careunit: 0,
    });
  };

  const testRandom = () => {
    setFormData({
      age: Math.floor(Math.random() * 80) + 20,
      length_of_stay: Math.floor(Math.random() * 20) + 1,
      num_icu_stays: Math.floor(Math.random() * 3),
      gender: Math.floor(Math.random() * 2),
      admission_type: Math.floor(Math.random() * 5),
      admission_location: Math.floor(Math.random() * 10),
      discharge_location: Math.floor(Math.random() * 5),
      insurance: Math.floor(Math.random() * 3),
      first_careunit: Math.floor(Math.random() * 5),
      last_careunit: Math.floor(Math.random() * 5),
    });
  };
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setBatchLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch("http://localhost:8000/anomaly/batch", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setBatchResult(data);
    } catch (err) {
      setBatchResult({ error: err.message });
    } finally {
      setBatchLoading(false);
    }
  };
  const explainPrediction = async (patientData) => {
    // ← ADD THIS WHOLE FUNCTION
    try {
      const response = await fetch("http://localhost:8000/anomaly/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [patientData] }),
      });
      setExplainResult(await response.json());
    } catch (err) {
      console.error("Explain error:", err);
    }
  };

  // const predictAnomaly = async () => {
  //   setLoading(true);
  //   setError("");
  //   setResult(null);

  //   try {
  //     const response = await fetch("http://localhost:8000/anomaly/predict", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ data: [formData] }),
  //     });

  //     if (!response.ok) throw new Error(`API Error: ${response.status}`);
  //     const data = await response.json();
  //     setResult(data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const predictAnomaly = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/anomaly/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [formData] }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      setResult(data);

      // 🚀 AUTO-SAVE TO HISTORY (NEW)
      fetch("http://localhost:8000/anomaly/history/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toLocaleTimeString(),
          age: formData.age,
          length_of_stay: formData.length_of_stay,
          prediction: data.predictions[0],
          anomaly_score: data.anomaly_scores[0],
        }),
      }).catch(console.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (prediction) => {
    return prediction === 1
      ? "text-green-600 border-green-200 bg-green-50"
      : "text-red-600 border-red-200 bg-red-50";
  };

  const getStatusText = (prediction) => {
    return prediction === 1 ? "✅ NORMAL" : "🚨 ANOMALY";
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          EHR Anomaly Detection
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time patient record monitoring with Isolation Forest (MIMIC-III)
        </p>
      </div>
      {/* Header closing */}
      <Charts /> {/* ADD THIS SINGLE LINE */}
      <div className="mb-12 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📊 Batch CSV Analysis
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleCsvUpload}
            disabled={!csvFile || batchLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchLoading ? "⏳ Analyzing..." : "🚀 Process CSV"}
          </button>
        </div>

        {batchResult && (
          <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {batchResult.num_anomalies}
                </div>
                <div className="text-sm text-gray-600 mt-1">Anomalies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {batchResult.anomaly_rate}
                </div>
                <div className="text-sm text-gray-600 mt-1">Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {batchResult.total_records}
                </div>
                <div className="text-sm text-gray-600 mt-1">Records</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ✅ INPUT FORM - FULLY INTERACTIVE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Patient Record
          </h2>

          <div className="space-y-4 mb-6">
            {/* Primary Fields - TYPE HERE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="0"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length of Stay
              </label>
              <input
                type="number"
                name="length_of_stay"
                value={formData.length_of_stay}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="0"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ICU Stays
                </label>
                <input
                  type="number"
                  name="num_icu_stays"
                  value={formData.num_icu_stays}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender (0/1)
                </label>
                <input
                  type="number"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  max="1"
                />
              </div>
            </div>

            {/* Compact Secondary Fields */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 pb-4">
              {[
                { name: "admission_type", label: "Adm Type" },
                { name: "admission_location", label: "Adm Loc" },
                { name: "discharge_location", label: "Dis Loc" },
                { name: "insurance", label: "Ins" },
                { name: "first_careunit", label: "1st Unit" },
                { name: "last_careunit", label: "Last Unit" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-400 transition-colors"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 🔴 TEST BUTTONS */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={testNormal}
              className="p-3 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-lg font-medium transition-colors"
            >
              ✅ Normal
            </button>
            <button
              onClick={testAnomaly}
              className="p-3 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-lg font-medium transition-colors"
            >
              🚨 Anomaly
            </button>
            <button
              onClick={testRandom}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-lg font-medium transition-colors"
            >
              🎲 Random
            </button>
          </div>

          <button
            onClick={predictAnomaly}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "🔄 Analyzing..." : "🚀 Detect Anomaly"}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Prediction Result
          </h2>
          {/* Your existing results code stays exactly the same */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-red-500 rounded-full mr-3 mt-0.5 flex-shrink-0"></div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-8 rounded-xl border-4 ${getStatusColor(
                result.predictions[0]
              )} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Status</h3>
                <div
                  className={`text-3xl font-bold ${
                    result.predictions[0] === 1
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getStatusText(result.predictions[0])}
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-6 text-sm">
                
                <div>
                  <span className="text-gray-600">Prediction:</span>{" "}
                  <span className="font-mono font-bold text-2xl">
                    {result.predictions[0]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Score:</span>
                  <span
                    className={`font-mono font-bold text-xl ml-2 ${
                      result.anomaly_scores[0] > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.anomaly_scores[0].toFixed(4)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 text-lg">
                    Anomalies Found:
                  </span>
                  <span className="font-bold text-3xl ml-3">
                    {result.num_anomalies}
                  </span>
                </div>
              </div> */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Prediction:</span>{" "}
                  <span className="font-mono font-bold text-2xl">
                    {result.predictions[0]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Score:</span>
                  <span
                    className={`font-mono font-bold text-xl ml-2 ${
                      result.anomaly_scores[0] > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.anomaly_scores[0].toFixed(4)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 text-lg">
                    Anomalies Found:
                  </span>
                  <span className="font-bold text-3xl ml-3">
                    {result.num_anomalies}
                  </span>
                </div>
              </div>

              <button
                onClick={() => explainPrediction(formData)}
                className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                🔍 Explain this prediction
              </button>

              {explainResult && (
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border">
                  <h4 className="font-bold text-lg mb-4">
                    Why this prediction?
                  </h4>
                  <div className="space-y-3">
                    {explainResult.top_features.map(([feature, impact], i) => (
                      <div
                        key={i}
                        className="flex justify-between py-2 border-b border-purple-100 last:border-b-0"
                      >
                        <span className="font-medium capitalize">
                          {feature.replace("_", " ")}
                        </span>
                        <span
                          className={`font-bold px-3 py-1 rounded-full text-xs ${
                            impact > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {impact.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ready for Analysis
              </h3>
              <p className="text-gray-500">
                Type in the form or use test buttons → Click "Detect Anomaly"
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
