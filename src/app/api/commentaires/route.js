// Fichier: app/api/commentaires/route.js (pour l'ajout de commentaires)

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour ajouter un commentaire
export async function POST(request) {
  try {
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const dossierId = url.searchParams.get('dossierId');
    const contenu = url.searchParams.get('contenu');
    
    console.log(`Route API - Ajout d'un commentaire au dossier ${dossierId}`);
    console.log(`Contenu: "${contenu.substring(0, 30)}${contenu.length > 30 ? '...' : ''}"`);
    
    if (!dossierId || !contenu) {
      return NextResponse.json(
        { message: 'ID du dossier et contenu du commentaire requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Appeler l'API backend
    console.log(`Tentative API: POST ${API_URL}/api/commentaires`);
    const response = await axios.post(
      `${API_URL}/api/commentaires`,
      null,
      {
        params: {
          dossierId: dossierId,
          contenu: contenu
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );
    
    console.log(`API: Succès (${response.status})`);
    
    // Ajouter des informations utilisateur factices si manquantes
    let responseData = response.data;
    
    // Si l'utilisateur est manquant, essayer de l'extraire du token
    if (responseData && !responseData.utilisateur) {
      console.log("Ajout d'informations utilisateur manquantes au commentaire");
      
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        responseData.utilisateur = {
          id: payload.userId || 999,
          nom: payload.lastName || "Utilisateur",
          prenom: payload.firstName || "Actuel",
          role: payload.role || "MEMBRE_COMITE"
        };
      } catch (e) {
        console.error("Impossible d'extraire les infos utilisateur du token:", e);
        
        // Fournir des informations utilisateur par défaut
        responseData.utilisateur = {
          id: 999,
          nom: "Utilisateur",
          prenom: "Actuel",
          role: "MEMBRE_COMITE"
        };
      }
    }
    
    console.log(`Route API - Commentaire ajouté avec succès (ID: ${responseData.id})`);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    
    return NextResponse.json(
      { 
        message: 'Erreur lors de l\'ajout du commentaire', 
        details: error.message,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}