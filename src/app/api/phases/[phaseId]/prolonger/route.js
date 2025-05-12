// app/api/phases/[phaseId]/prolonger/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour /api/phases/[phaseId]/prolonger
export async function PUT(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer les paramètres de l'URL
    const url = new URL(request.url);
    const joursSupplementaires = url.searchParams.get('joursSupplementaires');
    
    if (!joursSupplementaires || isNaN(joursSupplementaires) || parseInt(joursSupplementaires) <= 0) {
      return NextResponse.json({ error: 'Nombre de jours supplémentaires invalide' }, { status: 400 });
    }
    
    console.log(`Prolonger la phase ${phaseId} de ${joursSupplementaires} jours`);
    
    // Appeler l'API backend
    const response = await axios.put(
      `${API_URL}/api/phases/${phaseId}/prolonger`,
      {},
      {
        params: {
          joursSupplementaires: parseInt(joursSupplementaires)
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la prolongation de la phase ${params.phaseId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour prolonger cette phase' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: error.response.data.message || 'La phase ne peut pas être prolongée' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}