// app/coordinateur/discussions/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import CommentairesSection from '../../../../components/CommentairesSection';

const DiscussionDetails = () => {
  const params = useParams();
  const phaseId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchPhaseDetails();
  }, [phaseId]);
  
  const fetchPhaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de récupérer les détails de la phase
      try {
        const response = await axios.get(`/api/phases/${phaseId}`);
        setPhase(response.data);
        console.log("Phase récupérée:", response.data);
      } catch (apiError) {
        console.error("Erreur API:", apiError);
        // Si l'API renvoie une erreur 404, utiliser des données simulées
        const simulatedData = getSimulatedPhaseDetails(phaseId);
        setPhase(simulatedData);
        setError("Utilisation de données simulées suite à une erreur de l'API. Certaines fonctionnalités peuvent être limitées.");
      }
    } catch (err) {
      console.error("Erreur générale lors de la récupération des détails:", err);
      setError("Impossible de charger les détails de cette phase. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };
  
  // Données de test pour la démonstration
  const getSimulatedPhaseDetails = (id) => {
    const now = new Date();
    return {
      id: parseInt(id),
      type: 'DISCUSSION',
      description: 'Examen des mesures compensatoires proposées en zone humide',
      dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null, // Phase active
      dossier: {
        id: 105,
        numeroDossier: 'ENV-2024-105',
        typeDemande: { libelle: 'Autorisation environnementale' },
        nomDeposant: 'EcoÉnergie Renouvelable',
        prenomDeposant: '',
        dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  };
  
  const handleProlongerPhase = async () => {
    try {
      const joursSupplement = prompt("Nombre de jours supplémentaires :", "7");
      if (joursSupplement === null) return;
      
      const joursNum = parseInt(joursSupplement);
      if (isNaN(joursNum) || joursNum <= 0) {
        alert("Veuillez entrer un nombre de jours valide");
        return;
      }
      
      try {
        await axios.put(`/api/phases/${phaseId}/prolonger`, null, {
          params: { joursSupplementaires: joursNum }
        });
        
        alert(`Phase prolongée de ${joursNum} jours`);
        fetchPhaseDetails();
      } catch (err) {
        console.error("Erreur API lors de la prolongation:", err);
        alert("Erreur lors de la prolongation de la phase - L'API n'est peut-être pas disponible");
      }
    } catch (err) {
      console.error("Erreur générale lors de la prolongation:", err);
      alert("Erreur lors de la prolongation de la phase");
    }
  };
  
  const handleTerminerPhase = async () => {
    if (confirm("Êtes-vous sûr de vouloir terminer cette phase ?")) {
      try {
        try {
          await axios.put(`/api/phases/${phaseId}/terminer`);
          alert("Phase terminée avec succès");
          fetchPhaseDetails();
        } catch (err) {
          console.error("Erreur API lors de la terminaison:", err);
          alert("Erreur lors de la terminaison de la phase - L'API n'est peut-être pas disponible");
          
          // Simuler la terminaison en local
          if (phase) {
            setPhase({
              ...phase,
              dateFin: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Erreur générale lors de la terminaison:", err);
        alert("Erreur lors de la terminaison de la phase");
      }
    }
  };
  
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
      {/* Afficher un message d'avertissement si utilisation de données simulées */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Discussion sur le dossier {phase.dossier.numeroDossier || `Dossier ${phase.dossier.id}`}
        </h1>
        {phase.dateFin === null && (
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
      
      {/* Section des commentaires */}
      <div className="mb-6">
        <CommentairesSection 
          dossierId={phase.dossier.id}
          userRole="COORDINATEUR"
        />
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-between">
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Retour aux phases
        </button>
        
        <div className="space-x-3">
          {phase.dateFin === null && (
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
          )}
          <button 
            onClick={() => window.open(`/coordinateur/dossiers/${phase.dossier.id}`, '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Voir le dossier complet
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetails;