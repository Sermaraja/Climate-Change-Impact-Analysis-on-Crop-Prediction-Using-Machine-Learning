import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f3f6f4] text-slate-800 antialiased">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[68px] transition-all duration-300 min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Canvas Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1720px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
