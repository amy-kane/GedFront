// app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Register() {
  // Utilisation du routeur Next.js pour les redirections
  const router = useRouter();
  
  // État local pour gérer les données du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
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

  // Fonction qui gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation des champs obligatoires
    if (!formData.prenom || !formData.nom || !formData.email || !formData.motDePasse) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    // Vérification que les mots de passe correspondent
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    // Vérification de la longueur minimale du mot de passe
    if (formData.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Vérification des critères de complexité du mot de passe
    // selon les règles définies dans UserService.java
    const hasUppercase = /[A-Z]/.test(formData.motDePasse);
    const hasDigit = /\d/.test(formData.motDePasse);
    
    if (!hasUppercase || !hasDigit) {
      setError('Le mot de passe doit contenir au moins une majuscule et un chiffre');
      return;
    }
    
    // Activation de l'indicateur de chargement
    setLoading(true);
    
    try {
      // Envoi de la requête d'inscription au backend via notre API proxy
      // On utilise URLSearchParams pour formater les données comme attendu par le backend
      const response = await axios.post('/api/auth/register', new URLSearchParams({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded' // Format attendu par le contrôleur Spring Boot
        }
      });
      
      // Si l'inscription réussit, on stocke le token JWT et les infos utilisateur
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirection vers la page de création de dossier
        router.push('/deposant/creer-dossier');
      }
    } catch (err) {
      // Gestion des erreurs retournées par le backend
      console.error('Erreur d\'inscription:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Erreur lors de l\'inscription');
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
          <h1 className="mt-4 text-2xl font-bold">Créer un compte</h1>
          <p className="text-sm text-gray-600">Système de Gestion Électronique des Documents</p>
        </div>
        
        {/* Affichage des erreurs éventuelles */}
        {error && (
          <div className="mb-4 bg-red-50 p-3 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {/* Formulaire d'inscription */}
        <form onSubmit={handleSubmit}>
          {/* Grille pour prénom et nom sur la même ligne (responsive) */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nom"
              />
            </div>
          </div>
          
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
          <div className="mb-4">
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
          
          {/* Champ confirmation mot de passe */}
          <div className="mb-6">
            <label htmlFor="confirmMotDePasse" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmMotDePasse"
              name="confirmMotDePasse"
              value={formData.confirmMotDePasse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Bouton d'inscription avec état de chargement */}
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
              // Icône utilisateur
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            )}
            S inscrire
          </button>
        </form>
        
        {/* Lien vers la page de connexion */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}