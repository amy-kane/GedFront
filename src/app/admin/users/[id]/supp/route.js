// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';

// URL du backend Spring Boot
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer le token et vérifier sa validité
    const token = authHeader.split(' ')[1];
    
    // Faire une requête vers le backend pour récupérer l'utilisateur
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
    
    const user = await response.json();
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur API utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer le token et vérifier sa validité
    const token = authHeader.split(' ')[1];
    
    // Récupérer les données de mise à jour
    const userData = await request.json();
    
    // Faire une requête vers le backend pour mettre à jour l'utilisateur
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
    
    const updatedUser = await response.json();
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur API mise à jour utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer le token et vérifier sa validité
    const token = authHeader.split(' ')[1];
    
    // Faire une requête vers le backend pour supprimer l'utilisateur
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la suppression de l\'utilisateur');
    }
    
    return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur API suppression utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}