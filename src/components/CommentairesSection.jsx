// Components/CommentairesSection.jsx

import React, { useState, useEffect } from 'react';
import CommentaireItem from './CommentaireItem';
import axios from 'axios';

const CommentairesSection = ({ dossierId, userRole }) => {
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Charger les commentaires depuis l'API
  const fetchCommentaires = async () => {
    if (!dossierId) return;

    try {
      setLoading(true);
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentification requise');
      }
      
      console.log(`Chargement des commentaires pour le dossier ${dossierId}`);
      
      // Essayer d'abord l'endpoint standard
      let response;
      try {
        response = await axios.get(`/api/commentaires/dossier/${dossierId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Commentaires récupérés via l\'endpoint standard');
      } catch (err) {
        // Si l'endpoint standard échoue, essayer l'endpoint public
        console.log('Échec de l\'endpoint standard, tentative avec l\'endpoint public');
        response = await axios.get(`/api/commentaires/dossier/${dossierId}/public`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Commentaires récupérés via l\'endpoint public');
      }
      
      // Extraire les commentaires selon la structure de la réponse
      const commentairesData = response.data.content || response.data;
      console.log(`${commentairesData.length} commentaires récupérés`);
      
      // Afficher le premier commentaire pour débogage
      if (commentairesData.length > 0) {
        console.log('Premier commentaire:', {
          id: commentairesData[0].id,
          contenu: commentairesData[0].contenu,
          utilisateur: commentairesData[0].utilisateur
        });
      }
      
      setCommentaires(commentairesData);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des commentaires:", err);
      setError("Impossible de charger les commentaires. Veuillez réessayer plus tard.");
      
      // En mode développement, utiliser des données statiques
      if (process.env.NODE_ENV === 'development') {
        console.log('Utilisation de données statiques en développement suite à une erreur');
        setCommentaires(getStaticCommentaires());
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les commentaires au montage et quand dossierId change
  useEffect(() => {
    fetchCommentaires();
  }, [dossierId, userRole]);
  
  // Ajouter un nouveau commentaire
  const envoyerCommentaire = async () => {
    if (!newComment.trim()) {
      return;
    }
    
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentification requise pour commenter');
        return;
      }
      
      // Appel API pour sauvegarder le commentaire
      const response = await axios.post('/api/commentaires', null, {
        params: {
          dossierId: dossierId,
          contenu: newComment
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Commentaire ajouté avec succès:', response.data);
      
      // Ajouter le commentaire à la liste locale immédiatement
      setCommentaires(prevCommentaires => [...prevCommentaires, response.data]);
      setNewComment('');
      
      // Rafraîchir tous les commentaires depuis l'API pour s'assurer d'avoir les données à jour
      setTimeout(fetchCommentaires, 500);
    } catch (err) {
      console.error("Erreur lors de l'envoi du commentaire:", err);
      setError(err.response?.data?.message || "Erreur lors de l'envoi du commentaire");
    }
  };
  
  // Vérifier si l'utilisateur peut commenter
  const canComment = ['ADMINISTRATEUR', 'COORDINATEUR', 'MEMBRE_COMITE'].includes(userRole);
  
  // Fonction pour obtenir des données statiques de commentaires (en développement)
  const getStaticCommentaires = () => {
    return [
      {
        id: 101,
        contenu: "Ce dossier présente des lacunes importantes concernant l'analyse des impacts environnementaux.",
        dateCreation: "2025-05-11T14:10:00",
        utilisateur: {
          id: 201,
          nom: "Nom1",
          prenom: "Mem1",
          role: "MEMBRE_COMITE"
        }
      },
      {
        id: 102,
        contenu: "Je partage cet avis. De plus, les mesures compensatoires proposées semblent insuffisantes.",
        dateCreation: "2025-05-12T14:10:00",
        utilisateur: {
          id: 202,
          nom: "Nom2", 
          prenom: "Mem2",
          role: "MEMBRE_COMITE"
        }
      },
      {
        id: 103, 
        contenu: "J'ai contacté le service technique pour obtenir des précisions. Nous devrions recevoir des compléments d'ici la fin de la semaine.",
        dateCreation: "2025-05-13T14:10:00",
        utilisateur: {
          id: 203,
          nom: "Nom3",
          prenom: "Mem3",
          role: "COORDINATEUR"
        }
      }
    ];
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <h3 className="font-semibold text-blue-800">
          Commentaires
          {commentaires.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100">
              {commentaires.length}
            </span>
          )}
        </h3>
      </div>
      
      <div className="p-4">
        {/* Bouton de rafraîchissement manuel */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={fetchCommentaires}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rafraîchir
          </button>
        </div>
        
        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {/* Liste des commentaires */}
        {!loading && commentaires.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun commentaire pour le moment.
          </div>
        ) : (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {commentaires.map((commentaire) => (
              <CommentaireItem key={commentaire.id} commentaire={commentaire} />
            ))}
          </div>
        )}
        
        {/* Formulaire d'ajout de commentaire */}
        {canComment && (
          <div className="mt-4">
            <div className="mb-2">
              <label 
                htmlFor="new-comment" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ajouter un commentaire
              </label>
              <textarea
                id="new-comment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows="3"
                placeholder="Votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                onClick={envoyerCommentaire}
                disabled={!newComment.trim()}
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentairesSection;