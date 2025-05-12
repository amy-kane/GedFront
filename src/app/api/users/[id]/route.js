// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/config';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Récupérer les données de l'utilisateur depuis le corps de la requête
    const userData = await request.json();
    
    // Transformer les données JSON en paramètres de requête pour correspondre aux @RequestParam
    const urlParams = new URLSearchParams();
    if (userData.nom) urlParams.append('nom', userData.nom);
    if (userData.prenom) urlParams.append('prenom', userData.prenom);
    if (userData.email) urlParams.append('email', userData.email);
    if (userData.motDePasse) urlParams.append('motDePasse', userData.motDePasse);
    if (userData.role) urlParams.append('role', userData.role);
    
    // Construire la requête vers le backend Java
    console.log(`Tentative de mise à jour de l'utilisateur ${id}`);
    console.log("Paramètres envoyés:", urlParams.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/users/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlParams.toString()
    });
    
    console.log(`Réponse du backend pour la mise à jour: ${response.status}`);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend lors de la mise à jour:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.message || `Erreur ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Erreur ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }
    }
    
    // Récupérer les données de l'utilisateur mis à jour
    const updatedUser = await response.json();
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur API mise à jour utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la mise à jour' },
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
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    console.log(`Tentative de suppression de l'utilisateur ${id}`);
    
    // Faire une requête vers le backend pour supprimer l'utilisateur
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Réponse du backend pour la suppression: ${response.status}`);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend lors de la suppression:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.message || `Erreur ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Erreur ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur API suppression utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    );
  }
}