// app/access-denied/page.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AccessDenied() {
  const [userRole, setUserRole] = useState('');
  const [dashboardLink, setDashboardLink] = useState('/dashboard');
  
  useEffect(() => {
    // Récupérer les informations de l'utilisateur du localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        
        // Définir le lien vers le tableau de bord approprié
        switch (user.role) {
          case 'ADMINISTRATEUR':
            setDashboardLink('/admin/dashboard');
            break;
          case 'RECEPTIONNISTE':
            setDashboardLink('/reception/dashboard');
            break;
          case 'MEMBRE_COMITE':
            setDashboardLink('/comite/dashboard');
            break;
          case 'COORDINATEUR':
            setDashboardLink('/coordination/dashboard');
            break;
          case 'DEPOSANT':
            setDashboardLink('/deposant/dashboard');
            break;
          default:
            setDashboardLink('/dashboard');
            break;
        }
      } catch (e) {
        console.error("Erreur lors de la lecture des informations utilisateur:", e);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-md text-center">
        <div className="text-red-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
          {userRole && (
            <span> Votre rôle actuel est <strong>{userRole}</strong>.</span>
          )}
        </p>
        <div className="flex flex-col space-y-3">
          <Link href={dashboardLink} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retour à votre tableau de bord
          </Link>
          <Link href="/" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Page d'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}