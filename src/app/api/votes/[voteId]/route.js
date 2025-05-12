// app/api/votes/[voteId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour modifier un vote
export async function PUT(request, { params }) {
  try {
    const { voteId } = params;
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const decision = url.searchParams.get('decision');
    const commentaire = url.searchParams.get('commentaire');
    
    if (!decision) {
      return NextResponse.json(
        { message: 'Décision requise' },
        { status: 400 }
      );
    }
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Modification du vote ${voteId} vers ${decision}`);
    
    // Appeler l'API backend
    const response = await axios.put(
      `${API_URL}/api/votes/${voteId}`,
      {},
      {
        params: {
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
    console.error(`Erreur lors de la modification du vote ${params.voteId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous ne pouvez modifier que vos propres votes' },
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