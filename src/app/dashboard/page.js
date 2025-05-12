'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
  // Utilisation du routeur Next.js pour les redirections
  const router = useRouter();
  
  // État local pour stocker les informations de l'utilisateur connecté
  const [user, setUser] = useState(null);
  
  // État pour gérer le chargement des données
  const [loading, setLoading] = useState(true);
  
  // État pour gérer les erreurs
  const [error, setError] = useState('');
  
  // État pour stocker les statistiques de l'utilisateur
  const [stats, setStats] = useState({
    totalDossiers: 0,
    dossiersPending: 0,
    dossiersApproved: 0,
    dossiersRejected: 0
  });
  
  // État pour stocker les dossiers récents
  const [recentDossiers, setRecentDossiers] = useState([]);

  // Hook d'effet pour charger les données au montage du composant
  useEffect(() => {
    // Fonction pour récupérer les informations de l'utilisateur à partir du localStorage
    const fetchUserData = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // Si pas de token, l'utilisateur n'est pas connecté
      if (!token || !userStr) {
        router.push('/login'); // Redirection vers la page de connexion
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Configuration du token pour les requêtes futures
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Charger les données du tableau de bord
        fetchDashboardData(userData);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError('Session invalide. Veuillez vous reconnecter.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };
    
    fetchUserData();
  }, [router]);

  // Fonction pour charger les données du tableau de bord
  const fetchDashboardData = async (userData) => {
    try {
      setLoading(true);
      
      // Dans une implémentation réelle, ces données viendraient du backend
      // Pour l'instant, nous utilisons des données simulées
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simuler des statistiques différentes selon le rôle de l'utilisateur
      if (userData.role === 'ADMINISTRATEUR') {
        setStats({
          totalDossiers: 152,
          dossiersPending: 23,
          dossiersApproved: 114,
          dossiersRejected: 15
        });
      } else if (userData.role === 'DEPOSANT') {
        setStats({
          totalDossiers: 12,
          dossiersPending: 3,
          dossiersApproved: 7,
          dossiersRejected: 2
        });
      } else {
        setStats({
          totalDossiers: 45,
          dossiersPending: 12,
          dossiersApproved: 30,
          dossiersRejected: 3
        });
      }
      
      // Simuler des dossiers récents
      setRecentDossiers([
        { id: 1, titre: "Projet A", dateCreation: "2025-04-05", statut: "En attente" },
        { id: 2, titre: "Dossier fiscal 2024", dateCreation: "2025-04-03", statut: "Approuvé" },
        { id: 3, titre: "Rapport trimestriel", dateCreation: "2025-04-01", statut: "Approuvé" },
        { id: 4, titre: "Demande de financement", dateCreation: "2025-03-28", statut: "Rejeté" }
      ]);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données du tableau de bord:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Affichage d'un chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs éventuelles
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Erreur</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête avec navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full p-2 mr-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Système GED</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Menu utilisateur */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</span>
                  <span className="text-xs text-gray-500">{user?.role}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Message de bienvenue */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Bienvenue sur votre tableau de bord</h2>
          <p className="text-gray-600">
            Vous êtes connecté en tant que <span className="font-medium">{user?.role}</span>. 
            Utilisez le menu pour naviguer entre les différentes fonctionnalités du système.
          </p>
        </div>
        
        {/* Statistiques */}
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Statistiques de vos dossiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total dossiers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDossiers}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-md">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.dossiersPending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-md">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Approuvés</p>
                <p className="text-2xl font-bold text-green-500">{stats.dossiersApproved}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-md">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejetés</p>
                <p className="text-2xl font-bold text-red-500">{stats.dossiersRejected}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-md">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Carte d'action 1 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nouveau dossier</h3>
              </div>
              <p className="text-gray-600 mb-4">Créez un nouveau dossier pour soumettre vos documents électroniques.</p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                Créer un dossier
              </button>
            </div>
          </div>
          
          {/* Carte d'action 2 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Mes dossiers</h3>
              </div>
              <p className="text-gray-600 mb-4">Consultez et gérez tous vos dossiers existants.</p>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded">
                Voir mes dossiers
              </button>
            </div>
          </div>
          
          {/* Carte d'action 3 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Mon profil</h3>
              </div>
              <p className="text-gray-600 mb-4">Modifiez vos informations personnelles et vos paramètres.</p>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
                Gérer mon profil
              </button>
            </div>
          </div>
        </div>
        
        {/* Dossiers récents */}
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Dossiers récents</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDossiers.length > 0 ? (
                recentDossiers.map((dossier) => (
                  <tr key={dossier.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dossier.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dossier.titre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(dossier.dateCreation).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${dossier.statut === 'Approuvé' ? 'bg-green-100 text-green-800' : 
                          dossier.statut === 'Rejeté' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {dossier.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun dossier récent à afficher
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-900">
              Voir tous les dossiers →
            </a>
          </div>
        </div>
      </main>
      
      {/* Pied de page */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Système de Gestion Électronique des Documents. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}