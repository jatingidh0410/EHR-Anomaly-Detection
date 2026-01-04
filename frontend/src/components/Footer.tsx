import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 border-t border-navy-600 mt-12 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-cyan-300 font-bold mb-4">About</h3>
            <p className="text-navy-300 text-sm leading-relaxed">
              EHR Anomaly Detection System uses advanced ML models to identify potential security threats and anomalies in healthcare data.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-cyan-300 font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-navy-300">
              <li>✓ Real-time Threat Detection</li>
              <li>✓ Batch Processing</li>
              <li>✓ Historical Analysis</li>
              <li>✓ PDF Reports</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-cyan-300 font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="hover:text-cyan-300 transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/detection" className="hover:text-cyan-300 transition">
                  Detection
                </a>
              </li>
              <li>
                <a href="/history" className="hover:text-cyan-300 transition">
                  History
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-navy-600 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-navy-400 text-sm">
            © {currentYear} EHR Anomaly Detection. All rights reserved.
          </p>
          <p className="text-navy-400 text-sm flex items-center gap-2 mt-4 md:mt-0">
            Made with <Heart size={16} className="text-copper-500" /> for Healthcare Security
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
