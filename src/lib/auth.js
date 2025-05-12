// lib/auth.js
import jwt from 'jsonwebtoken';

/**
 * Vérifie la validité d'un token JWT
 * @param {string} token - Le token JWT à vérifier
 * @returns {object|null} - Les données décodées du token ou null si invalide
 */
export async function verifyToken(token) {
  if (!token) {
    return null;
  }
  
  try {
    // Dans un environnement de production, utilisez une clé secrète sécurisée
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a le rôle d'administrateur
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - True si l'utilisateur est admin, false sinon
 */
export async function isAdmin(token) {
  const decoded = await verifyToken(token);
  return decoded && decoded.role === 'ADMINISTRATEUR';
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 * @param {string} token - Le token JWT à vérifier
 * @param {Array<string>} roles - Liste des rôles autorisés
 * @returns {boolean} - True si l'utilisateur a l'un des rôles, false sinon
 */
export async function hasRole(token, roles) {
  const decoded = await verifyToken(token);
  return decoded && roles.includes(decoded.role);
}