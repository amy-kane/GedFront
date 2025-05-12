// app/api/types-demande/[id]/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { API_BASE_URL } from '@/app/config';

// Récupérer un type de demande spécifique
export async function GET(request, { params }) {
  try {
    const id  = params.id;
    console.log("Récupération du type de demande:", id);
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Appel au backend
    const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}`, {
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
    
    // Convertir le texte en JSON
    const typeData = responseText ? JSON.parse(responseText) : null;
    return NextResponse.json(typeData);
  } catch (error) {
    console.error("Erreur complète:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mise à jour d'un type de demande
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        console.log("PUT pour type de demande:", id);
      
      // Récupérer le token d'authentification
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
      }
      
      // Extraire le token
      const token = authHeader.split(' ')[1];
      
      // Récupérer les données du body
      const body = await request.json();
      console.log("Données reçues:", body);
      
      // Appel au backend
      const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      console.log("Réponse du backend:", response.status);
      
      // Gérer les erreurs
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur backend:", errorText);
        return NextResponse.json(
          { error: `Erreur ${response.status}: ${errorText}` }, 
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Erreur complète:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

// Suppression d'un type de demande
export async function DELETE(request, { params }) {
    try {
      const { id } = params;
      
      // Récupérer le token d'authentification
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
      }
      
      // Extraire le token
      const token = authHeader.split(' ')[1];
      
      console.log(`Suppression du type de demande ${id}`);
      
      // Utiliser la même URL que pour les autres opérations
      const response = await fetch(`${API_BASE_URL}/api/types-demande/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Statut de réponse:", response.status);
      
      // Gérer les erreurs
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur détaillée:", errorText);
        return NextResponse.json(
          { error: errorText || `Erreur ${response.status}` }, 
          { status: response.status }
        );
      }
      
      return NextResponse.json({ message: 'Type de demande supprimé avec succès' });
    } catch (error) {
      console.error("Erreur complète:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }