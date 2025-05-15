// Fichier: app/api/commentaires/dossier/[dossierId]/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour récupérer les commentaires d'un dossier
export async function GET(request, { params }) {
  try {
    // Attendre l'objet params entier, puis accéder à ses propriétés
    const paramsObj = await params;
    const dossierId = paramsObj.dossierId;
    
    console.log(`Route API - Récupération des commentaires pour le dossier ${dossierId}`);
    
    // Extraire les paramètres de pagination si présents
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || 0;
    const size = url.searchParams.get('size') || 20;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Récupération des commentaires: Authentification manquante');
      return NextResponse.json(
        { error: 'Authentification requise' }, 
        { status: 401 }
      );
    }
    
    let commentairesData;
    
    try {
      // Appeler l'API backend avec l'endpoint standard
      console.log(`Tentative API standard: GET ${API_URL}/api/commentaires/dossier/${dossierId}`);
      const response = await axios.get(
        `${API_URL}/api/commentaires/dossier/${dossierId}`,
        {
          params: { page, size },
          headers: { 'Authorization': authHeader },
          timeout: 20000
        }
      );
      
      console.log(`API standard: Succès (${response.status})`);
      commentairesData = response.data;
    } catch (standardError) {
      console.log(`API standard: Échec (${standardError.response?.status || 'inconnu'})`);
      
      if (standardError.response?.status === 403) {
        // Si erreur 403, essayer l'endpoint public
        console.log(`Tentative API publique: GET ${API_URL}/api/commentaires/dossier/${dossierId}/public`);
        try {
          const publicResponse = await axios.get(
            `${API_URL}/api/commentaires/dossier/${dossierId}/public`,
            {
              params: { page, size },
              headers: { 'Authorization': authHeader },
              timeout: 20000
            }
          );
          
          console.log(`API publique: Succès (${publicResponse.status})`);
          commentairesData = publicResponse.data;
        } catch (publicError) {
          console.log(`API publique: Échec (${publicError.response?.status || 'inconnu'})`);
          throw publicError;
        }
      } else {
        throw standardError;
      }
    }
    
    // Traiter les données pour s'assurer que la structure est correcte
    const processedData = processCommentairesData(commentairesData);
    
    console.log(`Route API - Renvoi de ${processedData.content?.length || processedData.length || 0} commentaires`);
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires:`, error);
    
    // En développement, retourner des données statiques
    if (process.env.NODE_ENV === 'development') {
      console.log('Utilisation de données statiques en développement suite à une erreur');
      return NextResponse.json({
        content: getStaticCommentaires(),
        totalElements: getStaticCommentaires().length,
        totalPages: 1,
        size: 20,
        number: 0,
        mock: true
      });
    }
    
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération des commentaires', 
        details: error.message,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Fonction pour traiter et normaliser les données des commentaires
function processCommentairesData(data) {
  // Si pas de données, retourner un tableau vide
  if (!data) return { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
  
  // Déterminer la structure des données
  let commentaires = [];
  let metadata = {};
  
  if (Array.isArray(data)) {
    // Cas 1: Les données sont un tableau simple de commentaires
    commentaires = data;
    metadata = {
      totalElements: data.length,
      totalPages: 1,
      size: data.length,
      number: 0
    };
  } else if (data.content && Array.isArray(data.content)) {
    // Cas 2: Les données sont une réponse paginée avec un champ content
    commentaires = data.content;
    metadata = {
      totalElements: data.totalElements || data.content.length,
      totalPages: data.totalPages || 1,
      size: data.size || data.content.length,
      number: data.number || 0
    };
  } else {
    // Cas 3: Structure inconnue, on considère que c'est un seul commentaire
    commentaires = [data];
    metadata = {
      totalElements: 1,
      totalPages: 1,
      size: 1,
      number: 0
    };
  }
  
  // Normaliser chaque commentaire
  const normalizedCommentaires = commentaires.map(comment => {
    // S'assurer que l'utilisateur a la bonne structure
    const user = comment.utilisateur || {};
    
    return {
      id: comment.id,
      contenu: comment.contenu,
      dateCreation: comment.dateCreation,
      utilisateur: {
        id: user.id || 0,
        nom: user.nom || 'Inconnu',
        prenom: user.prenom || '',
        role: user.role || 'INCONNU'
      }
    };
  });
  
  // Retourner les données avec la même structure
  if (Array.isArray(data)) {
    return normalizedCommentaires;
  } else {
    return {
      ...metadata,
      content: normalizedCommentaires
    };
  }
}

// Fonction pour obtenir des données statiques de commentaires
function getStaticCommentaires() {
  return [
    {
      id: 101,
      contenu: "Ce dossier présente des lacunes importantes concernant l'analyse des impacts environnementaux.",
      dateCreation: "2025-05-11T14:10:00",
      utilisateur: {
        id: 201,
        nom: "Nom1",
        prenom: "Mem1",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 102,
      contenu: "Je partage cet avis. De plus, les mesures compensatoires proposées semblent insuffisantes.",
      dateCreation: "2025-05-12T14:10:00",
      utilisateur: {
        id: 202,
        nom: "Nom2",
        prenom: "Mem2",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 103,
      contenu: "J'ai contacté le service technique pour obtenir des précisions. Nous devrions recevoir des compléments d'ici la fin de la semaine.",
      dateCreation: "2025-05-13T14:10:00",
      utilisateur: {
        id: 203,
        nom: "Nom3",
        prenom: "Mem3",
        role: "COORDINATEUR"
      }
    }
  ];
}