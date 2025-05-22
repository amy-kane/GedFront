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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte déposant
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous si vous avez déjà un compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.nom ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.nom && (
                    <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.prenom ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {errors.prenom && (
                    <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="votre.email@exemple.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Sexe et Âge */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sexe" className="block text-sm font-medium text-gray-700">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="sexe"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.sexe ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez</option>
                    <option value="MASCULIN">Masculin</option>
                    <option value="FEMININ">Féminin</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  {errors.sexe && (
                    <p className="mt-1 text-sm text-red-600">{errors.sexe}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Âge <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.age ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre âge"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Minimum 18 ans</p>
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type="password"
                  autoComplete="new-password"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.motDePasse ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.motDePasse && (
                  <p className="mt-1 text-sm text-red-600">{errors.motDePasse}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Au moins 8 caractères, une majuscule et un chiffre
                </p>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmMotDePasse" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmMotDePasse"
                  name="confirmMotDePasse"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmMotDePasse}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.confirmMotDePasse ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmMotDePasse && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmMotDePasse}</p>
                )}
              </div>
            </div>

            {/* Bouton de soumission */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}