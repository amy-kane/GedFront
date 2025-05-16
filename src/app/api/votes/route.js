// app/api/votes/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour /api/votes
export async function POST(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const phaseId = url.searchParams.get('phaseId');
    const decision = url.searchParams.get('decision');
    const commentaire = url.searchParams.get('commentaire');
    
    if (!phaseId || !decision) {
      return NextResponse.json(
        { message: 'ID de phase et décision requis' },
        { status: 400 }
      );
    }
    
    console.log(`Ajout d'un vote pour la phase ${phaseId}: ${decision}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.post(`${API_URL}/api/votes`, null, {
        params: {
          phaseId: phaseId,
          decision: decision,
          commentaire: commentaire
        },
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de l'ajout du vote:", apiError);
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(getSimulatedVote(phaseId, decision, commentaire));
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de l\'ajout du vote' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du vote:", error);
    
    // En développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getSimulatedVote());
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout du vote' },
      { status: 500 }
    );
  }
}

// Fonction pour obtenir un vote simulé
function getSimulatedVote(phaseId = 1, decision = 'FAVORABLE', commentaire = '') {
  return {
    id: Date.now(),
    decision: decision,
    commentaire: commentaire,
    dateCreation: new Date().toISOString(),
    utilisateur: {
      id: 1,
      nom: "Coordinateur",
      prenom: "Test",
      role: "COORDINATEUR"
    },
    phase: { id: parseInt(phaseId) }
  };
}