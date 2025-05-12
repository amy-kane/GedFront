// app/api/users/route.js
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/config';

export async function GET(request) {
  try {
    // Récupérer le token d'authentification depuis les headers de la requête
    const authHeader = request.headers.get('authorization');
    console.log("En-tête d'autorisation reçu:", authHeader?.substring(0, 20) + "...");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    console.log("Token extrait (premiers caractères):", token.substring(0, 10) + "...");
    
    // Construire la requête vers le backend Java
    console.log("Envoi de la requête au backend:", `${API_BASE_URL}/api/users`);
    
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Statut de la réponse:", response.status);
    
    // Récupérer le contenu brut de la réponse pour le débogage
    const responseText = await response.text();
    console.log("Contenu de la réponse:", responseText);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Non autorisé - Token invalide ou expiré' }, { status: 401 });
      } else if (response.status === 403) {
        return NextResponse.json({ error: 'Accès interdit - Droits insuffisants' }, { status: 403 });
      } else if (response.status === 404) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 });
      }
      return NextResponse.json({ error: `Erreur ${response.status}: ${response.statusText || "Erreur serveur"}` }, { status: response.status });
    }
    
    // Tenter de parser la réponse comme JSON
    let users;
    try {
      users = responseText ? JSON.parse(responseText) : [];
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Format de réponse invalide du serveur" },
        { status: 500 }
      );
    }
    
    // Retourner les données au client
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    console.log("Headers reçus:", Object.fromEntries(request.headers));
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Authentification manquante ou format incorrect");
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    console.log("Token extrait (premiers caractères):", token.substring(0, 10) + "...");
    
    // Récupérer les données du nouvel utilisateur
    const userData = await request.json();
    console.log("Données utilisateur reçues:", userData);
    
    // Transformer les données JSON en paramètres de requête pour correspondre aux @RequestParam
    const params = new URLSearchParams();
    params.append('nom', userData.nom);
    params.append('prenom', userData.prenom);
    params.append('email', userData.email);
    if (userData.motDePasse) {
      params.append('motDePasse', userData.motDePasse);
    }
    params.append('role', userData.role);
    
    // Construire la requête vers le backend Java
    console.log("Envoi de la requête au backend:", `${API_BASE_URL}/api/users`);
    console.log("Paramètres envoyés:", params.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    
    console.log("Réponse du backend - statut:", response.status);
    
    // Gérer les erreurs de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur du backend:", errorText);
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
    
    // Récupérer les données de l'utilisateur créé
    const newUser = await response.json();
    console.log("Utilisateur créé avec succès:", newUser);
    
    // Retourner les données au client
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Erreur lors de la création d\'un utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}