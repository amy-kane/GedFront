// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';

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
    // TODO: Vérifier le token avec votre service JWT
    
    // Faire une requête vers votre backend pour récupérer l'utilisateur
    const response = await fetch(`http://votre-backend.com/api/users/${id}`, {
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
    // TODO: Vérifier le token avec votre service JWT
    
    // Récupérer les données de mise à jour
    const userData = await request.json();
    
    // Faire une requête vers votre backend pour mettre à jour l'utilisateur
    const response = await fetch(`http://votre-backend.com/api/users/${id}`, {
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
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
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
    // TODO: Vérifier le token avec votre service JWT
    
    // Faire une requête vers votre backend pour supprimer l'utilisateur
    const response = await fetch(`http://localhost:8081/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API suppression utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}