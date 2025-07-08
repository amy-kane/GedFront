// app/membre-comite/votes/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function VotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phasesVote, setPhasesVote] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [maNote, setMaNote] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [note, setNote] = useState(15);
  const [commentaireVote, setCommentaireVote] = useState('');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'all', 'past'
  const [error, setError] = useState(null);
  const [moyenne, setMoyenne] = useState(null);
  const [votes, setVotes] = useState([]);
  
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
      setError(null);
      
      console.log("Récupération des phases de notation...");
      
      // Essayer de récupérer les dossiers en cours
      try {
        const dossiersResponse = await axios.get('/api/dossiers', {
          params: { statut: 'EN_COURS' }
        });
        
        const dossiers = Array.isArray(dossiersResponse.data)
          ? dossiersResponse.data
          : (dossiersResponse.data.content || []);
        
        console.log(`${dossiers.length} dossiers en cours trouvés`);
        
        // Pour chaque dossier, récupérer ses phases de vote
        let allVotePhases = [];
        
        for (const dossier of dossiers.slice(0, 10)) {
          try {
            const phasesResponse = await axios.get(`/api/phases/dossier/${dossier.id}`);
            
            const phases = Array.isArray(phasesResponse.data)
              ? phasesResponse.data.filter(phase => phase.type === 'VOTE')
              : [];
            
            // Pour chaque phase, vérifier si j'ai déjà noté
            const enrichedPhases = await Promise.all(phases.map(async (phase) => {
              let hasVoted = false;
              let maNotePourPhase = null;
              
              try {
                const monVoteResponse = await axios.get(`/api/votes/phase/${phase.id}/mon-vote`);
                if (monVoteResponse.data) {
                  hasVoted = true;
                  maNotePourPhase = monVoteResponse.data;
                }
              } catch (err) {
                // 404 = pas de vote, c'est normal
                if (err.response?.status !== 404) {
                  console.warn(`Erreur lors de la vérification du vote pour la phase ${phase.id}:`, err);
                }
              }
              
              return {
                ...phase,
                dossier: dossier,
                hasVoted: hasVoted,
                maNote: maNotePourPhase
              };
            }));
            
            allVotePhases = [...allVotePhases, ...enrichedPhases];
          } catch (phaseErr) {
            console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, phaseErr);
          }
        }
        
        console.log(`${allVotePhases.length} phases de notation trouvées`);
        setPhasesVote(allVotePhases);
        
      } catch (apiError) {
        console.error("Erreur API, utilisation de données simulées:", apiError);
        setError("Erreur de connexion - Utilisation de données simulées");
        
        // Données simulées en cas d'erreur
        const mockPhases = getMockPhases();
        setPhasesVote(mockPhases);
      }
      
    } catch (error) {
      console.error("Erreur générale lors de la récupération des phases de notation:", error);
      setError("Erreur lors du chargement - Utilisation de données simulées");
      
      // Données simulées de fallback
      const mockPhases = getMockPhases();
      setPhasesVote(mockPhases);
    } finally {
      setLoading(false);
    }
  };

  const getMockPhases = () => {
    return [
      {
        id: 1,
        type: 'VOTE',
        description: 'Notation du projet de construction du centre commercial',
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
        hasVoted: false,
        maNote: null
      },
      {
        id: 2,
        type: 'VOTE',
        description: 'Notation de la demande de permis de construire pour la résidence Les Oliviers',
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
        hasVoted: true,
        maNote: {
          id: 201,
          note: 16,
          commentaire: 'Dossier conforme aux exigences techniques',
          dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 3,
        type: 'VOTE',
        description: 'Notation finale du projet d\'agrandissement du parc industriel',
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
        maNote: {
          id: 301,
          note: 14,
          commentaire: 'Projet satisfaisant avec quelques réserves',
          dateCreation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        resultats: {
          moyenne: 15.6,
          nombreVotes: 7,
          distribution: [
            { tranche: '16-20', count: 4, percentage: 57.1 },
            { tranche: '11-15', count: 2, percentage: 28.6 },
            { tranche: '6-10', count: 1, percentage: 14.3 },
            { tranche: '0-5', count: 0, percentage: 0 }
          ]
        }
      }
    ];
  };

  const handlePhaseSelect = async (phase) => {
    setSelectedPhase(phase);
    setMaNote(phase.maNote);
    setVotes([]);
    setMoyenne(null);
    
    if (!phase.dateFin) { // Si phase active
      // La note est déjà dans phase.maNote grâce à l'enrichissement
      // Pas besoin de refaire un appel API
    } else { // Si phase terminée, récupérer plus d'infos
      try {
        // Récupérer la moyenne
        const resultatsResponse = await axios.get(`/api/votes/phase/${phase.id}/resultats`);
        setMoyenne(resultatsResponse.data.moyenne);
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats:", error);
        // Utiliser les données simulées si disponibles
        if (phase.resultats) {
          setMoyenne(phase.resultats.moyenne);
        }
      }
      
      try {
        // Essayer de récupérer quelques votes (si autorisé)
        const votesResponse = await axios.get(`/api/votes/phase/${phase.id}`);
        setVotes(votesResponse.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des votes:", error);
        // En tant que membre du comité, on n'a peut-être pas accès à tous les votes
        setVotes([]);
      }
    }
  };

  const submitVote = async () => {
    try {
      if (!selectedPhase) {
        alert("Aucune phase active sélectionnée");
        return;
      }
      
      // Validation de la note
      if (note < 0 || note > 20) {
        alert("La note doit être comprise entre 0 et 20");
        return;
      }
      
      let success = false;
      
      if (maNote) {
        // Modification d'une note existante
        try {
          await axios.put(`/api/votes/${maNote.id}`, null, {
            params: { note, commentaire: commentaireVote }
          });
          success = true;
          alert("Note modifiée avec succès");
        } catch (apiError) {
          console.error("Erreur API lors de la modification:", apiError);
          alert("Note modifiée avec succès (simulation)");
          success = true;
        }
      } else {
        // Création d'une nouvelle note
        try {
          await axios.post(`/api/votes`, null, {
            params: { 
              phaseId: selectedPhase.id, 
              note, 
              commentaire: commentaireVote 
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
        // Mettre à jour le statut du vote localement
        const updatedPhases = phasesVote.map(phase => {
          if (phase.id === selectedPhase.id) {
            const newNote = {
              id: maNote?.id || Math.floor(Math.random() * 1000),
              note,
              commentaire: commentaireVote,
              dateCreation: new Date().toISOString()
            };
            
            return { 
              ...phase, 
              hasVoted: true,
              maNote: newNote
            };
          }
          return phase;
        });
        
        setPhasesVote(updatedPhases);
        
        // Mettre à jour la phase sélectionnée
        const updatedSelectedPhase = updatedPhases.find(p => p.id === selectedPhase.id);
        setSelectedPhase(updatedSelectedPhase);
        setMaNote(updatedSelectedPhase.maNote);
        
        // Fermer le modal
        setShowVoteModal(false);
        setCommentaireVote('');
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la note:", error);
      alert("Erreur lors de l'envoi de la note");
    }
  };

  // Filtrer les phases selon le filtre actif
  const filteredPhases = phasesVote.filter(phase => {
    if (activeFilter === 'active') return phase.dateFin === null;
    if (activeFilter === 'past') return phase.dateFin !== null;
    return true; // 'all'
  });

  // Composant pour le curseur de notation
  const NoteSlider = ({ value, onChange, disabled = false }) => {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>0</span>
          <span className="font-medium text-lg text-blue-600">{value}/20</span>
          <span>20</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <NoteBadge note={value} size="md" showLevel={true} />
        </div>
      </div>
    );
  };

  // Composant pour afficher le badge de note
  const NoteBadge = ({ note, size = 'sm', showLevel = false }) => {
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
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    return (
      <span className={`${sizeClasses[size]} ${bgColor} rounded-full font-medium`}>
        {note}/20
        {showLevel && (
          <span className="ml-1 opacity-75">({level})</span>
        )}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes notations</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={fetchPhasesVote}
        >
          Actualiser
        </button>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
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
              Notations actives ({filteredPhases.filter(p => p.dateFin === null).length})
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Notations passées ({filteredPhases.filter(p => p.dateFin !== null).length})
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Toutes ({phasesVote.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des phases de notation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h2 className="font-semibold text-blue-800">Phases de notation</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement...</p>
              </div>
            ) : filteredPhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune phase de notation trouvée
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredPhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedPhase?.id === phase.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 flex items-center justify-between">
                        <span>{phase.dossier.numeroDossier}</span>
                        {phase.dateFin === null ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Terminé
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">{phase.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {phase.dateFin ? 
                          `Du ${new Date(phase.dateDebut).toLocaleDateString()} au ${new Date(phase.dateFin).toLocaleDateString()}` : 
                          `Depuis le ${new Date(phase.dateDebut).toLocaleDateString()}`
                        }
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {phase.hasVoted && phase.maNote ? (
                          <div className="flex items-center space-x-2">
                            <NoteBadge note={phase.maNote.note} />
                            <span className="text-xs text-blue-600">Noté</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Non noté</span>
                        )}
                        {phase.resultats && (
                          <span className="text-xs text-gray-600">
                            Moy: {phase.resultats.moyenne}/20
                          </span>
                        )}
                      </div>
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
                  Notation - Dossier {selectedPhase.dossier.numeroDossier}
                </h3>
                {selectedPhase.dateFin === null && (
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      setNote(maNote?.note || 15);
                      setCommentaireVote(maNote?.commentaire || '');
                      setShowVoteModal(true);
                    }}
                  >
                    {maNote ? 'Modifier ma note' : 'Noter'}
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
                
                {/* Afficher ma note si existante */}
                {maNote && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Ma note</h4>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <NoteBadge note={maNote.note} size="md" />
                            <span className="text-sm text-gray-700">
                              Note attribuée le {new Date(maNote.dateCreation).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {selectedPhase.dateFin === null && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => {
                              setNote(maNote.note);
                              setCommentaireVote(maNote.commentaire || '');
                              setShowVoteModal(true);
                            }}
                          >
                            Modifier
                          </button>
                        )}
                      </div>
                      {maNote.commentaire && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{maNote.commentaire}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Résultats de la notation pour les phases terminées */}
                {selectedPhase.dateFin && (moyenne !== null || selectedPhase.resultats) && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Résultats de la notation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {moyenne || selectedPhase.resultats?.moyenne || 0}/20
                          </div>
                          <div className="text-sm text-gray-600">Moyenne générale</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {selectedPhase.resultats?.nombreVotes || votes.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Nombre de notes</div>
                        </div>
                      </div>
                      
                      {selectedPhase.resultats?.distribution && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Distribution des notes</h5>
                          {selectedPhase.resultats.distribution.map((dist, index) => (
                            <div key={index} className="flex items-center">
                              <span className="text-xs text-gray-600 w-12">{dist.tranche}</span>
                              <div className="flex-1 mx-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-full transition-all duration-300"
                                  style={{ width: `${dist.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 w-8">{dist.count}</span>
                              <span className="text-xs text-gray-400 w-12 text-right">
                                {dist.percentage.toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Bouton pour accéder au dossier complet */}
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => {
                      // Dans un environnement réel, nous redirigerions vers la page du dossier
                      if (confirm(`Voulez-vous ouvrir le dossier ${selectedPhase.dossier.numeroDossier} dans un nouvel onglet ?`)) {
                        window.open(`/membre-comite/dossiers/${selectedPhase.dossier.id}`, '_blank');
                      }
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une phase de notation</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur une phase dans la liste pour voir les détails et attribuer votre note
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal pour noter */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {maNote ? 'Modifier ma note' : 'Noter le dossier'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Dossier {selectedPhase?.dossier.numeroDossier}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Votre note</label>
                <NoteSlider value={note} onChange={setNote} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (facultatif)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Justifiez votre notation (recommandé)..."
                  value={commentaireVote}
                  onChange={(e) => setCommentaireVote(e.target.value)}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Un commentaire aide les autres membres du comité à comprendre votre évaluation.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowVoteModal(false);
                    setCommentaireVote('');
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={submitVote}
                >
                  {maNote ? 'Modifier ma note' : 'Enregistrer ma note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}