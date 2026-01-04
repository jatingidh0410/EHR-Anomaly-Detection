export interface Threat {
  id: number;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  confidence: number;
  source_ip: string;
  prediction: boolean;
  shap_values?: number[];
}

export interface DashboardStats {
  total_threats: number;
  critical: number;
  warnings: number;
  avg_confidence: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  last_login?: string;
}

export interface Report {
  id: string;
  title: string;
  created_at: string;
  threats_analyzed: number;
  critical_count: number;
  accuracy: number;
  file_path?: string;
}
