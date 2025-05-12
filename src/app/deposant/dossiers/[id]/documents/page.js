// app/deposant/dossiers/[id]/documents/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import axios from 'axios';

export default function AjoutDocuments({ params }) {
  // Utiliser React.use pour accéder aux paramètres
  const paramsObj = React.use(params);
  const dossierId = paramsObj.id;
  const router = useRouter();
  
  // États pour gérer les données et l'interface
  const [documentsRequis, setDocumentsRequis] = useState([]);
  const [documentsAjoutes, setDocumentsAjoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dossier, setDossier] = useState(null);
  const [tousDocumentsObligatoiresPresents, setTousDocumentsObligatoiresPresents] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  // Nouvel état pour stocker les associations entre documents requis et documents téléversés
  const [documentAssociations, setDocumentAssociations] = useState({});

  // Récupérer les données du dossier et des documents requis
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Récupérer les informations du dossier
        const dossierResponse = await axios.get(`/api/dossiers/${dossierId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDossier(dossierResponse.data);

        // Récupérer les documents déjà ajoutés
        const documentsResponse = await axios.get(`/api/documents/dossier/${dossierId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocumentsAjoutes(documentsResponse.data);

        // Récupérer la liste des documents requis pour ce type de demande
        const typeDemandeId = dossierResponse.data.typeDemande.id;
        const documentsRequisResponse = await axios.get(`/api/types-demande/${typeDemandeId}/documents-requis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocumentsRequis(documentsRequisResponse.data);

        // Récupérer ou initialiser les associations de documents depuis localStorage
        const storedAssociations = localStorage.getItem(`documentAssociations_${dossierId}`);
        if (storedAssociations) {
          setDocumentAssociations(JSON.parse(storedAssociations));
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les informations du dossier. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dossierId, router]);

  // Vérifier si tous les documents obligatoires sont présents
  useEffect(() => {
    if (documentsRequis.length > 0 && documentsAjoutes.length > 0) {
      const documentsObligatoires = documentsRequis.filter(doc => doc.obligatoire);
      
      // Vérifier si tous les documents obligatoires sont téléversés
      const tousPresents = documentsObligatoires.every(docRequis => 
        isDocumentAdded(docRequis.nom)
      );
      
      setTousDocumentsObligatoiresPresents(tousPresents);
    }
  }, [documentsRequis, documentsAjoutes, documentAssociations]);

  // Vérifier si un document est déjà ajouté en utilisant les associations
  const isDocumentAdded = (nomDocumentRequis) => {
    // Si aucun document n'a été ajouté, retourner false immédiatement
    if (!documentsAjoutes || documentsAjoutes.length === 0) return false;
    
    // Trouver l'ID du document requis à partir du nom
    const documentRequis = documentsRequis.find(doc => doc.nom === nomDocumentRequis);
    if (!documentRequis) return false;
    
    const documentRequisId = documentRequis.id;
    
    // Vérifier s'il existe une association pour ce document requis
    if (documentAssociations[documentRequisId]) {
      // Vérifier si le document associé existe dans la liste des documents ajoutés
      return documentsAjoutes.some(doc => doc.id === documentAssociations[documentRequisId]);
    }
    
    // Si pas d'association trouvée, essayer la méthode par nom (pour compatibilité arrière)
    return documentsAjoutes.some(doc => doc.nom === nomDocumentRequis);
  };

  // Fonction pour afficher la prévisualisation d'un document
  const showDocumentPreview = async (nomDocument) => {
    try {
      const token = localStorage.getItem('token');
      
      // Trouver le document requis à partir du nom
      const documentRequis = documentsRequis.find(doc => doc.nom === nomDocument);
      
      if (!documentRequis) {
        setError('Document requis non trouvé.');
        return;
      }
      
      // Trouver l'ID du document téléversé associé à ce document requis
      const documentId = documentAssociations[documentRequis.id];
      let document;
      
      if (documentId) {
        // Trouver le document par son ID
        document = documentsAjoutes.find(doc => doc.id === documentId);
      } else {
        // Méthode de secours: rechercher par nom
        document = documentsAjoutes.find(doc => doc.nom === nomDocument);
      }
      
      if (!document || !document.id) {
        setError('Impossible de trouver le document.');
        return;
      }
      
      // Récupérer le document depuis l'API
      const response = await axios.get(`/api/documents/${document.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Créer une URL pour le blob
      const fileURL = URL.createObjectURL(response.data);
      
      // Définir le document à prévisualiser
      setPreviewDocument({
        name: nomDocument,
        url: fileURL,
        type: response.headers['content-type']
      });
      
      // Afficher la prévisualisation
      setPreviewVisible(true);
    } catch (err) {
      console.error('Erreur lors de la récupération du document:', err);
      setError(`Impossible de charger le document. ${err.response?.data?.message || 'Erreur serveur'}`);
    }
  };
  
  // Fonction pour fermer la prévisualisation
  const closePreview = () => {
    if (previewDocument && previewDocument.url) {
      URL.revokeObjectURL(previewDocument.url); // Libérer la mémoire
    }
    setPreviewDocument(null);
    setPreviewVisible(false);
  };

  // Gérer le téléversement d'un fichier
  const handleFileUpload = async (documentRequisId, file) => {
    if (!file) return;
    
    setUploadingFile(documentRequisId);
    setUploadProgress(prev => ({ ...prev, [documentRequisId]: 0 }));
    
    const documentRequis = documentsRequis.find(doc => doc.id === documentRequisId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dossierId', dossierId);
    
    try {
      const token = localStorage.getItem('token');
      
      // Utiliser l'API pour téléverser le document
      const response = await axios.post('/api/documents', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [documentRequisId]: percentCompleted }));
        }
      });
      
      // Ajouter le document téléversé à la liste
      setDocumentsAjoutes(prev => [...prev, response.data]);
      
      // Créer une association entre le document requis et le document téléversé
      setDocumentAssociations(prev => {
        const newAssociations = {
          ...prev,
          [documentRequisId]: response.data.id
        };
        
        // Stocker les associations dans localStorage pour les conserver
        localStorage.setItem(`documentAssociations_${dossierId}`, JSON.stringify(newAssociations));
        
        return newAssociations;
      });

      // Récupérer le nom du document pour l'affichage
      const documentName = documentRequis ? documentRequis.nom : 'Document';
      
      // Réinitialiser les états de téléversement
      setTimeout(() => {
        setUploadingFile(null);
        setUploadProgress(prev => ({ ...prev, [documentRequisId]: 100 }));
        
        // Afficher un message de confirmation détaillé
        setSuccessMessage(
          `✅ Le document "${documentName}" a été téléversé avec succès ! Vous pouvez maintenant le visualiser en cliquant sur "Voir".`
        );
        
        // Faire disparaître le message après 5 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }, 500);
      
    } catch (err) {
      console.error('Erreur lors du téléversement:', err);
      setError(`Erreur lors du téléversement de ${file.name}. ${err.response?.data?.message || ''}`);
      setUploadingFile(null);
    }
  };

  // Soumettre le dossier
  const handleSubmit = async () => {
    if (!tousDocumentsObligatoiresPresents) {
      setError('Tous les documents obligatoires doivent être ajoutés avant de soumettre le dossier.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        router.push('/login');
        return;
      }
      
      // Mettre à jour le statut du dossier
      try {
        console.log(`Mise à jour du statut du dossier ${dossierId} pour soumission...`);
        
        const response = await axios.put(
          `/api/dossiers/${dossierId}/statut`,
          { statut: 'SOUMIS' },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`Statut du dossier mis à jour avec succès:`, response.data);
        
        // Afficher un message de succès
        setSuccessMessage('Dossier soumis avec succès ! Redirection en cours...');
        
        // Rediriger vers la page suivante après un court délai
        setTimeout(() => {
          router.push(`/deposant/dossiers/${dossierId}/soumettre`);
        }, 1500);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        
        setSuccessMessage('Documents téléversés avec succès. Redirection en cours...');
        
        setTimeout(() => {
          router.push(`/deposant/dossiers/${dossierId}/soumettre`);
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission du dossier:', err);
      setError('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Chargement des informations du dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">1</div>
          <div className="w-16 h-1 bg-blue-500"></div>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">2</div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">3</div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">Ajouter les documents requis</h1>
        <p className="text-gray-600 mt-2">
          Pour le dossier {dossier?.numeroDossier} - {dossier?.typeDemande?.libelle}
        </p>
      </div>
      
      {/* Affichage des informations de débogage */}
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
        <p><strong>Debug:</strong> ID du dossier: {dossierId}, Chargement: {isLoading ? 'Oui' : 'Non'}</p>
        <p>Documents requis: {documentsRequis.length}, Documents ajoutés: {documentsAjoutes.length}</p>
        <p>Associations: {JSON.stringify(documentAssociations)}</p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border-l-4 border-red-500">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 bg-green-50 p-4 rounded-md border-l-4 border-green-500 transition-opacity duration-500">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mb-6 bg-blue-50 p-4 rounded-md">
        <div className="flex items-start">
          <svg className="h-6 w-6 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Veuillez ajouter tous les documents requis pour votre demande.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Les documents marqués d'un astérisque (*) sont obligatoires.
              Formats acceptés : PDF, JPEG, PNG, DOC, DOCX (max. 10 MB).
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {/* Documents obligatoires */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Documents obligatoires
          </h2>
          
          <div className="space-y-4">
            {/* Code pour les documents obligatoires téléversés vs non téléversés */}
            {documentsRequis
              .filter(doc => doc.obligatoire)
              .map(doc => {
                const isUploaded = isDocumentAdded(doc.nom);
                return (
                  <div key={doc.id} 
                    className={`border-2 rounded-lg overflow-hidden ${isUploaded ? 'border-green-500 shadow-md' : 'border-gray-200'}`}
                  >
                    {/* Indicateur visuel en haut du document */}
                    {isUploaded && (
                      <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                        Document téléversé avec succès
                      </div>
                    )}
                    <div className={`flex items-start justify-between p-4 ${isUploaded ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {doc.nom} <span className="text-red-500">*</span>
                          </h3>
                          
                          {isUploaded && (
                            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-green-600 text-white">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              TÉLÉVERSÉ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                      
                      <div>
                        {isUploaded ?(
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-md flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Document téléversé
                          </div>
                        ) : (
                          <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center">
                            {uploadingFile === doc.id ? (
                              <>
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {uploadProgress[doc.id]}%
                              </>
                            ) : (
                              <>
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Téléverser
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                              disabled={uploadingFile !== null}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {uploadProgress[doc.id] && uploadProgress[doc.id] < 100 && (
                      <div className="bg-gray-100 h-2">
                        <div 
                          className="bg-blue-500 h-2" 
                          style={{ width: `${uploadProgress[doc.id]}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}

            {documentsRequis.filter(doc => doc.obligatoire).length === 0 && (
              <p className="text-gray-500 italic">Aucun document obligatoire requis.</p>
            )}
          </div>
        </div>
        
        {/* Documents optionnels */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents optionnels
          </h2>
          
          <div className="space-y-4">
            {documentsRequis
              .filter(doc => !doc.obligatoire)
              .map(doc => {
                // Détermine si le document a été téléversé
                const isUploaded = isDocumentAdded(doc.nom);
                
                return (
                  <div 
                    key={doc.id} 
                    className={`border rounded-lg overflow-hidden ${isUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div className={`flex items-start justify-between p-4 ${isUploaded ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          {doc.nom}
                          {isUploaded && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Téléversé
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                      
                      <div>
                        {isUploaded ? (
                          <div className="flex items-center">
                            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-md">
                              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-medium">Document téléversé</span>
                            </div>
                            <button 
                              className="ml-3 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center"
                              onClick={() => showDocumentPreview(doc.nom)}
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Voir
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 inline-flex items-center">
                            {uploadingFile === doc.id ? (
                              <>
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {uploadProgress[doc.id]}%
                              </>
                            ) : (
                              <>
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Téléverser
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                              disabled={uploadingFile !== null}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {uploadProgress[doc.id] && uploadProgress[doc.id] < 100 && (
                      <div className="bg-gray-100 h-2">
                        <div 
                          className="bg-blue-500 h-2" 
                          style={{ width: `${uploadProgress[doc.id]}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}

            {documentsRequis.filter(doc => !doc.obligatoire).length === 0 && (
              <p className="text-gray-500 italic">Aucun document optionnel disponible.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between space-x-4">
        <button
          type="button"
          onClick={() => router.push('/deposant/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Enregistrer et revenir plus tard
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!tousDocumentsObligatoiresPresents || uploadingFile !== null}
          className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            tousDocumentsObligatoiresPresents && uploadingFile === null
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            Continuer vers la soumission
          </div>
        </button>
      </div>
      
      {/* Modal de prévisualisation */}
      {previewVisible && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-4/5 max-w-4xl mx-auto max-h-[90vh] flex flex-col">
            {/* En-tête du modal */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewDocument.name}
              </h3>
              <button 
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Corps du modal avec prévisualisation */}
            <div className="p-4 flex-1 overflow-auto">
              {previewDocument.type.includes('image/') ? (
                <img 
                  src={previewDocument.url} 
                  alt={previewDocument.name}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : previewDocument.type.includes('pdf') ? (
                <iframe 
                  src={previewDocument.url} 
                  title={previewDocument.name}
                  className="w-full h-[70vh]"
                />
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-700">Ce type de document ne peut pas être prévisualisé directement.</p>
                  <a 
                    href={previewDocument.url} 
                    download={previewDocument.name}
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Télécharger le document
                  </a>
                </div>
              )}
            </div>
            
            {/* Pied du modal */}
            <div className="p-4 border-t flex justify-end">
              <a 
                href={previewDocument.url} 
                download={previewDocument.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
              >
                Télécharger
              </a>
              <button 
                onClick={closePreview}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}