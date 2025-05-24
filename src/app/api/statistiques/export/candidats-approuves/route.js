// src/app/api/statistiques/export/candidats-approuves/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const typeDemandeId = searchParams.get('typeDemandeId');
    
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Construire l'URL du backend avec les paramètres
    let backendUrl = 'http://localhost:8081/api/statistiques/export/candidats-approuves';
    if (typeDemandeId) {
      backendUrl += `?typeDemandeId=${typeDemandeId}`;
    }

    // Faire l'appel au backend Spring Boot
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Erreur backend export candidats approuvés:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de l\'export des candidats approuvés' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur API export candidats approuvés:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'export des candidats approuvés' },
      { status: 500 }
    );
  }
}