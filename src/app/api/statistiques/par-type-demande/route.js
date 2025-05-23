// src/app/api/statistiques/par-type-demande/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Faire l'appel au backend Spring Boot
    const backendResponse = await fetch('http://localhost:8081/api/statistiques/par-type-demande', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Erreur backend statistiques par type:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques par type de demande' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur API statistiques par type:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques par type' },
      { status: 500 }
    );
  }
}