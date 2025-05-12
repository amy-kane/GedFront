// app/api/votes/phase/[phaseId]/mon-vote/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour récupérer le vote de l'utilisateur pour une phase
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération du vote de l'utilisateur pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    const response = await axios.get(
      `${API_URL}/api/votes/phase/${phaseId}/mon-vote`,
      {
        headers: {
          'Authorization': authHeader
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération du vote pour la phase ${params.phaseId}:`, error);
    
    // Si l'utilisateur n'a pas encore voté, c'est normal
    if (error.response?.status === 404) {
      return NextResponse.json(
        { message: 'Aucun vote trouvé pour cette phase' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}