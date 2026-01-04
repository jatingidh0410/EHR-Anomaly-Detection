import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Search,
  Upload,
  History,
  Monitor,
  Settings,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/detection', label: 'Threat Detection', icon: Search },
    { path: '/batch', label: 'Batch Analysis', icon: Upload },
    { path: '/history', label: 'History', icon: History },
    { path: '/monitoring', label: 'Monitoring', icon: Monitor },
    { path: '/admin', label: 'Admin Panel', icon: Settings },
    { path: '/reports', label: 'Reports', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-navy-800 border-r border-navy-600
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 btn btn-sm btn-outline"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Navigation */}
        <nav className="mt-8 lg:mt-0 px-4 py-6 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-copper-500 text-white'
                  : 'text-navy-300 hover:bg-navy-700 hover:text-cyan-300'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-600">
          <p className="text-navy-400 text-xs text-center">
            v1.0.0 • EHR System
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
