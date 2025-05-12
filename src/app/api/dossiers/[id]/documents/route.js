// app/api/dossiers/[id]/documents/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/dossiers/[id]/documents
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`Récupération des documents pour le dossier ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    const response = await axios.get(`${API_URL}/api/dossiers/${id}/documents`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    console.log(`Documents récupérés pour le dossier ${id}, statut: ${response.status}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des documents pour le dossier ${params.id}:`, error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}

// Gestion des requêtes POST pour /api/dossiers/[id]/documents
export async function POST(request, { params }) {
  try {
    const { id } = params;
    console.log(`Ajout d'un document au dossier ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer les données du formulaire (fichier + métadonnées)
    const formData = await request.formData();
    console.log("FormData reçu pour l'upload de document");
    
    // Créer une nouvelle instance FormData pour l'envoi à axios
    const axiosFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      axiosFormData.append(key, value);
      // Ne pas logger les fichiers complets pour éviter de surcharger les logs
      if (value instanceof File) {
        console.log(`Fichier reçu: ${key}, nom: ${value.name}, taille: ${value.size} bytes`);
      } else {
        console.log(`Champ: ${key}, valeur: ${value}`);
      }
    }
    
    // Envoyer au backend
    const response = await axios.post(
      `${API_URL}/api/dossiers/${id}/documents`,
      axiosFormData,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log(`Document ajouté au dossier ${id}, statut: ${response.status}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un document au dossier ${params.id}:`, error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}