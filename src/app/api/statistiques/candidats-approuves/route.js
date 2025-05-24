// src/app/api/statistiques/candidats-approuves/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    console.log('🔍 Appel candidats approuvés - Frontend');
    console.log('Auth Header:', authHeader ? 'Présent' : 'Absent');

    // Faire l'appel au backend Spring Boot
    const backendResponse = await fetch('http://localhost:8081/api/statistiques/candidats-approuves', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend Response Status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Erreur backend candidats approuvés:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des candidats approuvés', details: errorText },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Candidats approuvés récupérés:', data.length, 'candidats');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('💥 Erreur API candidats approuvés:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des candidats approuvés', details: error.message },
      { status: 500 }
    );
  }
}