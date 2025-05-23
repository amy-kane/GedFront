// src/components/layouts/AdminLayout.tsx - Version de diagnostic

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AdminLayoutProps = {
  children: React.ReactNode;
};

type UserData = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

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
    console.log("Navigation vers dashboard");
    router.push('/admin/dashboard');
  };

  const navigateToUserManagement = () => router.push('/admin/users');
  
  const navigateToTypeDemandeManagement = () => {
    console.log("Navigation vers types de demande");
    router.push('/admin/types-demande');
  };
  
  const navigateToFolders = () => router.push('/admin/dossiers');
  
  const navigateToStatistics = () => {
    console.log("Navigation vers statistiques");
    router.push('/admin/statistiques');
  };
  
  const navigateToNotifications = () => router.push('/admin/notifications');

  // ✅ CORRECTION : Navigation vers profil avec debug
  const navigateToProfile = () => {
    console.log("🔍 Tentative de navigation vers profil");
    console.log("📂 Route cible: /profil");
    console.log("👤 Utilisateur actuel:", user);
    
    try {
      // Utiliser la route existante /profil
      router.push('/profil');
      console.log("✅ Navigation lancée vers /profil");
    } catch (error) {
      console.error("❌ Erreur lors de la navigation:", error);
    }
  };

  // ✅ CORRECTION : Fonction de déconnexion avec debug
  const handleLogout = () => {
    console.log("🚪 Tentative de déconnexion");
    
    try {
      if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        console.log("🧹 Nettoyage du localStorage");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        console.log("🔄 Redirection vers /login");
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      router.push('/login');
    }
  };

  // Déterminer quelle page est active
  const isActive = (path: string): boolean => {
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
              active={isActive('/admin/dashboard')}
              onClick={navigateToDashboard} 
            />
            <NavItem 
              icon={<FolderIcon />} 
              text="Dossiers" 
              active={isActive('/admin/dossiers')}
              onClick={navigateToFolders}
            />
            <NavItem 
              icon={<BellIcon />} 
              text="Notifications" 
              active={isActive('/admin/notifications')}
              onClick={navigateToNotifications}
            />
            <NavItem 
              icon={<DocumentIcon />} 
              text="Types de demande" 
              active={isActive('/admin/types-demande')}
              onClick={navigateToTypeDemandeManagement}
            />
            <NavItem 
              icon={<UsersIcon />} 
              text="Gestion des utilisateurs" 
              active={isActive('/admin/users')}
              onClick={navigateToUserManagement}
            />
            <NavItem 
              icon={<ChartIcon />} 
              text="Statistiques" 
              active={isActive('/admin/statistiques')}
              onClick={navigateToStatistics}
            />
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user ? `${user.prenom} ${user.nom}` : 'Système Administrateur'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.role || 'ADMIN'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {user?.email || 'admin@example.com'}
              </span>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Administration</h2>
          <div className="flex items-center space-x-4">
            {/* ✅ BOUTON PROFIL avec debug et styles améliorés */}
            <button 
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 border border-transparent hover:border-blue-200"
              onClick={navigateToProfile}
              title="Mon profil"
              onMouseEnter={() => console.log("🖱️ Survol du bouton profil")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">
                {user ? `${user.prenom} ${user.nom} (${user.role})` : 'Système Administrateur (ADMIN)'}
              </span>
              <button 
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                onClick={handleLogout}
                title="Se déconnecter"
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

// Définition du type pour les props de NavItem
type NavItemProps = {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
};

// Composant NavItem pour le menu latéral
const NavItem = ({ icon, text, active = false, onClick }: NavItemProps) => (
  <button 
    onClick={(e) => {
      console.log(`NavItem clicked: ${text}`);
      if (onClick) onClick(e);
    }}
    className={`flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-md transition-colors duration-200 ${
      active 
        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </button>
);

// Icônes (identiques à votre code existant)
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

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
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

export default AdminLayout;