import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

/**
 * AppLayout wraps all authenticated pages.
 * Provides the sidebar navigation + top navbar + main content area.
 * The <Outlet /> renders the current route's page component.
 */
export default function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  // Listen for sidebar collapse state via CSS transition
  // We observe the sidebar element's actual width
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width);
      }
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — fixed position */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
