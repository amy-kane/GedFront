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
    // Container principal avec image de fond
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://www.bureau-telecoms.fr/wp-content/uploads/2024/01/comment-une-connexion-internet-rapide-peut-transformer-votre-entreprise-1.jpg"
          alt="Bureau technologique moderne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-indigo-900/80"></div>
        
        {/* Éléments décoratifs animés */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-purple-300/20 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-green-300/20 rounded-full animate-pulse delay-3000"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Carte de connexion avec animation d'entrée */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 animate-fadeInUp border border-white/20">
          
          {/* En-tête avec logo et titre animés */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform duration-300 shadow-lg animate-bounceIn">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-slideInDown">
              Bienvenue
            </h1>
            <p className="text-gray-600 animate-slideInDown delay-100">
              Connectez-vous à votre espace GED
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full animate-expandWidth"></div>
          </div>
          
          {/* Affichage des erreurs avec animation */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Formulaire de connexion avec animations */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ email avec animation au focus */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                📧 Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300"
                  placeholder="nom@exemple.com"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            {/* Champ mot de passe avec animation au focus */}
            <div className="group">
              <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                🔒 Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="motDePasse"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            {/* Bouton de connexion avec animations élaborées */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {/* Animation de fond au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              
              {/* Contenu du bouton */}
              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6 mr-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Se connecter
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </div>
            </button>
          </form>
          
          {/* Lien vers la page d'inscription avec animation */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                href="/register" 
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 relative group"
              >
                S'inscrire
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-300 group"
            >
              <svg className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 5rem;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 1s ease-out;
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        .animate-expandWidth {
          animation: expandWidth 1s ease-out 0.5s both;
        }

        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }

        .delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}