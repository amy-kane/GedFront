// app/api/notifications/marquer-toutes-lues/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour marquer toutes les notifications comme lues
export async function PUT(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log('Marquage de toutes les notifications comme lues');
    
    // Appeler l'API backend
    const response = await axios.put(
      `${API_URL}/api/notifications/marquer-toutes-lues`,
      {},
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json({ count: response.data });
  } catch (error) {
    console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}