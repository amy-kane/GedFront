// Fichier: app/api/documents/dossier/[id]/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    // Attendre l'objet params entier, puis accéder à ses propriétés
    const paramsObj = await params;
    const id = paramsObj.id;
    
    console.log(`Récupération des documents pour le dossier ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const response = await axios.get(
      `${API_URL}/api/documents/dossier/${id}`,
      {
        headers: {
          'Authorization': authHeader
        }
      }
    );

    console.log(`Documents récupérés pour le dossier ${id}, statut: ${response.status}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des documents:`, error);
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération des documents', 
        details: error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}