// app/api/dossiers/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request) {
  try {
    // Extraire le paramètre statut
    const url = new URL(request.url);
    const statut = url.searchParams.get('statut');
    
    console.log(`API Route: Récupération des dossiers avec statut=${statut}`);
    
    // Extraire le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("API Route: Erreur d'authentification");
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Construire l'URL complète pour la requête backend
    const apiUrl = `${API_URL}/api/dossiers`;
    console.log(`API Route: Appel vers ${apiUrl} avec statut=${statut}`);
    
    // Faire la requête avec des paramètres explicites
    const response = await axios.get(apiUrl, {
      params: { statut: statut },
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API Route: Réponse reçue avec statut ${response.status} pour statut=${statut}`);
    
    // Retourner la réponse sans modification
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`API Route: Erreur pour statut=${statut}:`, error);
    
    if (error.response) {
      console.error("Données:", error.response.data);
      console.error("Statut:", error.response.status);
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur lors de la récupération des dossiers' },
      { status: error.response?.status || 500 }
    );
  }
}


// Gestion des requêtes POST pour /api/dossiers
export async function POST(request) {
  try {
    // Récupérer le token d'autorisation de la requête entrante
    const authHeader = request.headers.get('authorization');
    
    // Vérifier si l'en-tête d'authentification est présent et au bon format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Erreur d\'authentification: token manquant ou incorrect');
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Logs de débogage pour vérifier l'en-tête d'autorisation (masqué pour sécurité)
    console.log("Requête vers /api/dossiers (POST)");
    console.log("Header d'autorisation reçu:", authHeader.substring(0, 20) + "...");
    
    // Récupérer le corps de la requête
    const requestData = await request.json();
    console.log("Données reçues du client:", requestData);
    
    // URL complète pour débogage
    const requestUrl = `${API_URL}/api/dossiers`;
    console.log("URL de la requête au backend:", requestUrl);
    
    // Appeler l'API backend avec la méthode correspondant à ce qu'attend le contrôleur Spring
    // Essayons les trois formats possibles
    let response;
    
    try {
      console.log("Tentative 1: Envoi des données en tant que paramètres d'URL");
      response = await axios.post(requestUrl, null, {
        params: {
          typeDemandeId: requestData.typeDemandeId,
          adresseDeposant: requestData.adresseDeposant,
          telephoneDeposant: requestData.telephoneDeposant
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.log("Tentative 1 échouée:", error.message);
      console.log("Tentative 2: Envoi des données en tant que FormData");
      
      const formData = new URLSearchParams();
      formData.append('typeDemandeId', requestData.typeDemandeId);
      formData.append('adresseDeposant', requestData.adresseDeposant);
      formData.append('telephoneDeposant', requestData.telephoneDeposant);
      
      response = await axios.post(requestUrl, formData, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });
    }
    
    // Log pour vérifier la réponse du backend
    console.log("Réponse du backend:", response.status);
    console.log("Données reçues du backend:", response.data);
    
    // Retourner les données au client
    return NextResponse.json(response.data);
  } catch (error) {
    // Logs détaillés pour le débogage
    console.error('Erreur lors de la création du dossier:', error.message);
    
    if (error.response) {
      console.error('Statut de l\'erreur:', error.response.status);
      console.error('Données de l\'erreur:', error.response.data);
      
      // Si l'erreur est liée à l'autorisation (403), ajouter des logs spécifiques
      if (error.response.status === 403) {
        console.error('Erreur d\'autorisation (403) - Vérifiez les rôles et permissions de l\'utilisateur');
      }
      
      return NextResponse.json(
        { 
          message: error.response.data.message || `Erreur ${error.response.status}`,
          details: error.response.data
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      console.error('Requête sans réponse:', error.request);
      return NextResponse.json(
        { message: 'Le serveur n\'a pas répondu à la requête' },
        { status: 504 }
      );
    } else {
      console.error('Erreur de configuration de la requête:', error.message);
      return NextResponse.json(
        { message: 'Erreur lors de la préparation de la requête: ' + error.message },
        { status: 500 }
      );
    }
  }
}
