// app/api/dossiers/[id]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/dossiers/[id]
export async function GET(request, { params }) {
  try {
    const id = params.id.toString();
    const authHeader = request.headers.get('authorization');
    
    const response = await axios.get(`${API_URL}/api/dossiers/${id}`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération du dossier ${params.id}:`, error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}

// Gestion des requêtes PUT pour /api/dossiers/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    const formData = await request.formData();
    
    const response = await axios.put(
      `${API_URL}/api/dossiers/${id}`,
      formData,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du dossier ${params.id}:`, error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}