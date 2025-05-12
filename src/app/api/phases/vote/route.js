// app/api/phases/vote/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour /api/phases/vote
export async function POST(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer les paramètres de l'URL
    const url = new URL(request.url);
    const dossierId = url.searchParams.get('dossierId');
    const description = url.searchParams.get('description');
    
    if (!dossierId) {
      return NextResponse.json({ error: 'ID du dossier manquant' }, { status: 400 });
    }
    
    console.log(`Création d'une phase de vote pour le dossier ${dossierId}`);
    
    // Appeler l'API backend
    const response = await axios.post(
      `${API_URL}/api/phases/vote`,
      null,
      {
        params: {
          dossierId: dossierId,
          description: description
        },
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Erreur lors de la création de la phase de vote:", error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour initier une phase de vote' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: error.response.data.message || 'Paramètres invalides' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}