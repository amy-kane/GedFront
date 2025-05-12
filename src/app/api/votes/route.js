// app/api/votes/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour créer un vote
export async function POST(request) {
  try {
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const phaseId = url.searchParams.get('phaseId');
    const decision = url.searchParams.get('decision');
    const commentaire = url.searchParams.get('commentaire');
    
    if (!phaseId || !decision) {
      return NextResponse.json(
        { message: 'ID de la phase et décision requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Création d'un vote ${decision} pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    const response = await axios.post(
      `${API_URL}/api/votes`,
      {},
      {
        params: {
          phaseId: phaseId,
          decision: decision,
          commentaire: commentaire || ''
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Erreur lors de la création du vote:", error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour voter sur cette phase' },
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