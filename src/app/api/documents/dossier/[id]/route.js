// app/api/documents/dossier/[id]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/documents/dossier/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`Récupération des documents pour le dossier ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Appel à l'API backend
    const response = await axios.get(`${API_URL}/api/documents/dossier/${id}`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    console.log(`Documents récupérés pour le dossier ${id}, statut: ${response.status}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des documents pour le dossier ${params.id}:`, error);
    
    // Si le backend renvoie une erreur 404, cela signifie qu'aucun document n'est trouvé
    // Dans ce cas, renvoyer un tableau vide plutôt qu'une erreur
    if (error.response && error.response.status === 404) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}