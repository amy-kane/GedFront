// app/api/documents-requis/[id]/route.js
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/config';  // Utilisez la même source que vos autres routes

// Mise à jour d'un document requis
export async function PUT(request, { params }) {
  try {
    const id  = params.id;
    
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Récupérer les données du body
    const body = await request.json();
    
    console.log(`Mise à jour du document requis ${id}:`, body);
    
    // Appel à l'API backend avec API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/api/documents-requis/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log("Statut de la réponse:", response.status);
    
    // Récupérer le contenu brut de la réponse pour le débogage
    const responseText = await response.text();
    console.log("Contenu de la réponse:", responseText);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur ${response.status}: ${response.statusText || "Erreur serveur"}` },
        { status: response.status }
      );
    }
    
    // Tenter de parser la réponse comme JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Format de réponse invalide du serveur" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Suppression d'un document requis
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    console.log(`Suppression du document requis ${id}`);
    
    // Appel à l'API backend
    const response = await fetch(`${API_BASE_URL}/api/documents-requis/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Statut de la réponse:", response.status);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend:", errorText);
      return NextResponse.json(
        { error: `Erreur ${response.status}: ${response.statusText || "Erreur serveur"}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Document requis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}