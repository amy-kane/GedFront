// app/coordinateur/votes/[id]/page.jsx
// page de détail des votes pour que les membres et le coordinateur puissent voter

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const VoteDetails = () => {
  const params = useParams();
  const router = useRouter();
  const phaseId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [votingDecision, setVotingDecision] = useState('FAVORABLE');
  const [votingComment, setVotingComment] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  
  // Fonction utilitaire pour vérifier la présence de l'utilisateur
  const formatUserName = (user) => {
    if (!user) return 'Utilisateur inconnu';
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return (prenom + ' ' + nom).trim() || 'Utilisateur inconnu';
  };
  
  
  // Cette fonction s'assure que chaque vote a une structure cohérente
  const normalizeVote = (vote) => {
    if (!vote) return null;
    
    // Créer un objet vote avec des valeurs par défaut
    return {
      id: vote.id || Math.random().toString(36).substring(2, 9), // ID unique, utilisant un aléatoire si absent
      decision: vote.decision || 'INCONNU',
      commentaire: vote.commentaire || '',
      dateCreation: vote.dateCreation || new Date().toISOString(),
      utilisateur: {
        id: vote.utilisateur?.id || 0,
        prenom: vote.utilisateur?.prenom || '',
        nom: vote.utilisateur?.nom || 'Utilisateur inconnu',
        role: vote.utilisateur?.role || 'INCONNU'
      }
    };
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchPhaseDetails();
  }, [phaseId]);
  
  const fetchPhaseDetails = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Récupérer les détails de la phase
    try {
      console.log("Tentative de récupération des détails de la phase", phaseId);
      const response = await axios.get(`/api/phases/${phaseId}`);
      console.log("Détails de la phase récupérés:", response.data);
      
      setPhase(response.data);
      
      // Vérifier si c'est bien une phase de vote
      if (response.data.type !== 'VOTE') {
        setError("Ceci n'est pas une phase de vote");
      } else {
        // Récupérer les votes pour cette phase
        await fetchVotes();
        
        // Récupérer mon vote si j'en ai déjà un
        await fetchMyVote();
      }
    } catch (apiError) {
      console.error("Erreur lors de la récupération des détails de la phase:", apiError);
      
      // Si erreur 404, la phase n'existe peut-être pas encore dans le backend,
      // mais elle existe peut-être dans la liste des phases
      if (apiError.response && apiError.response.status === 404) {
        try {
          // Essayer de trouver la phase dans la liste des phases
          const phasesResponse = await axios.get('/api/phases/votes');
          const phases = Array.isArray(phasesResponse.data) ? phasesResponse.data : [];
          
          // Chercher notre phase
          const matchingPhase = phases.find(p => p.id.toString() === phaseId.toString());
          
          if (matchingPhase) {
            console.log("Phase trouvée dans la liste:", matchingPhase);
            setPhase(matchingPhase);
            
            // Récupérer les votes pour cette phase
            await fetchVotes();
            
            // Récupérer mon vote si j'en ai déjà un
            await fetchMyVote();
            
            return; // Sortir de la fonction si on a trouvé la phase
          }
        } catch (listError) {
          console.error("Erreur lors de la recherche dans la liste des phases:", listError);
        }
      }
      
      // Simuler les données
      const simulatedPhase = getSimulatedPhaseDetails(phaseId);
      setPhase(simulatedPhase);
      
      // Simuler les votes
      const simulatedVotes = getSimulatedVotes(phaseId);
      setVotes(simulatedVotes);
      
      // Simuler mon vote (50% de chance d'avoir déjà voté)
      if (Math.random() > 0.5) {
        const decisions = ['FAVORABLE', 'DEFAVORABLE', 'COMPLEMENT_REQUIS'];
        const mySimulatedVote = {
          id: 999,
          decision: decisions[Math.floor(Math.random() * decisions.length)],
          commentaire: "Mon vote simulé",
          dateCreation: new Date().toISOString(),
          utilisateur: {
            id: 1,
            nom: "Coordinateur",
            prenom: "Test",
            role: "COORDINATEUR"
          }
        };
        setMyVote(mySimulatedVote);
      }
      
      setError("Utilisation de données simulées suite à une erreur de l'API");
    }
  } catch (err) {
    console.error("Erreur générale lors de la récupération des détails:", err);
    setError("Impossible de charger les détails de cette phase");
  } finally {
    setLoading(false);
  }
}, [phaseId]);
  
  const fetchVotes = async () => {
    try {
      const response = await axios.get(`/api/votes/phase/${phaseId}`);
      setVotes(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des votes:", err);
      // Nous continuons malgré l'erreur, les votes resteront vides
    }
  };
  
  const fetchMyVote = async () => {
  try {
    const response = await axios.get(`/api/votes/phase/${phaseId}/mon-vote`);
    setMyVote(response.data);
  } catch (err) {
    // Si erreur 404, c'est normal (pas de vote)
    if (err.response?.status === 404) {
      console.log("Aucun vote trouvé pour cet utilisateur");
      setMyVote(null);
    } else {
      console.error("Erreur lors de la récupération de mon vote:", err);
      // Autres erreurs, on peut quand même continuer
      setMyVote(null);
    }
  }
};
  
  const handleSubmitVote = async () => {
    try {
      if (!votingComment.trim()) {
        if (!confirm("Êtes-vous sûr de vouloir voter sans commentaire ?")) {
          return;
        }
      }
      
      if (myVote) {
        // Modifier un vote existant
        await axios.put(`/api/votes/${myVote.id}`, null, {
          params: {
            decision: votingDecision,
            commentaire: votingComment
          }
        });
        
        alert("Vote modifié avec succès");
      } else {
        // Créer un nouveau vote
        await axios.post(`/api/votes`, null, {
          params: {
            phaseId: phaseId,
            decision: votingDecision,
            commentaire: votingComment
          }
        });
        
        alert("Vote enregistré avec succès");
      }
      
      // Rafraîchir les données
      setShowVoteModal(false);
      setVotingComment('');
      await fetchVotes();
      await fetchMyVote();
    } catch (err) {
      console.error("Erreur lors de l'envoi du vote:", err);
      
      // En cas d'erreur API, simuler le succès
      alert("Vote simulé enregistré avec succès");
      setShowVoteModal(false);
      
      // Créer un vote simulé
      const newSimulatedVote = {
        id: Date.now(), // ID unique basé sur l'horodatage
        decision: votingDecision,
        commentaire: votingComment,
        dateCreation: new Date().toISOString(),
        utilisateur: {
          id: 1,
          nom: "Coordinateur",
          prenom: "Test",
          role: "COORDINATEUR"
        }
      };
      
      // Ajouter le vote à la liste ou remplacer l'existant
      if (myVote) {
        setVotes(prevVotes => prevVotes.map(v => 
          v.id === myVote.id ? newSimulatedVote : v
        ));
      } else {
        setVotes(prevVotes => [...prevVotes, newSimulatedVote]);
      }
      
      setMyVote(newSimulatedVote);
      setVotingComment('');
    }
  };
  
  const handleTerminerPhase = async () => {
    if (confirm("Êtes-vous sûr de vouloir terminer cette phase de vote ?")) {
      try {
        await axios.put(`/api/phases/${phaseId}/terminer`);
        alert("Phase de vote terminée avec succès");
        fetchPhaseDetails();
      } catch (err) {
        console.error("Erreur lors de la terminaison de la phase:", err);
        
        // Simuler la terminaison
        setPhase(prevPhase => ({
          ...prevPhase,
          dateFin: new Date().toISOString()
        }));
        
        alert("Phase de vote terminée avec succès (simulation)");
      }
    }
  };
  
  // Fonction pour approuver ou rejeter le dossier
  // Fonction corrigée pour approuver ou rejeter le dossier
const handleDecisionDossier = async (decision) => {
  try {
    const token = localStorage.getItem('token');
    
    // Vérifier que la phase est bien terminée
    if (!phase.dateFin) {
      alert("Vous devez d'abord terminer la phase de vote avant de prendre une décision");
      return;
    }
    
    // Déterminer le statut selon la décision
    const nouveauStatut = decision === 'approuver' ? 'APPROUVE' : 'REJETE';
    
    // Afficher un message d'attente
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Tentative de ${decision} du dossier ${phase.dossier.id} avec le statut ${nouveauStatut}`);
      
      // MAINTENANT QUE L'ENDPOINT EXISTE, ON PEUT L'UTILISER
      await axios.put(`/api/dossiers/${phase.dossier.id}/statut`, null, {
        params: { statut: nouveauStatut },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert(`Le dossier a été ${decision === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`);
      
      // Rediriger vers la page de la liste des dossiers
      router.push('/coordinateur/dashboard');
      
    } catch (apiError) {
      console.error(`Erreur API lors de la ${decision} du dossier:`, apiError);
      
      // Afficher l'erreur détaillée
      let errorMsg = `Erreur lors de la ${decision === 'approuver' ? 'validation' : 'refus'} du dossier.`;
      
      if (apiError.response) {
        errorMsg += ` (Code ${apiError.response.status})`;
        if (apiError.response.data && apiError.response.data.message) {
          errorMsg += `: ${apiError.response.data.message}`;
        }
      }
      
      setError(errorMsg);
      setLoading(false);
      
      // Proposer la simulation en cas d'erreur persistante
      if (confirm(`${errorMsg}\n\nVoulez-vous simuler la ${decision} du dossier pour continuer le développement?`)) {
        alert(`Le dossier a été ${decision === 'approuver' ? 'approuvé' : 'rejeté'} avec succès (simulation)`);
        router.push('/coordinateur/dossiers');
      }
    }
  } catch (error) {
    console.error(`Erreur générale lors de la ${decision} du dossier:`, error);
    setError(`Une erreur inattendue s'est produite: ${error.message}`);
    setLoading(false);
  }
};
  
  // Données simulées pour le fallback
  const getSimulatedPhaseDetails = (id) => {
    const now = new Date();
    return {
      id: parseInt(id),
      type: 'VOTE',
      description: 'Vote sur les mesures compensatoires proposées en zone humide',
      dateDebut: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null, // Phase active
      dossier: {
        id: 105,
        numeroDossier: 'DOS-2025-004',
        typeDemande: { libelle: 'Licence 1 Informatique' },
        nomDeposant: 'Utilisateur',
        prenomDeposant: 'Test',
        dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  };
  
  const getSimulatedVotes = (phaseId) => {
    return [
      {
        id: 101,
        decision: 'FAVORABLE',
        commentaire: "Le projet répond aux exigences environnementales",
        dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: {
          id: 201,
          nom: "Martin",
          prenom: "Sophie",
          role: "MEMBRE_COMITE"
        }
      },
      {
        id: 102,
        decision: 'DEFAVORABLE',
        commentaire: "Impact trop important sur la biodiversité locale",
        dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: {
          id: 202,
          nom: "Dubois",
          prenom: "Jean",
          role: "MEMBRE_COMITE"
        }
      }
    ];
  };
  
  // Composant pour afficher la décision de vote
  const DecisionBadge = ({ decision }) => {
    switch (decision) {
      case 'FAVORABLE':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Favorable
          </span>
        );
      case 'DEFAVORABLE':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Défavorable
          </span>
        );
      case 'COMPLEMENT_REQUIS':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Complément requis
          </span>
        );
      default:
        return null;
    }
  };
  
  // Calcul des résultats de vote
  const calculateResults = () => {
    const results = {
      FAVORABLE: 0,
      DEFAVORABLE: 0,
      COMPLEMENT_REQUIS: 0
    };
    
    votes.forEach(vote => {
      if (results[vote.decision] !== undefined) {
        results[vote.decision]++;
      }
    });
    
    return results;
  };
  
  const voteResults = calculateResults();
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && !phase) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!phase) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Phase non trouvée
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Message d'erreur/avertissement */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Vote sur le dossier {phase.dossier.numeroDossier}
        </h1>
        {phase.dateFin === null ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Phase active
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Phase terminée
          </span>
        )}
      </div>
      
      {/* Détails de la phase */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Détails de la phase de vote</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="bg-gray-50 p-3 rounded-md">{phase.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type de demande</p>
                <p className="font-medium">{phase.dossier.typeDemande?.libelle || 'Type non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Déposant</p>
                <p className="font-medium">{phase.dossier.nomDeposant || ''} {phase.dossier.prenomDeposant || ''}</p>
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
      
      {/* Résultats de vote */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Résultats du vote</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{voteResults.FAVORABLE}</div>
              <div className="text-sm text-gray-600">Favorable</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{voteResults.DEFAVORABLE}</div>
              <div className="text-sm text-gray-600">Défavorable</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{voteResults.COMPLEMENT_REQUIS}</div>
              <div className="text-sm text-gray-600">Complément requis</div>
            </div>
          </div>
          
          {/* Bouton pour voter ou modifier mon vote */}
          {phase.dateFin === null && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => {
                  if (myVote) {
                    setVotingDecision(myVote.decision);
                    setVotingComment(myVote.commentaire || '');
                  }
                  setShowVoteModal(true);
                }}
              >
                {myVote ? 'Modifier mon vote' : 'Voter'}
              </button>
            </div>
          )}
          
          {/* Si j'ai déjà voté, montrer mon vote */}
          {myVote && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-indigo-900">Mon vote</h4>
                <DecisionBadge decision={myVote.decision} />
              </div>
              {myVote.commentaire && (
                <p className="text-sm text-gray-700">{myVote.commentaire}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Voté le {new Date(myVote.dateCreation).toLocaleDateString()} à {new Date(myVote.dateCreation).toLocaleTimeString()}
              </p>
            </div>
          )}
          
          {/* Liste des votes */}
          <h4 className="font-medium text-gray-900 mb-2">Tous les votes ({votes.length})</h4>
          {votes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun vote pour le moment</p>
          ) : (
            <div className="space-y-4">
              {votes.map(vote => (
  <div key={vote.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-2">
      <div>
        {/* Utilisation de l'opérateur de chaînage optionnel pour éviter l'erreur */}
        <span className="font-medium">
          {vote.utilisateur?.prenom || ''} {vote.utilisateur?.nom || 'Utilisateur inconnu'}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          ({vote.utilisateur?.role || 'Rôle inconnu'})
        </span>
      </div>
      <DecisionBadge decision={vote.decision} />
    </div>
    {vote.commentaire && (
      <p className="text-sm text-gray-700">{vote.commentaire}</p>
    )}
    <p className="text-xs text-gray-500 mt-1">
      Voté le {new Date(vote.dateCreation).toLocaleDateString()} à {new Date(vote.dateCreation).toLocaleTimeString()}
    </p>
  </div>
))}
            </div>
          )}
        </div>
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
              Le processus de vote est terminé.
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
          Retour
        </button>
        
        <div className="space-x-3">
          {phase.dateFin === null ? (
            // Boutons pour phase active
            <>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={fetchPhaseDetails}
              >
                Actualiser
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleTerminerPhase}
              >
                Terminer la phase de vote
              </button>
              <button 
                onClick={() => window.open(`/coordinateur/dossiers/${phase.dossier.id}`, '_blank')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Voir le dossier complet
              </button>
            </>
          ) : (
            // Boutons pour phase terminée
            <>
              {/* N'afficher les boutons d'approbation/rejet QUE si le dossier n'est pas déjà traité */}
              {phase.dossier?.statut !== 'APPROUVE' && phase.dossier?.statut !== 'REJETE' ? (
                <>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => {
                      setConfirmationAction('approuver');
                      setShowConfirmationModal(true);
                    }}
                  >
                    Approuver le dossier
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => {
                      setConfirmationAction('rejeter');
                      setShowConfirmationModal(true);
                    }}
                  >
                    Rejeter le dossier
                  </button>
                </>
              ) : (
                // Si le dossier est déjà traité, afficher des boutons de navigation
                <>
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => router.push('/coordinateur/dossiers')}
                  >
                    Voir tous les dossiers
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => router.push('/coordinateur/votes')}
                  >
                    Voir tous les votes
                  </button>
                </>
              )}
              
              <button 
                onClick={() => window.open(`/coordinateur/dossiers/${phase.dossier.id}`, '_blank')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Voir le dossier complet
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Modal pour voter */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {myVote ? 'Modifier mon vote' : 'Voter'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre décision</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    className={`p-3 rounded-md ${votingDecision === 'FAVORABLE' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setVotingDecision('FAVORABLE')}
                  >
                    <div className="text-center text-sm font-medium mb-1">Favorable</div>
                    <div className="text-center text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                  <button 
                    className={`p-3 rounded-md ${votingDecision === 'DEFAVORABLE' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setVotingDecision('DEFAVORABLE')}
                  >
                    <div className="text-center text-sm font-medium mb-1">Défavorable</div>
                    <div className="text-center text-red-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </div>
                 </button>
                 <button 
                   className={`p-3 rounded-md ${votingDecision === 'COMPLEMENT_REQUIS' ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-100 border border-gray-300'}`}
                   onClick={() => setVotingDecision('COMPLEMENT_REQUIS')}
                 >
                   <div className="text-center text-sm font-medium mb-1">Complément</div>
                   <div className="text-center text-yellow-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                 </button>
               </div>
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (facultatif)</label>
               <textarea
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 rows="3"
                 placeholder="Justifiez votre décision..."
                 value={votingComment}
                 onChange={(e) => setVotingComment(e.target.value)}
               ></textarea>
             </div>
             <div className="flex justify-end space-x-3">
               <button 
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                 onClick={() => setShowVoteModal(false)}
               >
                 Annuler
               </button>
               <button 
                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                 onClick={handleSubmitVote}
               >
                 {myVote ? 'Modifier mon vote' : 'Voter'}
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
     
     {/* Modal de confirmation pour approbation/rejet */}
     {showConfirmationModal && (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
           <div className="px-6 py-4 border-b border-gray-200">
             <h3 className="text-lg font-medium text-gray-900">
               {confirmationAction === 'approuver' ? 'Approuver le dossier' : 'Rejeter le dossier'}
             </h3>
           </div>
           <div className="p-6">
             <p className="mb-4 text-gray-600">
               Vous avez rencontré une erreur de permissions en essayant de {confirmationAction} le dossier. Voici l'explication exacte basée sur le code de l'application:
             </p>
             
             <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm text-gray-600">
               <li>
                 <strong>Vérification du rôle:</strong> Dans la méthode <code>canChangeStatut()</code>, seul un utilisateur ayant le rôle COORDINATEUR peut changer un dossier de EN_COURS à APPROUVE/REJETE.
               </li>
               <li>
                 <strong>Vérification du statut:</strong> Le dossier doit être exactement dans l'état EN_COURS pour pouvoir passer à APPROUVE/REJETE. Vérifiez que la phase de vote n'a pas modifié ce statut.
               </li>
               <li>
                 <strong>Code source:</strong> <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto">
                   if (user.getRole() == Role.COORDINATEUR) {'{'}
                     if (dossier.getStatut() == StatutDossier.EN_COURS && 
                         (nouveauStatut == StatutDossier.APPROUVE || 
                          nouveauStatut == StatutDossier.REJETE)) {'{'}
                       return true;
                     {'}'}
                   {'}'}
                 </pre>
               </li>
             </ol>
             
             <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
               <p className="text-sm text-yellow-800">
                 <strong>Solution 1:</strong> Vérifiez que votre utilisateur est bien un COORDINATEUR.<br/>
                 <strong>Solution 2:</strong> Vérifiez que le dossier est bien en statut EN_COURS (il pourrait avoir changé lors de la phase de vote).<br/>
                 <strong>Solution 3:</strong> Pour le développement frontend, vous pouvez utiliser le mode simulation.
               </p>
             </div>
             
             <div className="flex justify-end space-x-3">
               <button 
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                 onClick={() => setShowConfirmationModal(false)}
               >
                 Annuler
               </button>
               <button 
                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                 onClick={() => {
                   // Fermer le modal
                   setShowConfirmationModal(false);
                   
                   // Retourner à la liste des dossiers
                   router.push('/coordinateur/dossiers');
                 }}
               >
                 Retour à la liste
               </button>
               <button 
                 className={`px-4 py-2 ${confirmationAction === 'approuver' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
                 onClick={() => {
                   // Fermer le modal
                   setShowConfirmationModal(false);
                   
                   // Appeler la fonction avec la gestion d'erreur
                   handleDecisionDossier(confirmationAction);
                 }}
               >
                 Simuler
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default VoteDetails;