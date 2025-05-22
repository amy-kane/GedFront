// app/api/commentaires/dossier/[dossierId]/public/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    const { dossierId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des commentaires publics pour le dossier ${dossierId}`);
    
    try {
      // Essayer de récupérer les commentaires publics depuis l'API
      const response = await axios.get(`${API_URL}/api/commentaires/dossier/${dossierId}/public`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (err) {
      console.error(`Erreur API lors de la récupération des commentaires publics:`, err);
      
      // Si en développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        console.log('Mode développement: génération de commentaires publics simulés');
        return NextResponse.json(getStaticPublicCommentaires(dossierId));
      }
      
      // Sinon, renvoyer l'erreur
      return NextResponse.json(
        { message: err.response?.data?.message || 'Erreur lors de la récupération des commentaires publics' },
        { status: err.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires publics pour le dossier ${params.dossierId}:`, error);
    
    // En mode développement, générer des données simulées
    if (process.env.NODE_ENV === 'development') {
      console.log('Mode développement: génération de commentaires publics simulés après erreur');
      return NextResponse.json(getStaticPublicCommentaires(params.dossierId));
    }
    
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour générer des commentaires publics simulés
function getStaticPublicCommentaires(dossierId) {
  // Générer un nombre aléatoire entre 2 et 5 commentaires
  const count = Math.floor(Math.random() * 4) + 2;
  const result = [];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i); // Commentaires dans les derniers jours
    
    result.push({
      id: 2000 + i,
      contenu: getRandomPublicComment(i, dossierId),
      dateCreation: date.toISOString(),
      utilisateur: getRandomUser(i),
      public: true
    });
  }
  
  return result;
}

// Fonction pour générer un commentaire public aléatoire
function getRandomPublicComment(index, dossierId) {
  const comments = [
    `Les dernières modifications du dossier ${dossierId} sont satisfaisantes et répondent aux exigences.`,
    "Après consultation des services concernés, nous pouvons avancer sur ce projet.",
    "Les compléments fournis par le déposant sont complets et conformes aux attentes.",
    "La commission a émis un avis favorable unanime sur ce dossier.",
    "Nous avons reçu l'accord du service juridique pour poursuivre la procédure.",
    "Les remarques précédentes ont été prises en compte de façon satisfaisante."
  ];
  
  return comments[index % comments.length];
}

// Fonction pour générer un utilisateur aléatoire
function getRandomUser(index) {
  const users = [
    { id: 201, nom: "Martin", prenom: "Sophie", role: "MEMBRE_COMITE" },
    { id: 202, nom: "Dubois", prenom: "Jean", role: "MEMBRE_COMITE" },
    { id: 203, nom: "Lefebvre", prenom: "Marie", role: "COORDINATEUR" },
    { id: 204, nom: "Bernard", prenom: "Thomas", role: "MEMBRE_COMITE" },
    { id: 205, nom: "Petit", prenom: "Claire", role: "ADMINISTRATEUR" }
  ];
  
  return users[index % users.length];
}