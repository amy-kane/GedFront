// app/api/documents/[id]/preview/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    // Appel direct à l'API backend
    const response = await axios.get(`${API_URL}/api/documents/${id}/preview`, {
      headers: {
        'Authorization': authHeader
      },
      responseType: 'arraybuffer' // Important pour les données binaires
    });
    
    // Créer une réponse avec le type MIME correct sans charset
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"'
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la prévisualisation du document ${params.id}:`, error);
    
    // En cas d'erreur, retourner un message d'erreur
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}