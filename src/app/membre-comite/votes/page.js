// app/membre-comite/votes/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VotesPage() {
  const [loading, setLoading] = useState(true);
  const [phasesVote, setPhasesVote] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [monVote, setMonVote] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [decision, setDecision] = useState('FAVORABLE');
  const [commentaireVote, setCommentaireVote] = useState('');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'all', 'past'
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchPhasesVote();
  }, []);

  const fetchPhasesVote = async () => {
    try {
      setLoading(true);
      
      // Dans un environnement réel, nous ferions un appel à une API dédiée
      // Cette API devrait retourner toutes les phases de vote accessibles au membre du comité
      // Pour le moment, nous simulons des données
      
      // Exemple de structure pour les phases de vote
      const mockPhases = [
        {
          id: 1,
          type: 'VOTE',
          description: 'Vote sur le projet de construction du centre commercial',
          dateDebut: new Date().toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 101,
            numeroDossier: 'DOS-2024-101',
            typeDemande: { libelle: 'Permis de construire' },
            nomDeposant: 'SCI Horizon',
            prenomDeposant: '',
            dateCreation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          hasVoted: false
        },
        {
          id: 2,
          type: 'VOTE',
          description: 'Vote sur la demande de permis de construire pour la résidence Les Oliviers',
          dateDebut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 102,
            numeroDossier: 'DOS-2024-102',
            typeDemande: { libelle: 'Permis de construire' },
            nomDeposant: 'Dupont',
            prenomDeposant: 'Jean',
            dateCreation: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          hasVoted: true
        },
        {
          id: 3,
          type: 'VOTE',
          description: 'Vote final sur le projet d\'agrandissement du parc industriel',
          dateDebut: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Phase terminée
          dossier: {
            id: 103,
            numeroDossier: 'DOS-2024-103',
            typeDemande: { libelle: 'Extension de bâtiment industriel' },
            nomDeposant: 'Entreprises Modernes',
            prenomDeposant: '',
            dateCreation: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
          },
          hasVoted: true,
          resultats: {
            FAVORABLE: 5,
            DEFAVORABLE: 2,
            COMPLEMENT_REQUIS: 0
          }
        }
      ];
      
      setPhasesVote(mockPhases);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des phases de vote:", error);
      setLoading(false);
    }
  };

  const handlePhaseSelect = async (phase) => {
    setSelectedPhase(phase);
    
    if (!phase.dateFin) { // Si phase active
      try {
        // Dans un environnement réel, nous ferions un appel API
        // pour récupérer le vote de l'utilisateur pour cette phase
        // const response = await axios.get(`/api/votes/phase/${phase.id}/mon-vote`);
        
        // Simulation d'un vote existant ou non selon hasVoted
        if (phase.hasVoted) {
          setMonVote({
            id: 101,
            decision: 'FAVORABLE',
            commentaire: 'Le projet est conforme aux critères urbanistiques',
            dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          });
        } else {
          setMonVote(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du vote:", error);
        setMonVote(null);
      }
    } else { // Si phase terminée
      setMonVote(null);
    }
  };

  const submitVote = async () => {
    try {
      if (!selectedPhase) {
        alert("Aucune phase active sélectionnée");
        return;
      }
      
      if (monVote) {
        // Dans un environnement réel, nous ferions un appel API pour modifier le vote
        // await axios.put(`/api/votes/${monVote.id}`, null, {
        //   params: { decision, commentaire: commentaireVote }
        // });
        
        alert("Vote modifié avec succès");
      } else {
        // Dans un environnement réel, nous ferions un appel API pour créer le vote
        // await axios.post(`/api/votes`, null, {
        //   params: { phaseId: selectedPhase.id, decision, commentaire: commentaireVote }
        // });
        
        alert("Vote enregistré avec succès");
      }
      
      // Mettre à jour le statut du vote localement
      const updatedPhases = phasesVote.map(phase => {
        if (phase.id === selectedPhase.id) {
          return { ...phase, hasVoted: true };
        }
        return phase;
      });
      
      setPhasesVote(updatedPhases);
      setSelectedPhase(prevPhase => ({ ...prevPhase, hasVoted: true }));
      
      // Mettre à jour le vote local
      setMonVote({
        id: monVote?.id || Math.floor(Math.random() * 1000),
        decision,
        commentaire: commentaireVote,
        dateCreation: new Date().toISOString()
      });
      
      // Fermer le modal
      setShowVoteModal(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du vote:", error);
      alert("Erreur lors de l'envoi du vote");
    }
  };

  // Filtrer les phases selon le filtre actif
  const filteredPhases = phasesVote.filter(phase => {
    if (activeFilter === 'active') return phase.dateFin === null;
    if (activeFilter === 'past') return phase.dateFin !== null;
    return true; // 'all'
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes votes</h1>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Afficher:</label>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'active' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('active')}
            >
              Votes actifs
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Votes passés
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Tous
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des phases de vote */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h2 className="font-semibold text-blue-800">Phases de vote</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredPhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune phase de vote trouvée</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPhase?.id === phase.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 flex items-center">
                        {phase.dossier.numeroDossier}
                        {phase.dateFin === null ? (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Terminé
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{phase.description}</p>
                      <p className="text-xs text-gray-500">
                        {phase.dateFin ? 
                          `Du ${new Date(phase.dateDebut).toLocaleDateString()} au ${new Date(phase.dateFin).toLocaleDateString()}` : 
                          `Depuis le ${new Date(phase.dateDebut).toLocaleDateString()}`
                        }
                      </p>
                      {phase.hasVoted && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Voté
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Détails de la phase */}
        <div className="md:col-span-2">
          {selectedPhase ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Vote - Dossier {selectedPhase.dossier.numeroDossier}
                </h3>
                {selectedPhase.dateFin === null && (
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      setDecision(monVote?.decision || 'FAVORABLE');
                      setCommentaireVote(monVote?.commentaire || '');
                      setShowVoteModal(true);
                    }}
                  >
                    {monVote ? 'Modifier mon vote' : 'Voter'}
                  </button>
                )}
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                    {selectedPhase.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Type de demande</p>
                    <p className="font-medium">{selectedPhase.dossier.typeDemande.libelle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Déposant</p>
                    <p className="font-medium">{selectedPhase.dossier.nomDeposant} {selectedPhase.dossier.prenomDeposant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">{new Date(selectedPhase.dateDebut).toLocaleDateString()}</p>
                  </div>
                  {selectedPhase.dateFin && (
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="font-medium">{new Date(selectedPhase.dateFin).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {/* Afficher mon vote si existant */}
                {monVote && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Mon vote</h4>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <DecisionBadge decision={monVote.decision} />
                            <span className="ml-2 text-sm text-gray-700">
                              Vote effectué le {new Date(monVote.dateCreation).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {selectedPhase.dateFin === null && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => {
                              setDecision(monVote.decision);
                              setCommentaireVote(monVote.commentaire || '');
                              setShowVoteModal(true);
                            }}
                          >
                            Modifier
                          </button>
                        )}
                      </div>
                      {monVote.commentaire && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{monVote.commentaire}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Résultats du vote pour les phases terminées */}
                {selectedPhase.dateFin && selectedPhase.resultats && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Résultats du vote</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-600">Favorable</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPhase.resultats.FAVORABLE}
                          </div>
                        </div>
                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${(selectedPhase.resultats.FAVORABLE / (selectedPhase.resultats.FAVORABLE + selectedPhase.resultats.DEFAVORABLE + selectedPhase.resultats.COMPLEMENT_REQUIS)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-600">Défavorable</span>
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            {selectedPhase.resultats.DEFAVORABLE}
                          </div>
                        </div>
                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${(selectedPhase.resultats.DEFAVORABLE / (selectedPhase.resultats.FAVORABLE + selectedPhase.resultats.DEFAVORABLE + selectedPhase.resultats.COMPLEMENT_REQUIS)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-600">Complément</span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {selectedPhase.resultats.COMPLEMENT_REQUIS}
                          </div>
                        </div>
                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-yellow-500 h-full rounded-full"
                            style={{ width: `${(selectedPhase.resultats.COMPLEMENT_REQUIS / (selectedPhase.resultats.FAVORABLE + selectedPhase.resultats.DEFAVORABLE + selectedPhase.resultats.COMPLEMENT_REQUIS)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bouton pour accéder au dossier complet */}
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => {
                      // Dans un environnement réel, nous redirigerions vers la page du dossier
                      alert("Redirection vers le dossier " + selectedPhase.dossier.numeroDossier);
                    }}
                  >
                    Voir le dossier complet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une phase de vote</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur une phase dans la liste pour voir les détails et voter
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal pour voter */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {monVote ? 'Modifier mon vote' : 'Voter'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre décision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`p-2 rounded-md ${decision === 'FAVORABLE' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('FAVORABLE')}
                  >
                    <span className="block text-center text-sm font-medium mb-1">Favorable</span>
                    <CheckIcon className="h-5 w-5 mx-auto text-green-500" />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${decision === 'DEFAVORABLE' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('DEFAVORABLE')}
                  >
                    <span className="block text-center text-sm font-medium mb-1">Défavorable</span>
                    <XIcon className="h-5 w-5 mx-auto text-red-500" />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${decision === 'COMPLEMENT_REQUIS' ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('COMPLEMENT_REQUIS')}
                  >
                    <span className="block text-center text-sm font-medium mb-1">Complément</span>
                    <InfoIcon className="h-5 w-5 mx-auto text-yellow-500" />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (facultatif)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Justifiez votre décision..."
                  value={commentaireVote}
                  onChange={(e) => setCommentaireVote(e.target.value)}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={submitVote}
                >
                  {monVote ? 'Modifier' : 'Voter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher le badge de décision
const DecisionBadge = ({ decision }) => {
  switch (decision) {
    case 'FAVORABLE':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Favorable
        </span>
      );
    case 'DEFAVORABLE':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Défavorable
        </span>
      );
    case 'COMPLEMENT_REQUIS':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Complément requis
        </span>
      );
    default:
      return null;
  }
};

// Icônes
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);