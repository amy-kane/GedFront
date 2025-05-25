// app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Register() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    sexe: '',
    age: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation du mot de passe
    if (!formData.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est obligatoire';
    } else if (formData.motDePasse.length < 8) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[A-Z])/.test(formData.motDePasse)) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins une majuscule';
    } else if (!/(?=.*\d)/.test(formData.motDePasse)) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins un chiffre';
    }
    
    // Validation de la confirmation du mot de passe
    if (!formData.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Veuillez confirmer votre mot de passe';
    } else if (formData.motDePasse !== formData.confirmMotDePasse) {
      newErrors.confirmMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    
    // Validation du sexe
    if (!formData.sexe) {
      newErrors.sexe = 'Le sexe est obligatoire';
    }
    
    // Validation de l'âge
    if (!formData.age) {
      newErrors.age = 'L\'âge est obligatoire';
    } else if (isNaN(formData.age) || formData.age < 18 || formData.age > 120) {
      newErrors.age = 'L\'âge doit être compris entre 18 et 120 ans';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Préparation des données en form-data pour correspondre à votre backend
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('prenom', formData.prenom.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('motDePasse', formData.motDePasse);
      formDataToSend.append('sexe', formData.sexe);
      formDataToSend.append('age', formData.age);
      
      console.log('Données d\'inscription (form-data):', formDataToSend.toString());
      
      // Envoi de la requête d'inscription avec le bon Content-Type
      const response = await axios.post('/api/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Réponse d\'inscription:', response.data);
      
      // Sauvegarder le token et les informations utilisateur
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirection vers la page de création de dossier après inscription
        router.push('/deposant/creer-dossier');
      } else {
        throw new Error('Réponse d\'inscription invalide');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error.response?.data?.error) {
        // Erreur spécifique du serveur
        setErrors({ general: error.response.data.error });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Données d\'inscription invalides' });
      } else if (error.response?.status === 403) {
        setErrors({ general: 'Accès refusé. Veuillez vérifier vos informations.' });
      } else if (error.message === 'Network Error') {
        setErrors({ general: 'Impossible de se connecter au serveur' });
      } else {
        setErrors({ general: 'Une erreur est survenue lors de l\'inscription' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://www.bureau-telecoms.fr/wp-content/uploads/2024/01/comment-une-connexion-internet-rapide-peut-transformer-votre-entreprise-1.jpg"
          alt="Bureau technologique moderne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-800/70 to-indigo-900/80"></div>
        
        {/* Éléments décoratifs animés réduits */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-16 right-12 w-20 h-20 bg-purple-300/20 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-32 left-20 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-20 right-24 w-18 h-18 bg-green-300/20 rounded-full animate-float-reverse"></div>
        </div>
      </div>

      {/* Contenu principal - Taille réduite */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* En-tête avec animation - Plus compact */}
        <div className="text-center mb-6 animate-slideDown">
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-full p-1 mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3 animate-rotateIn">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slideDown delay-100">
            Rejoignez-nous
          </h1>
          <p className="text-lg text-blue-100 animate-slideDown delay-200">
            Créez votre compte déposant
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mt-3 rounded-full animate-expandWidth"></div>
        </div>

        {/* Carte d'inscription avec animation - Plus compacte */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-all duration-300 animate-fadeInUp border border-white/20">
          
          {/* Message d'erreur général avec animation */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium text-sm">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nom et Prénom avec animations - Plus compacts */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group animate-slideInLeft">
                <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  👤 Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                      errors.nom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    placeholder="Votre nom"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.nom && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.nom}
                  </p>
                )}
              </div>

              <div className="group animate-slideInRight">
                <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  👤 Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                      errors.prenom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    placeholder="Votre prénom"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.prenom && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.prenom}
                  </p>
                )}
              </div>
            </div>

            {/* Email avec animation - Plus compact */}
            <div className="group animate-slideInLeft delay-100">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                📧 Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                  }`}
                  placeholder="votre.email@exemple.com"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Sexe et Âge avec animations - Plus compacts */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group animate-slideInLeft delay-200">
                <label htmlFor="sexe" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  ⚧ Sexe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="sexe"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm text-sm ${
                      errors.sexe 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                  >
                    <option value="">Sélectionnez</option>
                    <option value="MASCULIN">👨 Masculin</option>
                    <option value="FEMININ">👩 Féminin</option>
                    <option value="AUTRE">⚧ Autre</option>
                  </select>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.sexe && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.sexe}
                  </p>
                )}
              </div>

              <div className="group animate-slideInRight delay-200">
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  🎂 Âge <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                      errors.age 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    placeholder="Votre âge"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.age && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.age}
                  </p>
                )}
              </div>
            </div>

            {/* Mots de passe - Plus compacts */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group animate-slideInLeft delay-300">
                <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  🔒 Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="motDePasse"
                    name="motDePasse"
                    type="password"
                    autoComplete="new-password"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                      errors.motDePasse 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.motDePasse && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.motDePasse}
                  </p>
                )}
              </div>

              <div className="group animate-slideInRight delay-300">
                <label htmlFor="confirmMotDePasse" className="block text-sm font-semibold text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">
                  🔒 Confirmer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmMotDePasse"
                    name="confirmMotDePasse"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmMotDePasse}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm ${
                      errors.confirmMotDePasse 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.confirmMotDePasse && (
                  <p className="mt-1 text-xs text-red-600 animate-slideInDown flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.confirmMotDePasse}
                  </p>
                )}
              </div>
            </div>

            {/* Aide pour mot de passe - Plus compact */}
            <p className="text-xs text-gray-500 flex items-center animate-fadeInUp delay-300">
              🔐 Au moins 8 caractères, une majuscule et un chiffre
            </p>

            {/* Bouton de soumission avec animations - Plus compact */}
            <div className="animate-fadeInUp delay-400 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {/* Animation de fond au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                {/* Contenu du bouton */}
                <div className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Créer mon compte
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Liens de navigation - Plus compacts */}
          <div className="mt-6 space-y-3 text-center">
            <div className="animate-fadeInUp delay-500">
              <p className="text-gray-600 text-sm">
                Déjà un compte ?{' '}
                <Link 
                  href="/login" 
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 relative group"
                >
                  Se connecter
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </div>

            <div className="animate-fadeInUp delay-600">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-300 group text-sm"
              >
                <svg className="h-3 w-3 mr-1 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation personnalisés - Version simplifiée */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-90deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
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
          25%, 75% {
            transform: translateX(-3px);
          }
          50% {
            transform: translateX(3px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(0px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }

        .animate-rotateIn {
          animation: rotateIn 0.8s ease-out;
        }

        .animate-expandWidth {
          animation: expandWidth 0.8s ease-out 0.6s both;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 1.5s;
        }

        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite 3s;
        }

        .animate-float-reverse {
          animation: float-reverse 5.5s ease-in-out infinite 0.8s;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}