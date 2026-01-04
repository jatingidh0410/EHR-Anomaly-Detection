import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showLogout?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'EHR Anomaly Detection',
  onMenuClick,
  showLogout = true,
}) => {
  const navigate = useNavigate();
  // const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <header className="bg-navy-900 border-b border-navy-600 sticky top-0 z-50 shadow-lg">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="hidden md:flex lg:hidden btn btn-sm btn-outline"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-bold text-cyan-300">
              {title}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-copper-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <span className="text-sm text-cyan-300">Admin</span>
            </div>

            {/* Logout Button */}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 rounded-lg text-cyan-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 transition-all cursor-pointer z-50"
                type="button"
                aria-label="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
