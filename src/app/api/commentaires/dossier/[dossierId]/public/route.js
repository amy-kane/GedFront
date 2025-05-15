// Fichier: app/api/commentaires/dossier/[dossierId]/public/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour récupérer les commentaires d'un dossier sans authentification
export async function GET(request, { params }) {
  try {
    // Attendre l'objet params entier, puis accéder à ses propriétés
    const paramsObj = await params;
    const dossierId = paramsObj.dossierId;
    
    console.log(`Récupération publique des commentaires pour le dossier ${dossierId}`);
    
    // Extraire les paramètres de pagination si présents
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || 0;
    const size = url.searchParams.get('size') || 20;
    
    // Récupérer le token d'authentification éventuel
    const authHeader = request.headers.get('authorization') || '';
    
    try {
      // Appeler l'API backend en utilisant l'endpoint public
      const response = await axios.get(
        `${API_URL}/api/commentaires/dossier/${dossierId}/public`,
        {
          params: {
            page,
            size
          },
          headers: authHeader ? { 'Authorization': authHeader } : {},
          timeout: 20000 // Augmenter à 20 secondes
        }
      );
      
      // Si la réponse est réussie, retourner les données
      return NextResponse.json(response.data);
    } catch (error) {
      // En développement, retourner des données statiques
      if (process.env.NODE_ENV === 'development') {
        console.log('Erreur API, utilisation de données statiques en développement');
        return NextResponse.json(getStaticCommentairesPublic());
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires publics:`, error);
    
    // En développement, retourner des données statiques même en cas d'erreur
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getStaticCommentairesPublic());
    }
    
    // En production, retourner l'erreur
    return NextResponse.json(
      { 
        message: error.response?.data?.message || 'Erreur lors de la récupération des commentaires', 
        details: error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Fonction pour obtenir des données statiques de commentaires publics
function getStaticCommentairesPublic() {
  return {
    content: [
      {
        id: 101,
        contenu: "Ce dossier présente des données intéressantes sur l'aspect environnemental.",
        dateCreation: "2025-05-11T14:10:00",
        utilisateur: {
          id: 201,
          nom: "Membre",
          prenom: "Comité",
          role: "MEMBRE_COMITE"
        }
      },
      {
        id: 102,
        contenu: "Les propositions semblent pertinentes et bien structurées.",
        dateCreation: "2025-05-12T14:10:00",
        utilisateur: {
          id: 202,
          nom: "Expert",
          prenom: "Technique",
          role: "MEMBRE_COMITE"
        }
      },
      {
        id: 103,
        contenu: "Nous avons reçu des précisions complémentaires qui clarifient les points soulevés.",
        dateCreation: "2025-05-13T14:10:00",
        utilisateur: {
          id: 203,
          nom: "Coordinateur",
          prenom: "Projet",
          role: "COORDINATEUR"
        }
      }
    ],
    totalElements: 3,
    totalPages: 1,
    size: 20,
    number: 0,
    mock: true
  };
}