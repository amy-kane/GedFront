// app/api/users/[id]/actif/route.js
import { NextResponse } from 'next/server';

// URL du backend Spring Boot
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Récupérer les données de la mise à jour
    const data = await request.json();
    
    // Vérifier que le statut actif est bien fourni
    if (data.active === undefined) {
      return NextResponse.json(
        { error: 'Le paramètre "active" est requis' },
        { status: 400 }
      );
    }
    
    // Construire la requête vers le backend Java
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/actif?active=${data.active}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Erreur ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Récupérer le message de succès
    const successMessage = await response.text();
    
    // Retourner les données au client
    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    console.error('Erreur lors de la modification du statut utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la modification du statut' },
      { status: 500 }
    );
  }
}