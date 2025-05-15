// app/api/phases/dossier/[dossierId]/active/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Définir le handler GET
async function handler(request, context) {
  try {
    // Récupération sécurisée du dossierId
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    // Le dossierId est l'avant-dernier segment (avant "active")
    const dossierId = segments[segments.length - 2];

    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération de la phase active pour le dossier ${dossierId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(
        `${API_URL}/api/phases/dossier/${dossierId}/active`,
        {
          headers: { 'Authorization': authHeader },
          timeout: 15000 // 15 secondes
        }
      );
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error(`Erreur API lors de la récupération de la phase active:`, apiError.message);
      
      // Si c'est une erreur 404 (pas de phase active), retourner null
      if (apiError.response?.status === 404) {
        return NextResponse.json(null);
      }
      
      // Pour d'autres erreurs, retourner le statut d'erreur
      return NextResponse.json(
        { 
          message: apiError.response?.data?.message || 'Erreur serveur',
          error: apiError.message
        },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error(`Erreur route lors de la récupération de la phase active:`, error);
    
    return NextResponse.json(
      { message: error.message || 'Erreur serveur inattendue' },
      { status: 500 }
    );
  }
}

// Exporter seulement la fonction GET sans destructurer params
export async function GET(request, context) {
  return handler(request, context);
}