import { useState } from 'react';

export default function PredictionForm({ onPredict, loading }) {
  const [formData, setFormData] = useState({
    age: 60, length_of_stay: 5, num_icu_stays: 1, gender: 1,
    admission_type: 0, admission_location: 0, discharge_location: 0,
    insurance: 0, first_careunit: 0, last_careunit: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const quickTests = [
    { name: 'Normal', values: { age: 65, length_of_stay: 4, num_icu_stays: 1 } },
    { name: 'Anomaly', values: { age: 5, length_of_stay: 100, num_icu_stays: 10 } },
    { name: 'Random', values: { age: Math.floor(Math.random() * 80) + 20, length_of_stay: Math.floor(Math.random() * 20) + 1, num_icu_stays: Math.floor(Math.random() * 3) } },
  ];

  return (
    <div className="card-base p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Patient Input</h2>
      
      {/* Primary Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-base" min="0" max="120" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Length of Stay (days)</label>
          <input type="number" name="length_of_stay" value={formData.length_of_stay} onChange={handleChange} className="input-base" min="0" step="0.1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">ICU Stays</label>
          <input type="number" name="num_icu_stays" value={formData.num_icu_stays} onChange={handleChange} className="input-base" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Gender (0/1)</label>
          <input type="number" name="gender" value={formData.gender} onChange={handleChange} className="input-base" min="0" max="1" />
        </div>
      </div>

      {/* Secondary Inputs - Compact */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
        <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Clinical Details</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { name: 'admission_type', label: 'Adm Type' },
            { name: 'admission_location', label: 'Adm Loc' },
            { name: 'discharge_location', label: 'Dis Loc' },
            { name: 'insurance', label: 'Ins' },
            { name: 'first_careunit', label: '1st Unit' },
            { name: 'last_careunit', label: 'Last Unit' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="text-xs text-slate-400 block mb-1">{label}</label>
              <input type="number" name={name} value={formData[name]} onChange={handleChange} className="input-base text-sm" min="0" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Test Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickTests.map(test => (
          <button
            key={test.name}
            onClick={() => setFormData({ ...formData, ...test.values })}
            className={`py-2 px-4 rounded-lg font-medium transition-smooth text-sm ${
              test.name === 'Normal' ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' :
              test.name === 'Anomaly' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' :
              'bg-slate-700 text-slate-100 hover:bg-slate-600'
            }`}
          >
            {test.name === 'Normal' && '✅'} {test.name === 'Anomaly' && '🚨'} {test.name === 'Random' && '🎲'} {test.name}
          </button>
        ))}
      </div>

      {/* Predict Button */}
      <button
        onClick={() => onPredict(formData)}
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? '⏳ Analyzing...' : '🚀 Detect Anomaly'}
      </button>
    </div>
  );
}
