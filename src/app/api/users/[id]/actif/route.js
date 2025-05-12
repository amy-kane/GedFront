// app/api/users/[id]/actif/route.js
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
    
    // Récupérer le statut actif depuis le corps de la requête
    const data = await request.json();
    const active = data.active;
    
    console.log(`Tentative de modification du statut de l'utilisateur ${id} à ${active}`);
    
    // Faire une requête vers le backend pour mettre à jour l'utilisateur
    // Notez que selon votre contrôleur Spring, le paramètre "active" doit être envoyé en query parameter
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/actif?active=${active}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Réponse du backend pour l'activation/désactivation: ${response.status}`);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend lors de la modification du statut:", errorText);
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
    
    // Si la réponse est un texte simple (comme "Statut utilisateur mis à jour")
    const responseText = await response.text();
    
    return NextResponse.json({ 
      success: true, 
      message: responseText || 'Statut utilisateur mis à jour' 
    });
  } catch (error) {
    console.error('Erreur API modification statut utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la modification du statut' },
      { status: 500 }
    );
  }
}