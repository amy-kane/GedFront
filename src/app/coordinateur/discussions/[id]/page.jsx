// app/coordinateur/discussions/[id]/page.jsx - Version finale sans boucle infinie
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import CommentairesSection from '../../../../components/CommentairesSection';

const DiscussionDetails = () => {
  const params = useParams();
  const router = useRouter();
  const phaseId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const [showNewPhaseModal, setShowNewPhaseModal] = useState(false);
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  
  // Effet initial pour charger les données - UNE SEULE FOIS
useEffect(() => {
  let mounted = true; // Pour éviter les mises à jour si le composant est démonté
  
  // Configurer l'en-tête d'authentification
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Token d'authentification manquant");
    if (mounted) {
      setError("Authentification requise");
      setLoading(false);
    }
    return;
  }
  
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Fonction asynchrone pour charger les données
  const loadData = async () => {
    try {
      if (!phaseId) {
        throw new Error("ID de phase manquant");
      }
      
      console.log(`Chargement des détails pour la phase ${phaseId}`);
      
      // Récupérer les détails de la phase
      const response = await axios.get(`/api/phases/${phaseId}`);
      console.log("Données de phase reçues:", response.data);
      
      // MODIFICATION : Vérifier si la réponse contient une erreur
      if (response.data && response.data.error) {
        // La réponse contient une erreur structurée
        console.error("Erreur API:", response.data.error);
        if (mounted) {
          setError(response.data.message || "Erreur dans les données de phase");
          setPhase(null);
          setLoading(false);
        }
        return; // Arrêter l'exécution ici
      }
      
      // Si nous arrivons ici, c'est que la réponse est valide
      if (mounted) {
        // Vérifier et nettoyer les données côté client aussi pour être sûr
        const phaseData = ensureValidData(response.data);
        setPhase(phaseData);
        setError(null);
      }
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      
      if (mounted) {
        setError("Impossible de charger les détails de cette phase. Rechargez la page pour réessayer.");
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };
  
  // Exécuter la fonction de chargement
  loadData();
  
  // Nettoyage lors du démontage
  return () => {
    mounted = false;
  };
}, [phaseId]); // Dépendance uniquement sur phaseId
  
  // Fonction pour garantir la validité des données
const ensureValidData = (data) => {
  if (!data) return null;
  
  const now = new Date();
  
  // Valeur fixe pour éviter les zéros
  const dossierId = data.dossier?.id || data.dossierId || data.dossier_id;
  
  // Créer un objet nettoyé
  return {
    id: data.id || parseInt(phaseId),
    type: data.type || 'DISCUSSION',
    description: data.description || 'Description non disponible',
    dateDebut: data.dateDebut || new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dateFin: data.dateFin || null,
    dossierId: dossierId,
    dossier: {
      id: dossierId,
      numeroDossier: data.dossier?.numeroDossier || `DOS-${dossierId}`,
      // AJOUT : Préserver le statut du dossier
      statut: data.dossier?.statut || 'EN_COURS',
      typeDemande: { 
        libelle: data.dossier?.typeDemande?.libelle || 'Type non spécifié' 
      },
      nomDeposant: data.dossier?.nomDeposant || 'Non spécifié',
      prenomDeposant: data.dossier?.prenomDeposant || '',
      dateCreation: data.dossier?.dateCreation || new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

  // Gestion des actions
  const handleProlongerPhase = async () => {
    try {
      const joursSupplement = prompt("Nombre de jours supplémentaires :", "7");
      if (joursSupplement === null) return;
      
      const joursNum = parseInt(joursSupplement);
      if (isNaN(joursNum) || joursNum <= 0) {
        alert("Veuillez entrer un nombre de jours valide");
        return;
      }
      
      await axios.put(`/api/phases/${phaseId}/prolonger`, null, {
        params: { joursSupplementaires: joursNum }
      });
      
      alert(`Phase prolongée de ${joursNum} jours`);
      
      // Recharger la page entière plutôt que de mettre à jour l'état
      window.location.reload();
    } catch (err) {
      console.error("Erreur lors de la prolongation:", err);
      alert("Erreur lors de la prolongation de la phase");
    }
  };

  const handleTerminerPhase = async () => {
    if (confirm("Êtes-vous sûr de vouloir terminer cette phase ?")) {
      try {
        await axios.put(`/api/phases/${phaseId}/terminer`);
        alert("Phase terminée avec succès");
        
        // Après avoir terminé la phase, proposer de lancer une phase de vote
        if (confirm("Souhaitez-vous démarrer une phase de vote pour ce dossier ?")) {
          setShowNewPhaseModal(true);
        } else {
          // Recharger la page complètement
          window.location.reload();
        }
      } catch (err) {
        console.error("Erreur lors de la terminaison:", err);
        alert("Erreur lors de la terminaison de la phase");
      }
    }
  };

  const handleLancerPhaseVote = async () => {
    try {
      setLoading(true);
      
      // Vérifier que la description n'est pas vide
      if (!newPhaseDescription.trim()) {
        alert("Veuillez saisir une description pour la phase de vote");
        setLoading(false);
        return;
      }
      
      // S'assurer que nous avons un ID de dossier valide
      const dossierId = phase?.dossier?.id || phase?.dossierId || 0;
      
      if (dossierId <= 0) {
        alert("Impossible de récupérer l'identifiant du dossier");
        setLoading(false);
        return;
      }
      
      console.log(`Lancement d'une phase de vote pour le dossier ${dossierId}`);
      
      // Appeler l'API pour créer une nouvelle phase de vote
      const response = await axios.post('/api/phases/vote', null, {
        params: {
          dossierId: dossierId,
          description: newPhaseDescription
        }
      });
      
      console.log("Réponse de création de phase de vote:", response.data);
      
      // Vérifier que nous avons bien un ID de phase
      if (response.data && response.data.id) {
        alert("Phase de vote initiée avec succès!");
        
        // Rediriger vers la nouvelle phase de vote
        setShowNewPhaseModal(false);
        router.push(`/coordinateur/votes/${response.data.id}`);
      } else {
        alert("La phase de vote a été créée mais sans identifiant. Redirection vers la liste des votes.");
        setShowNewPhaseModal(false);
        router.push('/coordinateur/votes');
      }
    } catch (err) {
      console.error("Erreur lors de la création de la phase de vote:", err);
      alert("Erreur lors de la création de la phase de vote");
    } finally {
      setLoading(false);
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur fatale
  if (error && !phase) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
  
  // Affichage si la phase n'est pas trouvée
  if (!phase) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Phase non trouvée
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }
  
  // Calculer les valeurs dérivées de l'état - une seule fois par rendu
  const isPhaseActive = phase.dateFin === null;
  const dossierId = phase.dossier?.id || phase.dossierId || 0;
  const numeroDossier = phase.dossier?.numeroDossier || `DOS-${dossierId || '???'}`;
  
  // Rendu principal
  return (
    <div className="p-6">
      {/* Afficher un message d'avertissement si utilisation de données simulées */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Information de débogage en mode développement */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs text-gray-600 mb-4 rounded">
          <p>Mode: Développement</p>
          <p>Phase ID: {phase.id}</p>
          <p>Dossier ID: {dossierId}</p>
        </div>
      )} */}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Discussion sur le dossier {numeroDossier}
        </h1>
        {isPhaseActive && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Phase active
          </span>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Détails de la phase</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="bg-gray-50 p-3 rounded-md">{phase.description || 'Aucune description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type de demande</p>
                <p className="font-medium">{phase.dossier?.typeDemande?.libelle || 'Type non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Déposant</p>
                <p className="font-medium">{phase.dossier?.nomDeposant || ''} {phase.dossier?.prenomDeposant || ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="font-medium">{new Date(phase.dateDebut).toLocaleDateString()}</p>
              </div>
              {phase.dateFin && (
                <div>
                  <p className="text-sm text-gray-600">Date de fin</p>
                  <p className="font-medium">{new Date(phase.dateFin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Section des commentaires - avec clé unique pour forcer la remontée */}
      <div className="mb-6">
        {dossierId > 0 ? (
          <CommentairesSection 
            key={`commentaires-${dossierId}`}
            dossierId={dossierId}
            userRole="COORDINATEUR"
          />
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Impossible d'afficher les commentaires : Identifiant de dossier manquant
          </div>
        )}
      </div>
      
      {/* Statut final du dossier si terminé */}
      {(phase.dossier?.statut === 'APPROUVE' || phase.dossier?.statut === 'REJETE') && (
        <div className="mb-6">
          <div className={`p-6 rounded-lg border-2 text-center ${
            phase.dossier.statut === 'APPROUVE' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-center mb-3">
              {phase.dossier.statut === 'APPROUVE' ? (
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Dossier {phase.dossier.statut === 'APPROUVE' ? 'Approuvé' : 'Rejeté'}
            </h3>
            <p className="text-lg">
              Ce dossier a été {phase.dossier.statut === 'APPROUVE' ? 'approuvé' : 'rejeté'} définitivement.
            </p>
            <p className="text-sm mt-2 opacity-75">
              Aucune action supplémentaire n'est requise.
            </p>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-between">
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Retour aux phases
        </button>
        
        <div className="space-x-3">
          {isPhaseActive ? (
            // Pour phase active
            <>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleProlongerPhase}
              >
                Prolonger la phase
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleTerminerPhase}
              >
                Terminer la phase
              </button>
            </>
          ) : (
            // Pour phase terminée
            <>
              {/* N'afficher les boutons d'approbation/rejet QUE si le dossier n'est pas déjà traité */}
              {phase.dossier?.statut !== 'APPROUVE' && phase.dossier?.statut !== 'REJETE' && (
                <>
                  <button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => setShowNewPhaseModal(true)}
                  >
                    Lancer phase de vote
                  </button>
                  <button 
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    onClick={() => router.push('/coordinateur/votes')}
                  >
                    Voir tous les votes
                  </button>
                </>
              )}
              
              {/* Si le dossier est déjà traité, afficher des boutons alternatifs */}
              {(phase.dossier?.statut === 'APPROUVE' || phase.dossier?.statut === 'REJETE') && (
                <>
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => router.push('/coordinateur/dossiers')}
                  >
                    Voir tous les dossiers
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => router.push('/coordinateur/discussions')}
                  >
                    Voir toutes les discussions
                  </button>
                </>
              )}
            </>
          )}
          
          <button 
            onClick={() => dossierId > 0 ? window.open(`/coordinateur/dossiers/${dossierId}`, '_blank') : null}
            className={`px-4 py-2 ${dossierId > 0 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md`}
            disabled={!dossierId || dossierId <= 0}
          >
            Voir le dossier complet
          </button>
        </div>
      </div>
      
      {/* Modal pour créer une nouvelle phase de vote */}
      {showNewPhaseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lancer une phase de vote</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de la phase de vote
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Exemple: Vote final sur les mesures compensatoires..."
                  value={newPhaseDescription}
                  onChange={(e) => setNewPhaseDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewPhaseModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleLancerPhaseVote}
                >
                  Lancer la phase de vote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionDetails;