// app/api/notifications/[notificationId]/marquer-lue/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour marquer une notification comme lue
export async function PUT(request, { params }) {
  try {
    const { notificationId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Marquage de la notification ${notificationId} comme lue`);
    
    // Appeler l'API backend
    const response = await axios.put(
      `${API_URL}/api/notifications/${notificationId}/marquer-lue`,
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
    console.error(`Erreur lors du marquage de la notification ${params.notificationId} comme lue:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 404) {
      return NextResponse.json(
        { message: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Cette notification ne vous appartient pas' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}