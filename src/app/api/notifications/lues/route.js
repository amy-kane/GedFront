// app/api/notifications/lues/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes DELETE pour supprimer les notifications lues
export async function DELETE(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log('Suppression des notifications lues');
    
    // Appeler l'API backend
    const response = await axios.delete(
      `${API_URL}/api/notifications/lues`,
      {
        headers: {
          'Authorization': authHeader
        }
      }
    );
    
    return NextResponse.json({ count: response.data });
  } catch (error) {
    console.error("Erreur lors de la suppression des notifications lues:", error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}