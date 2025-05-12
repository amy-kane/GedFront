// components/layouts/ReceptionnisteLayout.jsx

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ReceptionnisteLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Fonctions de navigation
  const navigateToDashboard = () => router.push('/receptionniste/dashboard');
  const navigateToTraitement = () => router.push('/receptionniste/traitement');
  const navigateToProfile = () => router.push('/receptionniste/profile');
  const navigateToNotifications = () => router.push('/receptionniste/notifications');

  // Déterminer quelle page est active
  const isActive = (path) => {
    return pathname?.includes(path) || false;
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">GED</h1>
        </div>
        
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-1">
            <NavItem 
              icon={<HomeIcon />} 
              text="Tableau de bord" 
              active={isActive('/receptionniste/dashboard')}
              onClick={navigateToDashboard} 
            />
            <NavItem 
              icon={<FolderIcon />} 
              text="Traitement dossiers" 
              active={isActive('/receptionniste/traitement')}
              onClick={navigateToTraitement}
            />
            <NavItem 
              icon={<BellIcon />} 
              text="Notifications" 
              active={isActive('/receptionniste/notifications')}
              onClick={navigateToNotifications}
            />
            <NavItem 
              icon={<UserIcon />} 
              text="Profil" 
              active={isActive('/receptionniste/profile')}
              onClick={navigateToProfile}
            />
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Réceptionniste</span>
            <span className="text-xs text-gray-500">RECEPTIONNISTE</span>
            <span className="text-xs text-gray-500 mt-1">receptionniste@example.com</span>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Réception des dossiers</h2>
          <div className="flex items-center space-x-4">
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Réceptionniste</span>
              <button 
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  // Logout logic
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

// Composant NavItem pour le menu latéral
const NavItem = ({ icon, text, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-md ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </button>
);

// Icônes
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
    <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

export default ReceptionnisteLayout;