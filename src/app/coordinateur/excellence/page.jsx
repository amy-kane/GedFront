// app/coordinateur/excellence/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ExcellenceDashboard = () => {
  const router = useRouter();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [selectedDossiers, setSelectedDossiers] = useState([]);
  
  // États de filtrage
  const [seuilMin, setSeuilMin] = useState(0);
  const [seuilMax, setSeuilMax] = useState(20);
  const [minNombreVotes, setMinNombreVotes] = useState(1);
  const [typeDemandeFilter, setTypeDemandeFilter] = useState('');
  const [sortBy, setSortBy] = useState('moyenne_desc');
  const [topN, setTopN] = useState(0); // 0 = pas de limite, sinon nombre de dossiers à afficher
  
  // États d'interface
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // États pour les notifications et confirmations
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // État pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    excellent: 0,
    bon: 0,
    passable: 0,
    insuffisant: 0,
    moyenneGlobale: 0
  });
  
  // Configuration de l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchDossiersWithNotes();
  }, []);

  // Fonctions pour les notifications et confirmations
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const showConfirmDialog = (title, message, onConfirm, confirmText = 'Confirmer', cancelText = 'Annuler') => {
    setConfirmDialog({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // Effet pour filtrer et trier les dossiers
  useEffect(() => {
    applyFiltersAndSorting();
  }, [dossiers, seuilMin, seuilMax, minNombreVotes, typeDemandeFilter, sortBy, topN]);

  // Fonction pour calculer les statistiques
  const calculateStats = (dossiers) => {
    const total = dossiers.length;
    // Filtrer seulement les dossiers avec des notes pour les calculs de moyennes
    const dossiersAvecNotes = dossiers.filter(d => d.statistiques.moyenne !== null);
    
    const excellent = dossiersAvecNotes.filter(d => d.statistiques.moyenne >= 16).length;
    const bon = dossiersAvecNotes.filter(d => d.statistiques.moyenne >= 12 && d.statistiques.moyenne < 16).length;
    const passable = dossiersAvecNotes.filter(d => d.statistiques.moyenne >= 8 && d.statistiques.moyenne < 12).length;
    const insuffisant = dossiersAvecNotes.filter(d => d.statistiques.moyenne < 8).length;
    const moyenneGlobale = dossiersAvecNotes.length > 0 
      ? dossiersAvecNotes.reduce((sum, d) => sum + d.statistiques.moyenne, 0) / dossiersAvecNotes.length 
      : 0;

    const newStats = {
      total,
      excellent,
      bon,
      passable,
      insuffisant,
      moyenneGlobale
    };

    console.log("=== STATS CALCULÉES EXCELLENCE ===");
    console.log("Total dossiers:", total);
    console.log("Dossiers avec notes:", dossiersAvecNotes.length);
    console.log("Excellent (16-20):", excellent);
    console.log("Bon (12-15):", bon);
    console.log("Passable (8-11):", passable);
    console.log("Insuffisant (0-7):", insuffisant);
    console.log("Moyenne globale:", moyenneGlobale.toFixed(2));

    setStats(newStats);
    return newStats;
  };

  // Récupérer tous les dossiers avec leurs notes et moyennes
  const fetchDossiersWithNotes = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      console.log("Récupération des dossiers EN_COURS...");
      
      // Récupérer uniquement les dossiers EN_COURS
      const enCoursResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fonction pour extraire les dossiers selon la structure de la réponse
      const extractDossiers = (response) => {
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.content)) {
            return response.data.content;
          } else if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return [];
      };
      
      // Extraire les dossiers de la réponse
      const allDossiers = extractDossiers(enCoursResponse);
      
      console.log(`${allDossiers.length} dossiers EN_COURS récupérés`);
      console.log("Statuts des dossiers récupérés:", allDossiers.map(d => ({ 
        id: d.id, 
        numero: d.numeroDossier, 
        statut: d.statut 
      })));
      
      // Filtrage de sécurité : s'assurer qu'on n'a que des dossiers EN_COURS
      const dossiersEnCours = allDossiers.filter(dossier => dossier.statut === 'EN_COURS');
      
      if (dossiersEnCours.length !== allDossiers.length) {
        console.warn(`⚠️ ATTENTION: ${allDossiers.length - dossiersEnCours.length} dossier(s) avec un statut différent de EN_COURS ont été exclus`);
        console.warn("Dossiers exclus:", allDossiers.filter(d => d.statut !== 'EN_COURS').map(d => ({ 
          id: d.id, 
          numero: d.numeroDossier, 
          statut: d.statut 
        })));
      }
      
      // Pour chaque dossier EN_COURS, récupérer les phases de vote et calculer les statistiques
      const dossiersEnriches = await Promise.all(
        dossiersEnCours.map(async (dossier) => {
          try {
            // Récupérer les phases du dossier
            const phasesResponse = await axios.get(`/api/phases/dossier/${dossier.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const phases = Array.isArray(phasesResponse.data) ? phasesResponse.data : [];
            const phasesVote = phases.filter(phase => phase.type === 'VOTE');

            let statistiques = {
              nombrePhases: phasesVote.length,
              nombreVotes: 0,
              moyenne: null,
              min: null,
              max: null,
              ecartType: null,
              distribution: [],
              hasNotes: false
            };

            // Pour chaque phase de vote, récupérer les notes
            for (const phase of phasesVote) {
              try {
                const [votesResponse, moyenneResponse] = await Promise.all([
                  axios.get(`/api/votes/phase/${phase.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }).catch(() => ({ data: [] })),
                  axios.get(`/api/votes/phase/${phase.id}/resultats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }).catch(() => ({ data: { moyenne: null } }))
                ]);

                const votes = votesResponse.data || [];
                const moyenne = moyenneResponse.data?.moyenne;

                if (votes.length > 0) {
                  statistiques.hasNotes = true;
                  statistiques.nombreVotes += votes.length;
                  
                  // Calculer les statistiques de cette phase
                  const notes = votes.map(vote => vote.note);
                  const min = Math.min(...notes);
                  const max = Math.max(...notes);
                  
                  // Mettre à jour les min/max globaux
                  statistiques.min = statistiques.min === null ? min : Math.min(statistiques.min, min);
                  statistiques.max = statistiques.max === null ? max : Math.max(statistiques.max, max);
                  
                  // Pour la moyenne globale, on prend la dernière phase (la plus récente)
                  if (moyenne !== null) {
                    statistiques.moyenne = moyenne;
                  }
                }
              } catch (error) {
                console.warn(`Erreur lors de la récupération des votes pour la phase ${phase.id}:`, error);
              }
            }

            return {
              ...dossier,
              statistiques,
              phaseVoteActive: phasesVote.find(p => p.dateFin === null),
              phasesVote
            };
          } catch (error) {
            console.warn(`Erreur lors de l'enrichissement du dossier ${dossier.id}:`, error);
            return {
              ...dossier,
              statistiques: {
                nombrePhases: 0,
                nombreVotes: 0,
                moyenne: null,
                min: null,
                max: null,
                hasNotes: false
              },
              phaseVoteActive: null,
              phasesVote: []
            };
          }
        })
      );

      // Afficher TOUS les dossiers récupérés (comme CoordinateurDashboard)
      console.log(`${dossiersEnriches.length} dossiers EN_COURS traités`);
      console.log("Dossiers récupérés:", dossiersEnriches.map(d => ({ 
        id: d.id, 
        numero: d.numeroDossier,
        statut: d.statut,
        moyenne: d.statistiques.moyenne,
        votes: d.statistiques.nombreVotes,
        hasNotes: d.statistiques.hasNotes
      })));
      
      setDossiers(dossiersEnriches);
      
      // Calculer les stats initiales
      calculateStats(dossiersEnriches);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      
      // Données simulées en cas d'erreur (uniquement EN_COURS)
      const dossiersSimules = generateSimulatedData();
      setDossiers(dossiersSimules);
      calculateStats(dossiersSimules);
    } finally {
      setLoading(false);
    }
  };

  // Générer des données simulées pour le développement
  const generateSimulatedData = () => {
    const typesDemande = [
      { id: 1, libelle: 'Permis de construire' },
      { id: 2, libelle: 'Autorisation d\'urbanisme' },
      { id: 3, libelle: 'Déclaration préalable' }
    ];

    return Array.from({ length: 15 }, (_, index) => {
      const nombreVotes = Math.floor(Math.random() * 8) + 3; // 3-10 votes
      const notes = Array.from({ length: nombreVotes }, () => Math.floor(Math.random() * 21)); // 0-20
      const moyenne = notes.reduce((sum, note) => sum + note, 0) / notes.length;
      const min = Math.min(...notes);
      const max = Math.max(...notes);
      
      return {
        id: index + 1,
        numeroDossier: `DOS-2025-${String(index + 1).padStart(3, '0')}`,
        nomDeposant: `Déposant${index + 1}`,
        prenomDeposant: `Prénom${index + 1}`,
        typeDemande: typesDemande[index % typesDemande.length],
        statut: 'EN_COURS', // Toujours EN_COURS
        dateCreation: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        statistiques: {
          nombrePhases: 1,
          nombreVotes,
          moyenne: parseFloat(moyenne.toFixed(1)),
          min,
          max,
          hasNotes: true
        },
        phaseVoteActive: index % 3 === 0 ? { id: index + 100, type: 'VOTE' } : null,
        phasesVote: [{ id: index + 100, type: 'VOTE', dateFin: index % 3 === 0 ? null : new Date().toISOString() }]
      };
    });
  };

  // Appliquer les filtres et le tri
  const applyFiltersAndSorting = () => {
    let filtered = dossiers.filter(dossier => {
      const statsData = dossier.statistiques;
      
      // Si le dossier n'a pas de notes, on peut le garder mais il ne passera pas les filtres de moyenne
      if (statsData.moyenne === null) {
        // Pour un dashboard d'excellence, on peut vouloir exclure les dossiers sans notes
        // ou les inclure selon les besoins métier
        return false; // Changez en true si vous voulez inclure les dossiers sans notes
      }
      
      // Filtre par moyenne
      if (statsData.moyenne < seuilMin || statsData.moyenne > seuilMax) return false;
      
      // Filtre par nombre minimum de votes
      if (statsData.nombreVotes < minNombreVotes) return false;
      
      // Filtre par type de demande
      if (typeDemandeFilter && dossier.typeDemande?.libelle !== typeDemandeFilter) return false;
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'moyenne_desc':
          return (b.statistiques.moyenne || 0) - (a.statistiques.moyenne || 0);
        case 'moyenne_asc':
          return (a.statistiques.moyenne || 0) - (b.statistiques.moyenne || 0);
        case 'votes_desc':
          return b.statistiques.nombreVotes - a.statistiques.nombreVotes;
        case 'votes_asc':
          return a.statistiques.nombreVotes - b.statistiques.nombreVotes;
        case 'date_desc':
          return new Date(b.dateCreation) - new Date(a.dateCreation);
        case 'date_asc':
          return new Date(a.dateCreation) - new Date(b.dateCreation);
        default:
          return 0;
      }
    });

    // Appliquer la limite TopN si définie
    if (topN > 0) {
      filtered = filtered.slice(0, topN);
      console.log(`Top ${topN} dossiers appliqué, ${filtered.length} dossiers retenus`);
    }

    setFilteredDossiers(filtered);
    
    // Calculer les stats basées sur les dossiers filtrés
    calculateStats(filtered);
  };

  // Fonction pour définir le Top N avec tri automatique par excellence
  const setTopNWithSort = (n) => {
    setTopN(n);
    if (n > 0) {
      // Forcer le tri par moyenne décroissante pour avoir les meilleurs en premier
      setSortBy('moyenne_desc');
    }
  };
  const setZonePredéfinie = (zone) => {
    switch (zone) {
      case 'excellent':
        setSeuilMin(16);
        setSeuilMax(20);
        break;
      case 'bon':
        setSeuilMin(12);
        setSeuilMax(15);
        break;
      case 'passable':
        setSeuilMin(8);
        setSeuilMax(11);
        break;
      case 'insuffisant':
        setSeuilMin(0);
        setSeuilMax(7);
        break;
      case 'tous':
        setSeuilMin(0);
        setSeuilMax(20);
        break;
    }
  };

  // Gestion de la sélection en lot
  const toggleDossierSelection = (dossierId) => {
    setSelectedDossiers(prev => 
      prev.includes(dossierId) 
        ? prev.filter(id => id !== dossierId)
        : [...prev, dossierId]
    );
  };

  const selectAll = () => {
    setSelectedDossiers(filteredDossiers.map(d => d.id));
  };

  const deselectAll = () => {
    setSelectedDossiers([]);
  };

  // Actions en lot
  const approuverEnLot = async () => {
    if (selectedDossiers.length === 0) return;
    
    showConfirmDialog(
      'Approbation ',
      `Êtes-vous sûr de vouloir approuver ${selectedDossiers.length} dossier(s) sélectionné(s) ?`,
      async () => {
        try {
          for (const dossierId of selectedDossiers) {
            await axios.put(`/api/dossiers/${dossierId}/statut`, null, {
              params: { statut: 'APPROUVE' }
            });
          }
          
          showNotification(`${selectedDossiers.length} dossier(s) approuvé(s) avec succès`, 'success');
          setSelectedDossiers([]);
          fetchDossiersWithNotes();
        } catch (error) {
          console.error("Erreur lors de l'approbation en lot:", error);
          showNotification("Erreur lors de l'approbation. Opération simulée.", 'error');
          setSelectedDossiers([]);
        }
        hideConfirmDialog();
      },
      'Approuver',
      'Annuler'
    );
  };

  const rejeterEnLot = async () => {
    if (selectedDossiers.length === 0) return;
    
    showConfirmDialog(
      'Rejet en lot',
      `Êtes-vous sûr de vouloir rejeter ${selectedDossiers.length} dossier(s) sélectionné(s) ?`,
      async () => {
        try {
          for (const dossierId of selectedDossiers) {
            await axios.put(`/api/dossiers/${dossierId}/statut`, null, {
              params: { statut: 'REJETE' }
            });
          }
          
          showNotification(`${selectedDossiers.length} dossier(s) rejeté(s) avec succès`, 'success');
          setSelectedDossiers([]);
          fetchDossiersWithNotes();
        } catch (error) {
          console.error("Erreur lors du rejet en lot:", error);
          showNotification("Erreur lors du rejet. Opération simulée.", 'error');
          setSelectedDossiers([]);
        }
        hideConfirmDialog();
      },
      'Rejeter',
      'Annuler'
    );
  };

  // Composants utilitaires
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

  const StatutBadge = ({ statut }) => {
    const colors = {
      'EN_COURS': 'bg-blue-100 text-blue-800',
      'APPROUVE': 'bg-green-100 text-green-800',
      'REJETE': 'bg-red-100 text-red-800'
    };
    
    // Avertissement si le statut n'est pas EN_COURS dans ce dashboard
    const isIncorrectStatus = statut !== 'EN_COURS';
    
    return (
      <div className="flex items-center space-x-1">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statut] || 'bg-gray-100 text-gray-800'}`}>
          {statut}
        </span>
        {isIncorrectStatus && (
          <span className="text-red-500 text-xs" title="Ce dossier ne devrait pas apparaître dans cette liste">
            ⚠️
          </span>
        )}
      </div>
    );
  };

  const RangeSlider = ({ min, max, value, onChange, label, step = 1 }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="px-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span className="font-medium text-indigo-600">{value}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des dossiers et calcul des moyennes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Aide à la décision pour les dossiers évalués</p>
        </div>
        {/* <div className="flex space-x-3">
          <button
            onClick={() => {
              // Forcer l'actualisation en vidant le cache
              setDossiers([]);
              setFilteredDossiers([]);
              fetchDossiersWithNotes();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            🔄 Actualiser (Force)
          </button>
          <button
            onClick={fetchDossiersWithNotes}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Actualiser
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {showStats ? 'Masquer' : 'Afficher'} Statistiques
          </button>
        </div> */}
      </div>

      {/* Statistiques globales */}
      {showStats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total filtré</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
              <div className="text-sm text-gray-600">Excellents (16-20)</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.bon}</div>
              <div className="text-sm text-gray-600">Bons (12-15)</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.passable}</div>
              <div className="text-sm text-gray-600">Passables (8-11)</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600">{stats.insuffisant}</div>
              <div className="text-sm text-gray-600">Insuffisants (0-7)</div>
            </div>
          </div>
          
          {/* Moyenne globale et info Top N */}
          <div className={`p-4 rounded-lg shadow text-center mb-6 ${topN > 0 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}>
            <div className="text-2xl font-bold text-indigo-600">{stats.moyenneGlobale.toFixed(1)}/20</div>
            <div className="text-sm text-gray-600">
              {topN > 0 ? `Moyenne du Top ${topN}` : 'Moyenne globale'}
            </div>
            {topN > 0 && (
              <div className="text-xs text-indigo-600 mt-1">
                📊 Affichage limité aux {Math.min(topN, stats.total)} meilleurs dossiers
              </div>
            )}
          </div>
        </>
      )}

      {/* Contrôles de filtrage */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres et Tri</h3>
        
        {/* Zones prédéfinies */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Zones prédéfinies</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setZonePredéfinie('excellent')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
            >
              Excellents (16-20)
            </button>
            <button
              onClick={() => setZonePredéfinie('bon')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
            >
              Bons (12-15)
            </button>
            <button
              onClick={() => setZonePredéfinie('passable')}
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 text-sm"
            >
              Passables (8-11)
            </button>
            <button
              onClick={() => setZonePredéfinie('insuffisant')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
            >
              Insuffisants (0-7)
            </button>
            <button
              onClick={() => setZonePredéfinie('tous')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            >
              Tous
            </button>
          </div>
        </div>

        {/* Filtre Top N par excellence */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top dossiers par excellence 
            {topN > 0 && <span className="text-indigo-600 font-semibold"> (Top {topN})</span>}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setTopNWithSort(0)}
              className={`px-3 py-1 rounded-md text-sm ${topN === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setTopNWithSort(5)}
              className={`px-3 py-1 rounded-md text-sm ${topN === 5 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Top 5
            </button>
            <button
              onClick={() => setTopNWithSort(10)}
              className={`px-3 py-1 rounded-md text-sm ${topN === 10 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Top 10
            </button>
            <button
              onClick={() => setTopNWithSort(15)}
              className={`px-3 py-1 rounded-md text-sm ${topN === 15 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Top 15
            </button>
            <button
              onClick={() => setTopNWithSort(20)}
              className={`px-3 py-1 rounded-md text-sm ${topN === 20 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Top 20
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Nombre personnalisé :</label>
            <input
              type="number"
              min="0"
              max="100"
              value={topN}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setTopNWithSort(value);
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
            />
            <span className="text-xs text-gray-500">(0 = tous)</span>
          </div>
        </div>

        {/* Curseurs de seuils */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <RangeSlider
            min={0}
            max={20}
            value={seuilMin}
            onChange={setSeuilMin}
            label="Note minimum"
          />
          <RangeSlider
            min={0}
            max={20}
            value={seuilMax}
            onChange={setSeuilMax}
            label="Note maximum"
          />
          <RangeSlider
            min={1}
            max={10}
            value={minNombreVotes}
            onChange={setMinNombreVotes}
            label="Minimum de votes"
          />
        </div>

        {/* Autres filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tri par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="moyenne_desc">Moyenne décroissante</option>
              <option value="moyenne_asc">Moyenne croissante</option>
              <option value="votes_desc">Plus de votes</option>
              <option value="votes_asc">Moins de votes</option>
              <option value="date_desc">Plus récents</option>
              <option value="date_asc">Plus anciens</option>
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de demande</label>
            <select
              value={typeDemandeFilter}
              onChange={(e) => setTypeDemandeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les types</option>
              <option value="Permis de construire">Permis de construire</option>
              <option value="Autorisation d'urbanisme">Autorisation d'urbanisme</option>
              <option value="Déclaration préalable">Déclaration préalable</option>
            </select>
          </div> */}
        </div>
      </div>

      {/* Actions en lot */}
      {selectedDossiers.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-indigo-900">
                {selectedDossiers.length} dossier(s) sélectionné(s)
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={deselectAll}
                className="px-3 py-1 text-indigo-700 hover:text-indigo-900 text-sm"
              >
                Tout désélectionner
              </button>
              <button
                onClick={approuverEnLot}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Approuver sélection
              </button>
              <button
                onClick={rejeterEnLot}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Rejeter sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des dossiers */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              {topN > 0 ? (
                <span>
                  Top {topN} dossiers par excellence ({filteredDossiers.length} affichés)
                </span>
              ) : (
                <span>
                  Dossiers filtrés ({filteredDossiers.length})
                </span>
              )}
            </h3>
            <div className="flex space-x-2">
              {topN > 0 && (
                <button
                  onClick={() => setTopNWithSort(0)}
                  className="px-3 py-1 text-red-600 hover:text-red-800 text-sm border border-red-300 rounded hover:bg-red-50"
                >
                  Supprimer limite
                </button>
              )}
              <button
                onClick={selectAll}
                disabled={filteredDossiers.length === 0}
                className="px-3 py-1 text-indigo-600 hover:text-indigo-800 text-sm disabled:text-gray-400"
              >
                Tout sélectionner
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDossiers.length === filteredDossiers.length && filteredDossiers.length > 0}
                    onChange={selectedDossiers.length === filteredDossiers.length ? deselectAll : selectAll}
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dossier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Déposant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moyenne</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Aucun dossier ne correspond aux critères de filtrage
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((dossier) => (
                  <tr key={`dossier-${dossier.id}`} className={`hover:bg-gray-50 ${dossier.statut !== 'EN_COURS' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDossiers.includes(dossier.id)}
                        onChange={() => toggleDossierSelection(dossier.id)}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{dossier.numeroDossier}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(dossier.dateCreation).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {dossier.nomDeposant} {dossier.prenomDeposant}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {dossier.typeDemande?.libelle || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <NoteBadge note={dossier.statistiques.moyenne} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {dossier.statistiques.nombreVotes} Note{dossier.statistiques.nombreVotes > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {dossier.statistiques.min} / {dossier.statistiques.max}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatutBadge statut={dossier.statut} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/coordinateur/dossiers/${dossier.id}`)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Voir
                        </button>
                        {dossier.phaseVoteActive && (
                          <button
                            onClick={() => router.push(`/coordinateur/votes/${dossier.phaseVoteActive.id}`)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Noter
                          </button>
                        )}
                        {dossier.statut === 'EN_COURS' && !dossier.phaseVoteActive && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                showConfirmDialog(
                                  'Approuver le dossier',
                                  `Êtes-vous sûr de vouloir approuver le dossier ${dossier.numeroDossier} ?`,
                                  async () => {
                                    try {
                                      await axios.put(`/api/dossiers/${dossier.id}/statut`, null, {
                                        params: { statut: 'APPROUVE' }
                                      });
                                      showNotification(`Dossier ${dossier.numeroDossier} approuvé avec succès`, 'success');
                                      fetchDossiersWithNotes();
                                    } catch (error) {
                                      showNotification("Erreur lors de l'approbation (simulée)", 'error');
                                    }
                                    hideConfirmDialog();
                                  },
                                  'Approuver',
                                  'Annuler'
                                );
                              }}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                showConfirmDialog(
                                  'Rejeter le dossier',
                                  `Êtes-vous sûr de vouloir rejeter le dossier ${dossier.numeroDossier} ?`,
                                  async () => {
                                    try {
                                      await axios.put(`/api/dossiers/${dossier.id}/statut`, null, {
                                        params: { statut: 'REJETE' }
                                      });
                                      showNotification(`Dossier ${dossier.numeroDossier} rejeté avec succès`, 'success');
                                      fetchDossiersWithNotes();
                                    } catch (error) {
                                      showNotification("Erreur lors du rejet (simulé)", 'error');
                                    }
                                    hideConfirmDialog();
                                  },
                                  'Rejeter',
                                  'Annuler'
                                );
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✗
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 p-4 ${
            notification.type === 'success' ? 'border-green-500' : 
            notification.type === 'error' ? 'border-red-500' : 
            notification.type === 'info' ? 'border-blue-500' : 'border-yellow-500'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 
                  notification.type === 'error' ? 'text-red-800' : 
                  notification.type === 'info' ? 'text-blue-800' : 'text-yellow-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setNotification(null)}
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmation */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-scale-in">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {confirmDialog.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {confirmDialog.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDialog.onConfirm}
                >
                  {confirmDialog.confirmText}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={hideConfirmDialog}
                >
                  {confirmDialog.cancelText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExcellenceDashboard;