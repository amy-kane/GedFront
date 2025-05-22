// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Login() {
  // Utilisation du routeur Next.js pour les redirections après connexion
  const router = useRouter();
  
  // État local pour gérer les données du formulaire de connexion
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  
  // États pour gérer les erreurs et le chargement
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction qui gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ NOUVELLE FONCTION : Redirection intelligente pour les déposants
  const redirectDeposant = async (token) => {
    try {
      console.log('Vérification des dossiers existants pour le déposant...');
      
      // Vérifier si le déposant a déjà des dossiers
      const dossiersResponse = await axios.get('/api/dossiers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Réponse dossiers:', dossiersResponse.data);
      
      if (dossiersResponse.data && dossiersResponse.data.content && dossiersResponse.data.content.length > 0) {
        // Le déposant a des dossiers, rediriger vers le dernier dossier
        const dernierDossier = dossiersResponse.data.content[0]; // Le plus récent
        console.log('Redirection vers le dossier:', dernierDossier.id);
        router.push(`/deposant/dossiers/${dernierDossier.id}/suivi`);
      } else {
        // Le déposant n'a pas de dossier, rediriger vers la création
        console.log('Aucun dossier trouvé, redirection vers création');
        router.push('/deposant/creer-dossier');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des dossiers:', error);
      // En cas d'erreur, rediriger vers la création par défaut
      router.push('/deposant/creer-dossier');
    }
  };

  // Fonction qui gère la soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation basique des champs obligatoires
    if (!formData.email || !formData.motDePasse) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    // Activation de l'indicateur de chargement
    setLoading(true);
    
    try {
      // Envoi de la requête de connexion au backend via notre API proxy
      const response = await axios.post('/api/auth/login', new URLSearchParams({
        email: formData.email,
        motDePasse: formData.motDePasse
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Si la connexion réussit, on stocke le token JWT et les infos utilisateur
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirection basée sur le rôle de l'utilisateur
        const userRole = response.data.user.role;
        
        switch (userRole) {
          case 'ADMINISTRATEUR':
            router.push('/admin/dashboard');
            break;
          case 'RECEPTIONNISTE':
            router.push('/receptionniste/dashboard');
            break;
          case 'MEMBRE_COMITE':
            router.push('/membre-comite/dashboard');
            break;
          case 'COORDINATEUR':
            router.push('/coordinateur/dashboard');
            break;
          case 'DEPOSANT':
            // ✅ MODIFIÉ : Redirection intelligente pour les déposants
            await redirectDeposant(response.data.token);
            break;
          default:
            // Si le rôle n'est pas reconnu, utiliser une page par défaut
            router.push('/dashboard');
            break;
        }
      }
    } catch (err) {
      // Gestion des erreurs retournées par le backend
      console.error('Erreur de connexion:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Identifiants incorrects');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      // Désactivation de l'indicateur de chargement
      setLoading(false);
    }
  };

  return (
    // Container principal avec fond gris clair
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-md">
        {/* En-tête avec logo et titre */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Connexion</h1>
          <p className="text-sm text-gray-600">Système de Gestion Électronique des Documents</p>
        </div>
        
        {/* Affichage des erreurs éventuelles */}
        {error && (
          <div className="mb-4 bg-red-50 p-3 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit}>
          {/* Champ email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="nom@exemple.com"
            />
          </div>
          
          {/* Champ mot de passe */}
          <div className="mb-6">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Bouton de connexion avec état de chargement */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {loading ? (
              // Icône d'animation de chargement
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              // Icône de connexion
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            )}
            Se connecter
          </button>
        </form>
        
        {/* Lien vers la page d'inscription */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ? <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}