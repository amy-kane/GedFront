// app/api/documents/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour /api/documents
export async function POST(request) {
  try {
    console.log('Requête d\'ajout de document reçue');

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer les données du formulaire (fichier + métadonnées)
    const formData = await request.formData();
    console.log('FormData reçu pour upload de document');
    
    // Vérifier que nous avons bien un fichier et un ID de dossier
    const file = formData.get('file');
    const dossierId = formData.get('dossierId');
    
    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }
    
    if (!dossierId) {
      return NextResponse.json({ error: 'ID de dossier manquant' }, { status: 400 });
    }
    
    console.log(`Ajout de document pour le dossier ${dossierId}, fichier: ${file.name}, taille: ${file.size} bytes`);
    
    // Créer une nouvelle instance FormData pour l'envoi à axios
    const axiosFormData = new FormData();
    
    // Copier toutes les entrées de formData vers axiosFormData
    for (const [key, value] of formData.entries()) {
      if (key === 'file') {
        // Pour les fichiers, nous devons les ajouter avec leur nom
        axiosFormData.append('file', value, value.name);
      } else {
        axiosFormData.append(key, value);
      }
    }
    
    // Envoyer au backend
    const response = await axios.post(
      `${API_URL}/api/documents`,
      axiosFormData,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log(`Document ajouté avec succès, statut: ${response.status}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error);
    
    // Gérer les différents types d'erreurs
    if (error.response) {
      return NextResponse.json(
        { 
          message: error.response.data.message || `Erreur ${error.response.status}`,
          details: error.response.data
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      return NextResponse.json(
        { message: 'Le serveur n\'a pas répondu à la requête' },
        { status: 504 }
      );
    } else {
      return NextResponse.json(
        { message: 'Erreur lors de la préparation de la requête: ' + error.message },
        { status: 500 }
      );
    }
  }
}