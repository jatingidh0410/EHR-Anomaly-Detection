# EHR Anomaly Detection System - Reference Guide

## Overview
This system provides real-time and batch anomaly detection for Electronic Health Records (EHR) using machine learning models. It features a modern React frontend with a robust Python backend.

## 1. Setup Instructions

### Prerequisites
- Node.js v16+ (Frontend)
- Python 3.8+ (Backend)
- Modern Web Browser (Chrome/Edge recommended)

### Frontend Setup
1. Navigate to `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (including Papaparse):
   ```bash
   npm install
   npm install papaparse @types/papaparse --save
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to `backend` directory.
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Start Flask server:
   ```bash
   python app.py
   ```

---

## 2. API Reference

Base URL: `http://localhost:5000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/anomaly/detect` | POST | Real-time detection. Body: `{ features: [n1, n2...] }` |
| `/api/anomaly/batch` | POST | Batch processing. Form-data: `file` (CSV) |
| `/api/threats/history` | GET | Fetch recent threats |
| `/api/monitoring/metrics` | GET | System performance metrics |

### Feature Normalization
The system requires **102 numerical features**.
- **Real-time**: Use the "Threat Detection" page. The system will auto-fill missing features using Random, Zero, or Mean strategies.
- **Batch**: Upload a CSV. The client-side processor will validate and normalize rows to 102 features before sending to the backend.

---

## 3. Best Practices

### Data Preparation
- **CSV Format**: Ensure CSV files have a header row and numerical columns.
- **Feature Count**: While the system handles normalization, providing as many real features as possible improves accuracy.
- **Batch Size**: Recommended batch size is under 5000 rows for optimal performance.

### UI Usage
- **Dark Mode**: The interface is optimized for dark environments (Navy/Copper/Cyan theme).
- **Polling**: Monitoring and Admin pages use auto-polling. Pause polling if you are inspecting a specific record to avoid UI updates.
- **Error Recovery**: If the application crashes, the Global Error Boundary will catch it. Click "Reload Application" to recover.

---

## 4. Troubleshooting

### Common Issues

**1. "Network Error" or 500 API Error**
- **Cause**: Backend server is down or unreachable.
- **Solution**: Check if `python app.py` is running. Verify port 5000 is open.
- **Retry**: The frontend automatically retries failed requests 3 times.

**2. "Invalid CSV"**
- **Cause**: File contains non-numeric data or malformed rows.
- **Solution**: Open CSV in Excel/Editor and verify all columns (except IDs) are numbers.

**3. "Missing Features"**
- **Cause**: Input has fewer than 102 features.
- **Solution**: Select a "Fill Strategy" (Random/Diff/Mean) in the Detection page or Batch settings.

### Developer Tools
- **Linting**: Run `npm run lint` to check for code issues.
- **Build**: Run `npm run build` to create production artifacts.

---

## 5. Code Examples

### Implementing Custom Polling
```typescript
import { useEffect } from 'react';

// Robust polling hook pattern
useEffect(() => {
  let isMounted = true;
  let timerId;

  const poll = async () => {
    if (!isMounted) return;
    await fetchData();
    if (isMounted) timerId = setTimeout(poll, 3000);
  };

  poll();
  return () => { isMounted = false; clearTimeout(timerId); };
}, []);
```

### Using Feature Normalization Hook
```typescript
import { useFeatureNormalization } from './hooks/useFeatureNormalization';

const MyComponent = () => {
  const { normalizeFeatures, config } = useFeatureNormalization({ 
    fillStrategy: 'mean' 
  });

  const handleInput = (input: number[]) => {
    const normalized = normalizeFeatures(input);
    console.log(normalized.length); // 102
  };
};
```
