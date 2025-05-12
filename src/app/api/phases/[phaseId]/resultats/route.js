// app/api/phases/[phaseId]/resultats/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/phases/[phaseId]/resultats
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des résultats de vote pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    const response = await axios.get(`${API_URL}/api/phases/${phaseId}/resultats`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des résultats de vote pour la phase ${params.phaseId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour consulter les résultats de cette phase' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: error.response.data.message || 'Cette phase n\'est pas une phase de vote' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}