// components/layouts/CoordinateurLayout.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CoordinateurLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

  // Fonctions de navigation
  const navigateToDashboard = () => {
    console.log("Navigation vers dashboard coordinateur");
    router.push('/coordinateur/dashboard');
  };

  const navigateToPhases = () => {
    console.log("Navigation vers phases");
    router.push('/coordinateur/phases');
  };

  const navigateToVotes = () => {
    console.log("Navigation vers votes");
    router.push('/coordinateur/votes');
  };

  const navigateToNotifications = () => router.push('/coordinateur/notifications');

  const navigateToDiscussions = () => {
    console.log("Navigation vers discussions");
    router.push('/coordinateur/discussions');
  };

  const navigateToStatistics = () => {
    console.log("Navigation vers statistiques");
    router.push('/coordinateur/statistiques');
  };

  const navigateToProfile = () => {
    console.log("Navigation vers profil");
    try {
      router.push('/profil');
      console.log("✅ Navigation lancée vers /profil");
    } catch (error) {
      console.error("❌ Erreur lors de la navigation:", error);
    }
  };

  const handleLogout = () => {
    console.log("Tentative de déconnexion");
    
    try {
      if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        console.log("Nettoyage du localStorage");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        console.log("Redirection vers /login");
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      router.push('/login');
    }
  };

  // Déterminer quelle page est active
  const isActive = (path) => {
    return pathname?.includes(path) || false;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col gap-4 h-full">
        {/* Header - Rectangle qui prend toute la largeur en haut */}
        <header className="bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo et Page Title */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Coordination GED</h1>
                  <p className="text-sm text-gray-500">Gestion et Coordination des Dossiers</p>
                </div>
              </div>
              
              {/* Séparateur */}
              <div className="h-8 w-px bg-gray-300 mx-4"></div>
              
              {/* Page Title - Dynamique selon la route */}
              <h2 className="text-lg font-semibold text-gray-700">
                {pathname?.includes('/dashboard') && 'Accueil'}
                {pathname?.includes('/phases') && 'Gestion des phases'}
                {pathname?.includes('/discussions') && 'Discussions'}
                {pathname?.includes('/votes') && 'Gestion des votes'}
                {pathname?.includes('/notifications') && 'Notifications'}
                {pathname?.includes('/statistiques') && 'Statistiques'}
                {!pathname?.includes('/coordinateur/') && 'Coordination'}
              </h2>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications Badge */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user ? `${user.prenom} ${user.nom}` : 'Coordinateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'coordinateur@ged.com'}
                  </p>
                </div>

                {/* Profile Button */}
                <button 
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 border border-transparent hover:border-green-200"
                  onClick={navigateToProfile}
                  title="Mon profil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Logout Button */}
                <button 
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  onClick={handleLogout}
                  title="Se déconnecter"
                >
                  <LogoutIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area avec Sidebar et Main */}
        <div className="flex gap-4 flex-1">
          {/* Sidebar Navigation - Rectangle séparé */}
          <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white rounded-xl shadow-lg transition-all duration-300 flex flex-col`}>
            {/* Toggle Button en haut de la sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!sidebarCollapsed && (
                <h3 className="text-lg font-semibold text-gray-800">Navigation</h3>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              <NavItem 
                icon={<HomeIcon />} 
                text="Accueil" 
                active={isActive('/coordinateur/dashboard')}
                onClick={navigateToDashboard}
                collapsed={sidebarCollapsed}
              />
              <NavItem 
                icon={<PhasesIcon />} 
                text="Phases" 
                active={isActive('/coordinateur/phases')}
                onClick={navigateToPhases}
                collapsed={sidebarCollapsed}
              />
              <NavItem 
                icon={<DiscussionIcon />} 
                text="Discussions" 
                active={isActive('/coordinateur/discussions')}
                onClick={navigateToDiscussions}
                collapsed={sidebarCollapsed}
              />
              <NavItem 
                icon={<VoteIcon />} 
                text="Votes" 
                active={isActive('/coordinateur/votes')}
                onClick={navigateToVotes}
                collapsed={sidebarCollapsed}
              />
              <NavItem 
                icon={<BellIcon />} 
                text="Notifications" 
                active={isActive('/coordinateur/notifications')}
                onClick={navigateToNotifications}
                collapsed={sidebarCollapsed}
              />
              <NavItem 
                icon={<ChartIcon />} 
                text="Statistiques" 
                active={isActive('/coordinateur/statistiques')}
                onClick={navigateToStatistics}
                collapsed={sidebarCollapsed}
              />
            </nav>
            
            {/* User Info dans la sidebar */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
              {!sidebarCollapsed ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {user ? `${user.prenom?.[0]}${user.nom?.[0]}` : 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user ? `${user.prenom} ${user.nom}` : 'Coordinateur'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.role || 'COORDINATEUR'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user ? `${user.prenom?.[0]}${user.nom?.[0]}` : 'C'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>
          
          {/* Page Content - Rectangle séparé */}
          <main className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-full overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Composant NavItem mis à jour pour supporter le collapse
const NavItem = ({ icon, text, active = false, onClick, collapsed = false }) => (
  <div className="relative group">
    <button 
      onClick={(e) => {
        console.log(`NavItem clicked: ${text}`);
        if (onClick) onClick(e);
      }}
      className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-green-50 text-green-700 border-r-4 border-green-700' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? text : undefined}
    >
      <span className={`${active ? 'text-green-700' : 'text-gray-500'} group-hover:text-gray-700`}>
        {icon}
      </span>
      {!collapsed && <span className="ml-3 truncate">{text}</span>}
    </button>
    
    {/* Tooltip pour sidebar collapsed */}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        {text}
      </div>
    )}
  </div>
);

// Icônes - Toutes déclarées avant le composant principal
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const PhasesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

export default CoordinateurLayout;