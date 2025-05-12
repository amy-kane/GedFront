// app/api/commentaires/route.js
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
    
    console.log(`Ajout d'un commentaire pour le dossier ${dossierId}`);
    
    // Appeler l'API backend
    const response = await axios.post(
      `${API_URL}/api/commentaires`,
      {},
      {
        params: {
          dossierId: dossierId,
          contenu: contenu
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour commenter ce dossier' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: error.response.data.message || 'Paramètres invalides' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}