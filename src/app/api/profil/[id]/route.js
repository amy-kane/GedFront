// app/api/profil/[id]/route.js

import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Récupérer les données du body
    const body = await request.json();

    console.log('Mise à jour profil pour ID:', id);
    console.log('Données reçues:', body);

    // Faire l'appel au backend Spring Boot
    const backendResponse = await fetch(`http://localhost:8081/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Erreur backend mise à jour profil:', errorText);
      
      // Gestion des différents codes d'erreur
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      } else if (backendResponse.status === 403) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        );
      } else if (backendResponse.status === 400) {
        return NextResponse.json(
          { error: 'Données invalides' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: backendResponse.status }
        );
      }
    }

    const data = await backendResponse.json();
    console.log('Profil mis à jour avec succès:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur API mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    console.log('Récupération profil pour ID:', id);

    // Faire l'appel au backend Spring Boot pour récupérer le profil
    const backendResponse = await fetch(`http://localhost:8081/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Erreur backend récupération profil:', errorText);
      
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      } else if (backendResponse.status === 403) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: 'Erreur lors de la récupération du profil' },
          { status: backendResponse.status }
        );
      }
    }

    const data = await backendResponse.json();
    console.log('Profil récupéré avec succès:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur API récupération profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération' },
      { status: 500 }
    );
  }
}