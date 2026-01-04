import React, { useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col text-cyan-300 font-sans">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto bg-navy-900 relative">
          <div className="container-custom py-8 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
            {children}
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
}
