// app/api/phases/dossier/[dossierId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/phases/dossier/[dossierId]
export async function GET(request, { params }) {
  try {
    const { dossierId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des phases pour le dossier ${dossierId}`);
    
    // Appeler l'API backend
    const response = await axios.get(`${API_URL}/api/phases/dossier/${dossierId}`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des phases pour le dossier ${params.dossierId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour consulter les phases de ce dossier' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}