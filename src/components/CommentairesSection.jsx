// components/CommentairesSection.jsx - Version simplifiée et robuste pour éviter les problèmes
import React, { useState, useEffect } from 'react';
import CommentaireItem from './CommentaireItem';
import axios from 'axios';

const CommentairesSection = ({ dossierId, userRole }) => {
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Charger les commentaires une seule fois au montage
  useEffect(() => {
    // Vérifier la validité du dossierId
    if (!dossierId || dossierId <= 0) {
      console.error(`CommentairesSection reçoit un dossierId invalide: ${dossierId}`);
      setError("Identifiant de dossier invalide");
      setLoading(false);
      return;
    }
    
    // Définir un flag pour éviter les mises à jour après démontage
    let isMounted = true;
    
    // Fonction asynchrone pour charger les commentaires
    const fetchCommentaires = async () => {
      try {
        console.log(`Chargement des commentaires pour le dossier ${dossierId}`);
        
        // Récupérer le token d'authentification
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentification requise');
        }
        
        // Faire la requête à l'API
        const response = await axios.get(`/api/commentaires/dossier/${dossierId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Traiter les données uniquement si le composant est toujours monté
        if (isMounted) {
          // S'assurer que response.data est un tableau
          const commentairesData = Array.isArray(response.data) 
            ? response.data 
            : Array.isArray(response.data.content) 
              ? response.data.content 
              : [];
              
          console.log(`${commentairesData.length} commentaires récupérés`);
          
          setCommentaires(commentairesData);
          setError(null);
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des commentaires:`, err);
        
        // Mettre à jour l'état uniquement si le composant est toujours monté
        if (isMounted) {
          setError("Impossible de charger les commentaires");
          
          // En mode développement, utiliser des données simulées
          if (process.env.NODE_ENV === 'development') {
            console.log('Données simulées utilisées après une erreur');
            setCommentaires(getStaticCommentaires(dossierId));
          }
        }
      } finally {
        // Mettre à jour l'état uniquement si le composant est toujours monté
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Exécuter la fonction
    fetchCommentaires();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted = false;
    };
  }, [dossierId]); // Dépendance uniquement sur dossierId
  
  // Ajouter un nouveau commentaire
  const envoyerCommentaire = async () => {
    // Validation des données
    if (!newComment.trim() || !dossierId || dossierId <= 0) {
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
      
      // Ajouter le commentaire à la liste locale
      if (response.data) {
        setCommentaires(prevCommentaires => [...prevCommentaires, response.data]);
        setNewComment('');
      } else {
        // Si la réponse ne contient pas de données, recharger tous les commentaires
        window.location.reload();
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du commentaire:", err);
      setError("Erreur lors de l'envoi du commentaire");
      
      // En mode développement, simuler l'ajout du commentaire
      if (process.env.NODE_ENV === 'development') {
        const nouveauCommentaire = {
          id: Math.floor(Math.random() * 1000) + 500,
          contenu: newComment,
          dateCreation: new Date().toISOString(),
          utilisateur: {
            id: 203,
            nom: "Utilisateur",
            prenom: "Test",
            role: userRole || "COORDINATEUR"
          }
        };
        
        setCommentaires(prevCommentaires => [...prevCommentaires, nouveauCommentaire]);
        setNewComment('');
      }
    }
  };
  
  // Vérifier si l'utilisateur peut commenter
  const canComment = ['ADMINISTRATEUR', 'COORDINATEUR', 'MEMBRE_COMITE'].includes(userRole);
  
  // Fonction pour obtenir des données statiques de commentaires
  const getStaticCommentaires = (dossierID) => {
    return [
      {
        id: 101,
        contenu: `Ce dossier #${dossierID} présente des lacunes importantes concernant l'analyse des impacts environnementaux.`,
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
  
  // Rafraîchir manuellement
  const handleRefresh = () => {
    window.location.reload();
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
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rafraîchir
          </button>
        </div>
        
        {/* Afficher dossierId pour debug en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-2">
            ID du dossier: {dossierId || 'Non défini'}
          </div>
        )}
        
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
        {!loading && !dossierId ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            Impossible d'afficher les commentaires : Identifiant de dossier manquant
          </div>
        ) : !loading && commentaires.length === 0 ? (
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
        {canComment && dossierId > 0 && (
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
                disabled={!newComment.trim() || !dossierId || dossierId <= 0}
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