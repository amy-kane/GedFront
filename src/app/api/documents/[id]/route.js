// app/api/documents/[id]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/documents/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`Récupération du document avec l'ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer le fichier du document à partir du backend
    const response = await axios.get(`${API_URL}/api/documents/${id}`, {
      headers: {
        'Authorization': authHeader
      },
      responseType: 'arraybuffer' // Important pour récupérer les données binaires
    });
    
    // Construire la réponse avec les données binaires et le type de contenu approprié
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const disposition = response.headers['content-disposition'] || '';
    
    // Créer une réponse avec le type MIME correct
    const nextResponse = new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition
      }
    });
    
    return nextResponse;
  } catch (error) {
    console.error(`Erreur lors de la récupération du document ${params.id}:`, error);
    
    if (error.response && error.response.status === 404) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}