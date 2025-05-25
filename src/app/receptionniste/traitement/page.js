// app/receptionniste/traitement/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TraitementPage() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsRequis, setDocumentsRequis] = useState([]);
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dossiers', {
        params: { statut: 'SOUMIS' }
      });
      
      const dossiersData = response.data.content || response.data;
      setDossiers(dossiersData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      setLoading(false);
    }
  };

  const selectDossier = async (dossierId) => {
    try {
      // Récupérer les détails du dossier
      const dossierDetail = dossiers.find(d => d.id === dossierId);
      setSelectedDossier(dossierDetail);
      
      // Récupérer les documents du dossier
      const docsResponse = await axios.get(`/api/documents/dossier/${dossierId}`);
      setDocuments(docsResponse.data);
      
      // Récupérer les documents requis pour ce type de demande
      const typeDemandeId = dossierDetail.typeDemande.id;
      const requisResponse = await axios.get(`/api/types-demande/${typeDemandeId}/documents-requis`);
      setDocumentsRequis(requisResponse.data);
      
      // Réinitialiser les notes
      setNotes('');
    } catch (error) {
      console.error("Erreur lors de la sélection du dossier:", error);
    }
  };

    const previsualiserDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      
      const response = await axios.get(`/api/documents/${documentId}/preview`, {
        responseType: 'blob',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Vérifier si la réponse est valide
      if (response.status !== 200) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Forcer le type MIME correct
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(fileBlob);
      
      // Ouvrir dans une nouvelle fenêtre
      window.open(url, '_blank');
    } catch (error) {
      console.error("Erreur lors de la prévisualisation du document:", error);
      
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions nécessaires pour prévisualiser ce document.");
      } else {
        alert("Erreur lors de la prévisualisation du document: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Modifiez la fonction marquerComplet dans page.js
  const marquerComplet = async () => {
    try {
      const token = localStorage.getItem('token');
      // Modification : utiliser les paramètres de requête pour le statut
      await axios.put(
        `/api/dossiers/${selectedDossier.id}/statut?statut=COMPLET`,
        {},  // corps vide
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      // Ajouter un commentaire si des notes ont été saisies
      if (notes.trim()) {
        await axios.post(`/api/dossiers/${selectedDossier.id}/commentaires`, {
          contenu: notes
        });
      }
      
      // Afficher le message de succès
      setSuccessMessage(`Le dossier ${selectedDossier.numeroDossier} a été marqué comme COMPLET avec succès !`);
      setErrorMessage('');
      
      // Rafraîchir la liste
      fetchDossiers();
      setSelectedDossier(null);
      
      // Masquer le message après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      setErrorMessage("Erreur lors du changement de statut: " + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    }
  };

  // Modifiez la fonction marquerIncomplet dans page.js
  const marquerIncomplet = async () => {
    try {
      const token = localStorage.getItem('token');
      // Modification : utiliser les paramètres de requête pour le statut
      await axios.put(
        `/api/dossiers/${selectedDossier.id}/statut?statut=INCOMPLET`,
        {},  // corps vide
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      // Ajouter un commentaire avec les notes si elles existent
      if (notes.trim()) {
        await axios.post(`/api/dossiers/${selectedDossier.id}/commentaires`, {
          contenu: notes
        });
      }
      
      // Afficher le message de succès
      setSuccessMessage(`Le dossier ${selectedDossier.numeroDossier} a été marqué comme INCOMPLET avec succès !`);
      setErrorMessage('');
      
      // Rafraîchir la liste
      fetchDossiers();
      setSelectedDossier(null);
      
      // Masquer le message après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      setErrorMessage("Erreur lors du changement de statut: " + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    }
  };

  // Vérifier si un document requis est présent dans le dossier
  const isDocumentPresent = (nomDocumentRequis) => {
    return documents.some(doc => doc.document.nom === nomDocumentRequis);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Traitement des dossiers</h1>
      
      {/* Messages de succès et d'erreur */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  onClick={() => setSuccessMessage('')}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  onClick={() => setErrorMessage('')}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des dossiers */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Dossiers à traiter</h2>
          </div>
          
          {loading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : dossiers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Aucun dossier à traiter</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {dossiers.map(dossier => (
                <li 
                  key={dossier.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedDossier?.id === dossier.id ? 'bg-blue-50' : ''}`}
                  onClick={() => selectDossier(dossier.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{dossier.numeroDossier}</p>
                      <p className="text-sm text-gray-500">{dossier.nomDeposant} {dossier.prenomDeposant}</p>
                    </div>
                    <span className="text-blue-600 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100">
                      SOUMIS
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Détails du dossier */}
        <div className="md:col-span-2">
          {selectedDossier ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Dossier {selectedDossier.numeroDossier}</h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Déposant</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDossier.nomDeposant} {selectedDossier.prenomDeposant}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Type de demande</p>
                    <p className="text-lg font-bold text-gray-900">{selectedDossier.typeDemande?.libelle || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Date de dépôt</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedDossier.dateCreation).toLocaleDateString('fr-FR')} à {new Date(selectedDossier.dateCreation).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-bold text-blue-600 break-all">{selectedDossier.emailDeposant || "N/A"}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Documents requis</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {documentsRequis.length === 0 ? (
                      <p className="text-gray-500">Aucun document requis défini pour ce type de demande</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {documentsRequis.map(docRequis => (
                          <li key={docRequis.id} className="py-2 flex items-center justify-between">
                            <div className="flex items-center">
                              {isDocumentPresent(docRequis.nom) ? (
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              <span className={docRequis.obligatoire ? "font-medium" : ""}>
                                {docRequis.nom} {docRequis.obligatoire && <span className="text-red-500">*</span>}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {docRequis.obligatoire ? "Obligatoire" : "Optionnel"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Documents soumis</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {documents.length === 0 ? (
                      <p className="text-gray-500">Aucun document dans ce dossier</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {documents.map(doc => (
                          <li key={doc.document.id} className="py-2 flex justify-between items-center">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>{doc.document.nom}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800 p-1"
                                onClick={() => previsualiserDocument(doc.document.id)}
                                title="Prévisualiser"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                className="text-gray-600 hover:text-gray-800 p-1"
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  window.open(`/api/documents/${doc.document.id}/download?token=${token}`, '_blank');
                                }}
                                title="Télécharger"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Notes et observations</h3>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Ajoutez vos notes ici (obligatoire pour marquer un dossier comme incomplet)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
                 */}
                <div className="flex justify-end space-x-3">
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedDossier(null)}
                  >
                    Annuler
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={marquerIncomplet}
                  >
                    Marquer comme incomplet
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={marquerComplet}
                  >
                    Marquer comme complet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez un dossier</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur un dossier dans la liste pour voir ses détails et le traiter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}