// app/api/phases/[phaseId]/terminer/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour /api/phases/[phaseId]/terminer
export async function PUT(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Terminer la phase ${phaseId}`);
    
    // Appeler l'API backend
    const response = await axios.put(
      `${API_URL}/api/phases/${phaseId}/terminer`,
      {},
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la terminaison de la phase ${params.phaseId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour terminer cette phase' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: error.response.data.message || 'La phase ne peut pas être terminée' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}