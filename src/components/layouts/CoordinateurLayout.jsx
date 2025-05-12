// components/layouts/CoordinateurLayout.jsx

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CoordinateurLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Fonctions de navigation
  const navigateToDashboard = () => router.push('/coordinateur/dashboard');
  const navigateToPhases = () => router.push('/coordinateur/phases');
  const navigateToVotes = () => router.push('/coordinateur/votes');
  const navigateToProfile = () => router.push('/coordinateur/profile');
  const navigateToNotifications = () => router.push('/coordinateur/notifications');

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
              active={isActive('/coordinateur/dashboard')}
              onClick={navigateToDashboard} 
            />
            <NavItem 
              icon={<DiscussionIcon />} 
              text="Phases" 
              active={isActive('/coordinateur/phases')}
              onClick={navigateToPhases}
            />
            <NavItem 
              icon={<VoteIcon />} 
              text="Votes" 
              active={isActive('/coordinateur/votes')}
              onClick={navigateToVotes}
            />
            <NavItem 
              icon={<BellIcon />} 
              text="Notifications" 
              active={isActive('/coordinateur/notifications')}
              onClick={navigateToNotifications}
            />
            <NavItem 
              icon={<UserIcon />} 
              text="Profil" 
              active={isActive('/coordinateur/profile')}
              onClick={navigateToProfile}
            />
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Coordinateur</span>
            <span className="text-xs text-gray-500">COORDINATEUR</span>
            <span className="text-xs text-gray-500 mt-1">coordinateur@example.com</span>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Coordination des dossiers</h2>
          <div className="flex items-center space-x-4">
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Coordinateur</span>
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
      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
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

const DiscussionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
  </svg>
);

const VoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
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

export default CoordinateurLayout;