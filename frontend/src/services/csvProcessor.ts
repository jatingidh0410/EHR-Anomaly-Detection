import Papa from 'papaparse';

export interface CsvRow {
  [key: string]: string | number;
}

export interface CsvStats {
  totalRows: number;
  validRows: number;
  featureCount: number;
  anomalies?: number;
}

export interface ProcessingResult {
  data: number[][];
  headers: string[];
  stats: CsvStats;
  errors: string[];
  originalData: any[];
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename?: string;
}

class CsvProcessorService {
  /**
   * Parse and process CSV file
   */
  async processFile(file: File): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processed = this.processData(results.data as CsvRow[]);
            resolve(processed);
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Process parsed data: identify features, normalize if needed
   */
  private processData(rows: CsvRow[]): ProcessingResult {
    const stats: CsvStats = {
      totalRows: rows.length,
      validRows: 0,
      featureCount: 0,
    };
    const errors: string[] = [];
    const validData: number[][] = [];

    if (rows.length === 0) {
      return {
        data: [],
        headers: [],
        stats,
        errors: ['CSV file is empty'],
        originalData: [],
      };
    }

    // Identify feature columns (assume numeric columns are features unless specified otherwise)
    // For simplicity, we assume ALL columns in the CSV except 'id', 'timestamp', 'label' are features.
    // Or we expect no header? The prompt says "Variable feature detection".
    
    // Let's inspect the first row to determine numeric keys
    const firstRow = rows[0];
    const featureKeys = Object.keys(firstRow).filter(key => {
      const val = firstRow[key];
      // Check if it looks like a number
      return !isNaN(parseFloat(String(val))) && key.toLowerCase() !== 'id' && key.toLowerCase() !== 'label';
    });

    stats.featureCount = featureKeys.length;

    if (stats.featureCount === 0) {
      errors.push('No numeric feature columns detected');
    }

    // Process rows
    rows.forEach((row, index) => {
      const features: number[] = [];
      let isValid = true;

      for (const key of featureKeys) {
        const val = parseFloat(String(row[key]));
        if (isNaN(val)) {
          isValid = false;
          errors.push(`Row ${index + 1}: Invalid value for column ${key}`);
          break;
        }
        features.push(val);
      }

      if (isValid) {
        validData.push(features);
        stats.validRows++;
      }
    });

    return {
      data: validData,
      headers: featureKeys,
      stats,
      errors: errors.slice(0, 50), // Cap errors
      originalData: rows,
    };
  }

  /**
   * Export results to CSV
   */
  exportToCsv(data: ExportData): void {
    const csv = Papa.unparse({
      fields: data.headers,
      data: data.rows,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', data.filename || 'analysis_results.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const csvProcessor = new CsvProcessorService();
