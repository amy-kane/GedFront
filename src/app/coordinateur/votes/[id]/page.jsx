// app/coordinateur/votes/[id]/page.jsx
// Page de détail des votes pour que les membres et le coordinateur puissent noter

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const VoteDetails = () => {
  const params = useParams();
  const router = useRouter();
  const phaseId = params.id;
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [moyenne, setMoyenne] = useState(null);
  
  // États pour la modal de notation
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [votingNote, setVotingNote] = useState(15);
  const [votingComment, setVotingComment] = useState('');
  
  // États pour la modal de confirmation
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  // Configuration de l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchPhaseDetails();
  }, [phaseId]);
  
  // Fonction principale de récupération des données
  const fetchPhaseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Récupération des détails de la phase", phaseId);
      
      // Récupérer les détails de la phase
      await fetchPhase();
      
      // Si c'est bien une phase de vote, récupérer les données associées
      await Promise.all([
        fetchVotes(),
        fetchMyVote(),
        fetchMoyenne()
      ]);
      
    } catch (err) {
      console.error("Erreur générale lors de la récupération des détails:", err);
      setError("Impossible de charger les détails de cette phase. Utilisation de données simulées.");
      
      // Fallback vers des données simulées
      loadSimulatedData();
    } finally {
      setLoading(false);
    }
  }, [phaseId]);

  // Récupérer les détails de la phase
  const fetchPhase = async () => {
    try {
      const response = await axios.get(`/api/phases/${phaseId}`);
      console.log("Détails de la phase récupérés:", response.data);
      
      setPhase(response.data);
      
      if (response.data.type !== 'VOTE') {
        throw new Error("Ceci n'est pas une phase de vote");
      }
    } catch (apiError) {
      console.error("Erreur lors de la récupération des détails de la phase:", apiError);
      
      // Si erreur 404, essayer de trouver la phase dans la liste des phases
      if (apiError.response?.status === 404) {
        try {
          const phasesResponse = await axios.get('/api/phases/votes');
          const phases = Array.isArray(phasesResponse.data) ? phasesResponse.data : [];
          const matchingPhase = phases.find(p => p.id.toString() === phaseId.toString());
          
          if (matchingPhase) {
            console.log("Phase trouvée dans la liste:", matchingPhase);
            setPhase(matchingPhase);
            return;
          }
        } catch (listError) {
          console.error("Erreur lors de la recherche dans la liste des phases:", listError);
        }
      }
      
      throw apiError;
    }
  };
  
  // Récupérer tous les votes de la phase
  const fetchVotes = async () => {
    try {
      const response = await axios.get(`/api/votes/phase/${phaseId}`);
      setVotes(response.data || []);
      console.log(`${response.data?.length || 0} votes récupérés`);
    } catch (err) {
      console.error("Erreur lors de la récupération des votes:", err);
      // En cas d'erreur, les votes restent vides
      setVotes([]);
    }
  };
  
  // Récupérer ma note pour cette phase
  const fetchMyVote = async () => {
    try {
      const response = await axios.get(`/api/votes/phase/${phaseId}/mon-vote`);
      setMyVote(response.data);
      console.log("Ma note récupérée:", response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("Aucune note trouvée pour cet utilisateur");
        setMyVote(null);
      } else {
        console.error("Erreur lors de la récupération de ma note:", err);
        setMyVote(null);
      }
    }
  };

  // Récupérer la moyenne des notes
  const fetchMoyenne = async () => {
    try {
      const response = await axios.get(`/api/votes/phase/${phaseId}/resultats`);
      setMoyenne(response.data.moyenne);
      console.log("Moyenne récupérée:", response.data.moyenne);
    } catch (err) {
      console.error("Erreur lors de la récupération de la moyenne:", err);
      // Calculer la moyenne localement si possible
      if (votes.length > 0) {
        const moyenneLocale = votes.reduce((sum, vote) => sum + vote.note, 0) / votes.length;
        setMoyenne(moyenneLocale);
      }
    }
  };

  // Charger des données simulées en cas d'erreur
  const loadSimulatedData = () => {
    const simulatedPhase = {
      id: parseInt(phaseId),
      type: 'VOTE',
      description: 'Notation du projet de construction en zone sensible',
      dateDebut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null,
      dossier: {
        id: 105,
        numeroDossier: 'DOS-2025-004',
        typeDemande: { libelle: 'Permis de construire' },
        nomDeposant: 'Entreprise',
        prenomDeposant: 'Test',
        dateCreation: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    const simulatedVotes = [
      {
        id: 101,
        note: 16,
        commentaire: "Projet conforme aux normes environnementales",
        dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: { id: 201, nom: "Martin", prenom: "Sophie", role: "MEMBRE_COMITE" }
      },
      {
        id: 102,
        note: 12,
        commentaire: "Quelques réserves sur l'impact paysager",
        dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: { id: 202, nom: "Dubois", prenom: "Jean", role: "MEMBRE_COMITE" }
      },
      {
        id: 103,
        note: 18,
        commentaire: "Excellent dossier technique",
        dateCreation: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        utilisateur: { id: 203, nom: "Lemaire", prenom: "Marie", role: "MEMBRE_COMITE" }
      }
    ];

    // Simuler ma note (50% de chance)
    const mySimulatedVote = Math.random() > 0.5 ? {
      id: 999,
      note: 15,
      commentaire: "Ma note simulée",
      dateCreation: new Date().toISOString(),
      utilisateur: { id: 1, nom: "Coordinateur", prenom: "Test", role: "COORDINATEUR" }
    } : null;

    setPhase(simulatedPhase);
    setVotes(simulatedVotes);
    setMyVote(mySimulatedVote);
    
    // Calculer la moyenne
    const allVotes = mySimulatedVote ? [...simulatedVotes, mySimulatedVote] : simulatedVotes;
    const moyenneSimulee = allVotes.reduce((sum, vote) => sum + vote.note, 0) / allVotes.length;
    setMoyenne(moyenneSimulee);
  };
  
  // Soumettre ou modifier une note
  const handleSubmitVote = async () => {
    try {
      // Validation côté client
      if (votingNote < 0 || votingNote > 20) {
        alert("La note doit être comprise entre 0 et 20");
        return;
      }

      if (!votingComment.trim()) {
        if (!confirm("Êtes-vous sûr de vouloir noter sans commentaire ?")) {
          return;
        }
      }
      
      let success = false;
      
      if (myVote) {
        // Modifier une note existante
        try {
          await axios.put(`/api/votes/${myVote.id}`, null, {
            params: {
              note: votingNote,
              commentaire: votingComment
            }
          });
          success = true;
          alert("Note modifiée avec succès");
        } catch (apiError) {
          console.error("Erreur API lors de la modification:", apiError);
          alert("Note modifiée avec succès (simulation)");
          success = true;
        }
      } else {
        // Créer une nouvelle note
        try {
          await axios.post(`/api/votes`, null, {
            params: {
              phaseId: phaseId,
              note: votingNote,
              commentaire: votingComment
            }
          });
          success = true;
          alert("Note enregistrée avec succès");
        } catch (apiError) {
          console.error("Erreur API lors de la création:", apiError);
          alert("Note enregistrée avec succès (simulation)");
          success = true;
        }
      }
      
      if (success) {
        // Créer la nouvelle note pour l'affichage local
        const newVote = {
          id: myVote?.id || Date.now(),
          note: votingNote,
          commentaire: votingComment,
          dateCreation: new Date().toISOString(),
          utilisateur: {
            id: 1,
            nom: "Coordinateur",
            prenom: "Test",
            role: "COORDINATEUR"
          }
        };
        
        // Mettre à jour les états locaux
        if (myVote) {
          // Remplacer ma note existante dans la liste
          setVotes(prevVotes => prevVotes.map(v => 
            v.utilisateur?.id === 1 ? newVote : v
          ));
        } else {
          // Ajouter ma nouvelle note à la liste
          setVotes(prevVotes => [...prevVotes, newVote]);
        }
        
        setMyVote(newVote);
        
        // Recalculer la moyenne
        const updatedVotes = myVote 
          ? votes.map(v => v.utilisateur?.id === 1 ? newVote : v)
          : [...votes, newVote];
        const nouvelleMoyenne = updatedVotes.reduce((sum, vote) => sum + vote.note, 0) / updatedVotes.length;
        setMoyenne(nouvelleMoyenne);
        
        // Fermer la modal et réinitialiser
        setShowVoteModal(false);
        setVotingComment('');
        
        // Rafraîchir les données depuis l'API
        setTimeout(() => {
          fetchVotes();
          fetchMyVote();
          fetchMoyenne();
        }, 500);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de la note:", err);
      alert("Erreur lors de l'envoi de la note");
    }
  };
  
  // Terminer la phase de vote
  const handleTerminerPhase = async () => {
    if (!confirm("Êtes-vous sûr de vouloir terminer cette phase de notation ?")) {
      return;
    }

    try {
      await axios.put(`/api/phases/${phaseId}/terminer`);
      alert("Phase de notation terminée avec succès");
      
      // Mettre à jour la phase localement
      setPhase(prevPhase => ({
        ...prevPhase,
        dateFin: new Date().toISOString()
      }));
    } catch (err) {
      console.error("Erreur lors de la terminaison de la phase:", err);
      
      // Simuler la terminaison en cas d'erreur
      setPhase(prevPhase => ({
        ...prevPhase,
        dateFin: new Date().toISOString()
      }));
      
      alert("Phase de notation terminée avec succès (simulation)");
    }
  };
  
  // Approuver ou rejeter le dossier
  const handleDecisionDossier = async (decision) => {
    try {
      const token = localStorage.getItem('token');
      
      // Vérifier que la phase est bien terminée
      if (!phase.dateFin) {
        alert("Vous devez d'abord terminer la phase de notation avant de prendre une décision");
        return;
      }
      
      const nouveauStatut = decision === 'approuver' ? 'APPROUVE' : 'REJETE';
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Tentative de ${decision} du dossier ${phase.dossier.id}`);
        
        await axios.put(`/api/dossiers/${phase.dossier.id}/statut`, null, {
          params: { statut: nouveauStatut },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        alert(`Le dossier a été ${decision === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`);
        
        // Rediriger vers la liste des dossiers
        router.push('/coordinateur/dossiers');
        
      } catch (apiError) {
        console.error(`Erreur API lors de la ${decision} du dossier:`, apiError);
        
        let errorMsg = `Erreur lors de la ${decision === 'approuver' ? 'validation' : 'refus'} du dossier.`;
        if (apiError.response) {
          errorMsg += ` (Code ${apiError.response.status})`;
          if (apiError.response.data?.message) {
            errorMsg += `: ${apiError.response.data.message}`;
          }
        }
        
        setError(errorMsg);
        setLoading(false);
        
        // Proposer la simulation
        if (confirm(`${errorMsg}\n\nVoulez-vous simuler la ${decision} du dossier ?`)) {
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

  // Composants utilitaires

  // Badge pour afficher une note avec couleur appropriée
  const NoteBadge = ({ note }) => {
    let bgColor = 'bg-red-100 text-red-800';
    let level = 'Insuffisant';
    
    if (note >= 16) {
      bgColor = 'bg-green-100 text-green-800';
      level = 'Excellent';
    } else if (note >= 12) {
      bgColor = 'bg-yellow-100 text-yellow-800';
      level = 'Bien';
    } else if (note >= 8) {
      bgColor = 'bg-orange-100 text-orange-800';
      level = 'Passable';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {note}/20
      </span>
    );
  };

  // Curseur pour sélectionner une note
  const NoteSlider = ({ value, onChange }) => {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>0</span>
          <span className="font-medium text-lg text-indigo-600">{value}/20</span>
          <span>20</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{
            background: `linear-gradient(to right, 
              #ef4444 0%, #ef4444 25%, 
              #f59e0b 25%, #f59e0b 50%, 
              #eab308 50%, #eab308 75%, 
              #10b981 75%, #10b981 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="text-red-600">Insuffisant</span>
          <span className="text-orange-600">Passable</span>
          <span className="text-yellow-600">Bien</span>
          <span className="text-green-600">Excellent</span>
        </div>
        <div className="mt-2 text-center">
          <NoteBadge note={value} />
        </div>
      </div>
    );
  };

  // Fonction utilitaire pour formater le nom d'utilisateur
  const formatUserName = (user) => {
    if (!user) return 'Utilisateur inconnu';
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return (prenom + ' ' + nom).trim() || 'Utilisateur inconnu';
  };

  // Calcul des statistiques
  const calculateStats = () => {
    if (votes.length === 0) return { distribution: [], min: 0, max: 0 };
    
    const notes = votes.map(v => v.note);
    const min = Math.min(...notes);
    const max = Math.max(...notes);
    
    const distribution = [
      { label: '0-5', count: notes.filter(n => n <= 5).length, color: 'bg-red-500' },
      { label: '6-10', count: notes.filter(n => n > 5 && n <= 10).length, color: 'bg-orange-500' },
      { label: '11-15', count: notes.filter(n => n > 10 && n <= 15).length, color: 'bg-yellow-500' },
      { label: '16-20', count: notes.filter(n => n > 15).length, color: 'bg-green-500' }
    ];
    
    return { distribution, min, max };
  };
  
  const stats = calculateStats();

  // Affichage du loading
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails de la notation...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs critiques
  if (error && !phase) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium">Erreur de chargement</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Affichage si phase non trouvée
  if (!phase) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Phase de notation non trouvée
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Affichage principal
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Message d'erreur/avertissement */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Attention</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Notation du dossier {phase.dossier.numeroDossier}
          </h1>
          <p className="text-gray-600 mt-1">{phase.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          {phase.dateFin === null ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Phase active
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Phase terminée
            </span>
          )}
          <button 
            onClick={fetchPhaseDetails}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
          >
            Actualiser
          </button>
        </div>
      </div>
      
      {/* Détails de la phase */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Informations du dossier</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Type de demande</p>
              <p className="font-medium">{phase.dossier.typeDemande?.libelle || 'Type non spécifié'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Déposant</p>
              <p className="font-medium">{phase.dossier.nomDeposant || ''} {phase.dossier.prenomDeposant || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de création</p>
              <p className="font-medium">
                {phase.dossier.dateCreation ? new Date(phase.dossier.dateCreation).toLocaleDateString() : 'Non spécifiée'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-600">Date de début de notation</p>
              <p className="font-medium">{new Date(phase.dateDebut).toLocaleDateString()}</p>
            </div>
            {phase.dateFin && (
              <div>
                <p className="text-sm text-gray-600">Date de fin de notation</p>
                <p className="font-medium">{new Date(phase.dateFin).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Résultats de notation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Résultats de la notation</h3>
        </div>
        <div className="p-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {moyenne ? moyenne.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Moyenne</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{votes.length}</div>
              <div className="text-sm text-gray-600">Notes</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.max || 0}</div>
              <div className="text-sm text-gray-600">Note max</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.min || 0}</div>
              <div className="text-sm text-gray-600">Note min</div>
            </div>
          </div>

          {/* Distribution des notes */}
          {votes.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Distribution des notes</h4>
              <div className="grid grid-cols-4 gap-2">
                {stats.distribution.map((tranche, index) => {
                  const percentage = votes.length > 0 ? (tranche.count / votes.length) * 100 : 0;
                  return (
                    <div key={index} className="text-center">
                      <div className="bg-gray-200 h-4 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full ${tranche.color} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">{tranche.label}</div>
                      <div className="text-sm font-medium">{tranche.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Bouton pour noter ou modifier ma note */}
          {phase.dateFin === null && (
            <div className="flex justify-center mb-6">
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => {
                  if (myVote) {
                    setVotingNote(myVote.note);
                    setVotingComment(myVote.commentaire || '');
                  } else {
                    setVotingNote(15);
                    setVotingComment('');
                  }
                  setShowVoteModal(true);
                }}
              >
                {myVote ? 'Modifier ma note' : 'Noter ce dossier'}
              </button>
            </div>
          )}
          
          {/* Si j'ai déjà noté, montrer ma note */}
          {myVote && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-indigo-900">Ma note</h4>
                <div className="flex items-center space-x-2">
                  <NoteBadge note={myVote.note} />
                  {phase.dateFin === null && (
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                      onClick={() => {
                        setVotingNote(myVote.note);
                        setVotingComment(myVote.commentaire || '');
                        setShowVoteModal(true);
                      }}
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
              {myVote.commentaire && (
                <p className="text-sm text-gray-700 mb-2">{myVote.commentaire}</p>
              )}
              <p className="text-xs text-gray-500">
                Noté le {new Date(myVote.dateCreation).toLocaleDateString()} à {new Date(myVote.dateCreation).toLocaleTimeString()}
              </p>
            </div>
          )}
          
          {/* Liste des notes */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Toutes les notes ({votes.length})
            </h4>
            
            {votes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">Aucune note pour le moment</p>
                {phase.dateFin === null && (
                  <p className="text-sm text-gray-400">Soyez le premier à noter ce dossier</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {votes.map(vote => (
                  <div key={vote.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {formatUserName(vote.utilisateur)}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {vote.utilisateur?.role || 'Rôle inconnu'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Noté le {new Date(vote.dateCreation).toLocaleDateString()} à {new Date(vote.dateCreation).toLocaleTimeString()}
                        </p>
                      </div>
                      <NoteBadge note={vote.note} />
                    </div>
                    {vote.commentaire && (
                      <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border-l-4 border-gray-300">
                        {vote.commentaire}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <p className="text-lg mb-2">
              Ce dossier a été {phase.dossier.statut === 'APPROUVE' ? 'approuvé' : 'rejeté'} définitivement.
            </p>
            <p className="text-sm opacity-75">
              Moyenne finale : {moyenne ? moyenne.toFixed(1) : '0.0'}/20
            </p>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ← Retour
        </button>
        
        <div className="flex items-center space-x-3">
          {phase.dateFin === null ? (
            // Boutons pour phase active
            <>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={handleTerminerPhase}
              >
                Terminer la notation
              </button>
            </>
          ) : (
            // Boutons pour phase terminée
            <>
              {phase.dossier?.statut !== 'APPROUVE' && phase.dossier?.statut !== 'REJETE' ? (
                // Boutons d'approbation/rejet
                <>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={() => {
                      setConfirmationAction('approuver');
                      setShowConfirmationModal(true);
                    }}
                  >
                    Approuver le dossier
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={() => {
                      setConfirmationAction('rejeter');
                      setShowConfirmationModal(true);
                    }}
                  >
                    Rejeter le dossier
                  </button>
                </>
              ) : (
                // Boutons de navigation si déjà traité
                <>
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => router.push('/coordinateur/dossiers')}
                  >
                    Voir tous les dossiers
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => router.push('/coordinateur/votes')}
                  >
                    Voir toutes les notations
                  </button>
                </>
              )}
            </>
          )}
          
          <button 
            onClick={() => window.open(`/coordinateur/dossiers/${phase.dossier.id}`, '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Voir le dossier complet
          </button>
        </div>
      </div>
      
      {/* Modal pour noter */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {myVote ? 'Modifier ma note' : 'Noter le dossier'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Dossier {phase.dossier.numeroDossier}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Votre note
                </label>
                <NoteSlider value={votingNote} onChange={setVotingNote} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (facultatif)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Justifiez votre notation..."
                  value={votingComment}
                  onChange={(e) => setVotingComment(e.target.value)}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Un commentaire aide les autres membres à comprendre votre évaluation.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => {
                    setShowVoteModal(false);
                    setVotingComment('');
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={handleSubmitVote}
                >
                  {myVote ? 'Modifier ma note' : 'Enregistrer ma note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation pour approbation/rejet */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {confirmationAction === 'approuver' ? 'Approuver le dossier' : 'Rejeter le dossier'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <strong>Moyenne obtenue :</strong> {moyenne ? moyenne.toFixed(1) : '0.0'}/20
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Nombre de notes :</strong> {votes.length}
                </p>
              </div>
              
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir {confirmationAction === 'approuver' ? 'approuver' : 'rejeter'} ce dossier ?
                Cette action est définitive et mettra fin au processus d'évaluation.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                    confirmationAction === 'approuver' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                  onClick={() => {
                    setShowConfirmationModal(false);
                    handleDecisionDossier(confirmationAction);
                  }}
                >
                  {confirmationAction === 'approuver' ? 'Approuver définitivement' : 'Rejeter définitivement'}
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