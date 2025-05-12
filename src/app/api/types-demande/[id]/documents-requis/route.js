// app/api/types-demande/[id]/documents-requis/route.js

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/config';

// Récupérer tous les documents requis pour un type de demande
export async function GET(request, { params }) {
  try {
    const id  = params.id;
    console.log("Récupération des documents requis pour:", id);
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Appel au backend
    const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}/documents-requis`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Statut réponse backend:", response.status);
    
    // Traiter le contenu brut de la réponse
    const responseText = await response.text();
    console.log("Contenu de la réponse:", responseText);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: responseText || `Erreur ${response.status}` },
        { status: response.status }
      );
    }
    
    // Convertir le texte en JSON si non vide
    const docsData = responseText ? JSON.parse(responseText) : [];
    return NextResponse.json(docsData);
  } catch (error) {
    console.error("Erreur complète:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Ajouter un nouveau document requis à un type de demande
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Récupérer les données du document requis
    const documentRequis = await request.json();
    console.log(`Ajout d'un document requis au type de demande ${id}:`, documentRequis);
    
    // Construire la requête vers le backend Java
    const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}/documents-requis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentRequis)
    });
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend:", errorText);
      return NextResponse.json(
        { error: `Erreur ${response.status}: ${response.statusText || "Erreur serveur"}` },
        { status: response.status }
      );
    }
    
    const newDocumentRequis = await response.json();
    return NextResponse.json(newDocumentRequis);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un document requis:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'ajout du document requis' },
      { status: 500 }
    );
  }
}

// Configurer tous les documents requis d'un type de demande
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
    
    // Récupérer la liste des documents requis
    const documentsRequis = await request.json();
    console.log(`Configuration des documents requis pour le type de demande ${id}`);
    
    // Construire la requête vers le backend Java
    const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}/documents-requis`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentsRequis)
    });
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend:", errorText);
      return NextResponse.json(
        { error: `Erreur ${response.status}: ${response.statusText || "Erreur serveur"}` },
        { status: response.status }
      );
    }
    
    const result = await response.text();
    return NextResponse.json({ message: result || "Documents requis configurés avec succès" });
  } catch (error) {
    console.error('Erreur lors de la configuration des documents requis:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la configuration des documents requis' },
      { status: 500 }
    );
  }
}