// app/config.js

// URL de base de l'API backend
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Temps d'expiration de la session (en minutes)
export const SESSION_TIMEOUT = 60;

// Configuration des tentatives de reconnexion
export const RETRY_CONFIG = {
  maxRetries: 3,
  delayBetweenRetries: 1000, // en millisecondes
};

// Formats de fichiers autorisés pour l'upload
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Taille maximale de fichier (en octets)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

// Export d'utilitaires liés à l'authentification
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

// Fonction pour vérifier si un token est expiré
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Récupérer la partie payload du token (deuxième partie)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Vérifier si le token a expiré
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (e) {
    console.error('Erreur lors de la vérification du token:', e);
    return true; // En cas d'erreur, considérer le token comme expiré
  }
};