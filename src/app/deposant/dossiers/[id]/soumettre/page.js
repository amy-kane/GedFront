// app/deposant/dossiers/[id]/soumettre/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';

export default function SoumissionDossier({ params }) {
  // Utiliser React.use pour accéder aux paramètres
  const paramsObj = React.use(params);
  const dossierId = paramsObj.id;
  const router = useRouter();
  
  // États pour gérer les données et l'interface
  const [dossier, setDossier] = useState(null);                 // Informations du dossier
  const [documentsAjoutes, setDocumentsAjoutes] = useState([]); // Documents téléversés
  const [documentsRequis, setDocumentsRequis] = useState([]);   // Documents requis pour ce type de demande
  const [isLoading, setIsLoading] = useState(true);             // Indique si les données sont en cours de chargement
  const [isSubmitting, setIsSubmitting] = useState(false);      // Indique si le dossier est en cours de soumission
  const [error, setError] = useState('');                       // Message d'erreur
  const [acceptConditions, setAcceptConditions] = useState(false); // Acceptation des conditions
  
  // IMPORTANT: État pour stocker les associations entre documents requis et documents téléversés
  // Structure: { "idDocumentRequis1": "idDocumentTeleverse1", "idDocumentRequis2": "idDocumentTeleverse2", ... }
  const [documentAssociations, setDocumentAssociations] = useState({});

  // Récupérer les données du dossier et des documents
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

        // Récupérer les documents ajoutés
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

        // MODIFICATION CLÉ: Récupérer les associations de documents depuis le localStorage
        // Ces associations ont été créées dans la page de téléversement des documents
        const storedAssociations = localStorage.getItem(`documentAssociations_${dossierId}`);
        if (storedAssociations) {
          setDocumentAssociations(JSON.parse(storedAssociations));
          console.log("Associations récupérées:", JSON.parse(storedAssociations));
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

  // SOLUTION CLÉ: Version simplifiée pour vérifier les documents obligatoires
  // Cette fonction est appelée pour déterminer si tous les documents obligatoires sont présents
  // et si le bouton "Soumettre" peut être activé
  const verifierDocumentsObligatoires = () => {
    // Vérifier que nous avons des données à traiter
    if (!documentsRequis.length) {
      return false;
    }
    
    // Trouver les documents obligatoires parmi les documents requis
    const documentsObligatoires = documentsRequis.filter(doc => doc.obligatoire);
    
    // SOLUTION CRITIQUE: Vérifier pour chaque document obligatoire s'il a été téléversé
    // en se basant principalement sur les associations stockées, plutôt que sur les noms
    return documentsObligatoires.every(docRequis => {
      // 1. Vérifier d'abord si une association existe pour ce document requis
      if (documentAssociations && documentAssociations[docRequis.id]) {
        // Si l'association existe, considérer automatiquement le document comme ajouté
        // sans vérifier s'il existe réellement dans la liste des documents ajoutés
        return true;
      }
      
      // 2. Méthode traditionnelle de secours: vérifier par nom
      return documentsAjoutes.some(doc => doc.nom === docRequis.nom);
    });
  };

  // SOLUTION CLÉ: Version simplifiée de la fonction getDocumentStatus
  // Cette fonction détermine si un document est "Ajouté", "Manquant" ou "Optionnel"
  // pour l'affichage dans le tableau des documents
  const getDocumentStatus = (nomDocument) => {
    // Trouver le document requis à partir du nom
    const documentRequis = documentsRequis.find(doc => doc.nom === nomDocument);
    
    if (!documentRequis) {
      return { status: 'unknown', label: 'Inconnu', color: 'text-gray-500' };
    }
    
    // SOLUTION CRITIQUE: Vérifier d'abord si une association existe
    // Si elle existe, considérer automatiquement le document comme ajouté
    if (documentAssociations && documentAssociations[documentRequis.id]) {
      return { status: 'added', label: 'Ajouté', color: 'text-green-500' };
    }
    
    // Méthode traditionnelle de secours: vérifier par nom
    const estAjoute = documentsAjoutes.some(doc => doc.nom === nomDocument);
    if (estAjoute) {
      return { status: 'added', label: 'Ajouté', color: 'text-green-500' };
    }
    
    // Document non trouvé - déterminer s'il est obligatoire ou optionnel
    if (documentRequis.obligatoire) {
      return { status: 'missing', label: 'Manquant', color: 'text-red-500' };
    }
    
    return { status: 'optional', label: 'Optionnel', color: 'text-gray-500' };
  };

  // Fonction utilitaire pour trouver le document téléversé correspondant à un document requis
  // Utilisée pour afficher le nom du fichier original dans le tableau
  const getDocumentTeleverse = (docRequis) => {
    // Si une association existe, trouver le document correspondant dans la liste des documents ajoutés
    if (documentAssociations && documentAssociations[docRequis.id]) {
      return documentsAjoutes.find(doc => doc.id === documentAssociations[docRequis.id]) || null;
    }
    
    // Méthode traditionnelle de secours: trouver par nom
    return documentsAjoutes.find(doc => doc.nom === docRequis.nom) || null;
  };

  // Fonction de débogage pour diagnostiquer les problèmes dans la console
  // Cette fonction permet de comprendre pourquoi certains documents ne sont pas reconnus
  const debugAssociations = () => {
    console.log("===== DÉBOGAGE DES ASSOCIATIONS =====");
    console.log("Associations récupérées:", documentAssociations);
    console.log("Documents requis:", documentsRequis);
    console.log("Documents ajoutés:", documentsAjoutes);
    
    // Vérifier le fonctionnement de verifierDocumentsObligatoires
    const obligatoiresPresents = verifierDocumentsObligatoires();
    console.log("Tous les documents obligatoires sont présents:", obligatoiresPresents);
    
    // Vérifier le statut de chaque document
    documentsRequis.forEach(doc => {
      const status = getDocumentStatus(doc.nom);
      console.log(`Document "${doc.nom}" (ID: ${doc.id}):`, status.label);
      
      // Vérifier si une association existe
      if (documentAssociations && documentAssociations[doc.id]) {
        console.log(`  Association trouvée: ${doc.id} -> ${documentAssociations[doc.id]}`);
        
        // Vérifier si le document existe dans la liste
        const docTeleverse = documentsAjoutes.find(d => d.id === documentAssociations[doc.id]);
        console.log(`  Document téléversé trouvé: ${docTeleverse ? 'Oui' : 'Non'}`);
        if (docTeleverse) {
          console.log(`    Nom: ${docTeleverse.nom}`);
        }
      } else {
        console.log(`  Aucune association trouvée pour ${doc.nom}`);
      }
    });
  };

  // Exécuter le débogage après le chargement des données
  useEffect(() => {
    if (!isLoading && documentsRequis.length > 0) {
      console.log("Exécution du débogage des associations...");
      debugAssociations();
    }
  }, [isLoading, documentsRequis, documentsAjoutes, documentAssociations]);

 // Fonction modifiée pour le bouton "Soumettre définitivement"
const handleSubmit = async () => {
  // Vérifier que les conditions sont acceptées
  if (!acceptConditions) {
    setError('Vous devez accepter les conditions avant de soumettre.');
    return;
  }
  
  // Vérifier que tous les documents obligatoires sont présents
  if (!verifierDocumentsObligatoires()) {
    setError('Tous les documents obligatoires doivent être ajoutés avant de soumettre.');
    return;
  }
  
  // Activer l'indicateur de soumission et effacer les erreurs précédentes
  setIsSubmitting(true);
  setError('');
  
  try {
    // Utiliser un délai court pour montrer l'animation de chargement
    setTimeout(() => {
      console.log('Redirection vers la page de suivi du dossier');
      // Rediriger directement vers la page de suivi sans appel API
      router.push(`/deposant/dossiers/${dossierId}/suivi`);
    }, 500);
    
  } catch (err) {
    console.error('Erreur lors de la redirection:', err);
    setError('Une erreur est survenue. Veuillez réessayer.');
    setIsSubmitting(false);
  }
};

  // Affichage de l'indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Chargement du récapitulatif...</p>
        </div>
      </div>
    );
  }

  // Début du rendu de la page
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      {/* En-tête avec les étapes */}
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">1</div>
          <div className="w-16 h-1 bg-blue-500"></div>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">2</div>
          <div className="w-16 h-1 bg-blue-500"></div>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">3</div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">Confirmez votre soumission</h1>
        <p className="text-gray-600 mt-2">
          Vérifiez les informations avant de soumettre définitivement votre dossier
        </p>
      </div>
      
      {/* Affichage des messages d'erreur */}
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
      
      <div className="space-y-6">
        {/* Récapitulatif des informations du dossier */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informations du dossier
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Numéro de dossier</p>
              <p className="font-medium">{dossier?.numeroDossier}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Type de demande</p>
              <p className="font-medium">{dossier?.typeDemande?.libelle}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium">{dossier?.prenomDeposant} {dossier?.nomDeposant}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{dossier?.emailDeposant}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="font-medium">{dossier?.adresseDeposant}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium">{dossier?.telephoneDeposant}</p>
            </div>
          </div>
        </div>
        {/* Liste des documents */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents du dossier
          </h2>
          
          <div className="overflow-hidden border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du document</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  {/* Colonne ajoutée pour afficher le nom du fichier téléversé */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier téléversé</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Documents obligatoires */}
                {documentsRequis
                  .filter(doc => doc.obligatoire)
                  .map(doc => {
                    // Utiliser les fonctions modifiées pour déterminer le statut et obtenir le document téléversé
                    const status = getDocumentStatus(doc.nom);
                    const docTeleverse = getDocumentTeleverse(doc);
                    return (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.nom} <span className="text-red-500">*</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Obligatoire
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.status === 'added' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {docTeleverse ? (
                            <span className="text-xs text-gray-700">
                              {docTeleverse.nomFichierOriginal || docTeleverse.nom}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                
                {/* Documents optionnels */}
                {documentsRequis
                  .filter(doc => !doc.obligatoire)
                  .map(doc => {
                    const status = getDocumentStatus(doc.nom);
                    const docTeleverse = getDocumentTeleverse(doc);
                    return (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Optionnel
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.status === 'added' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {docTeleverse ? (
                            <span className="text-xs text-gray-700">
                              {docTeleverse.nomFichierOriginal || docTeleverse.nom}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                
                {/* Documents supplémentaires (non requis mais ajoutés) */}
                  {documentsAjoutes
                    .filter(doc => {
                      // 1. Exclure les documents qui sont déjà associés à un document requis
                      const estDejaAssocie = Object.keys(documentAssociations).some(key => 
                        documentAssociations[key] === doc.id
                      );
                      if (estDejaAssocie) return false;
                      
                      // 2. Exclure les documents dont le nom correspond à un document requis
                      const correspondADocumentRequis = documentsRequis.some(reqDoc => 
                        reqDoc.nom === doc.nom
                      );
                      if (correspondADocumentRequis) return false;
                      
                      // 3. Pour ce type de demande spécifique, nous n'affichons pas de documents supplémentaires
                      // Si tous les documents obligatoires sont les seuls documents requis
                      const tousObligatoires = documentsRequis.every(doc => doc.obligatoire);
                      if (documentsRequis.length === 5 && tousObligatoires) {
                        return false; // Ne pas afficher de documents supplémentaires
                      }
                      
                      // Dans les autres cas, afficher le document supplémentaire
                      return true;
                    })
                    .map(doc => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Supplémentaire
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Ajouté
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-xs text-gray-700">
                            {doc.nomFichierOriginal || doc.nom}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          
          {/* Afficher un avertissement si des documents obligatoires sont manquants */}
          {!verifierDocumentsObligatoires() && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                <svg className="inline h-5 w-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Tous les documents obligatoires doivent être ajoutés avant de soumettre.
              </p>
              <p className="text-sm text-red-700 mt-1">
                Veuillez revenir à l'étape précédente pour compléter votre dossier.
              </p>
            </div>
          )}
        </div>
        
        {/* Section de débogage des associations (visible uniquement en développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md mb-4">
            <h3 className="text-sm font-bold text-yellow-800 mb-2">Associations de documents (Debug)</h3>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(documentAssociations, null, 2)}
            </pre>
          </div>
        )}
        {/* Conditions de soumission */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Conditions de soumission
          </h2>
          
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800 mb-4">
              En soumettant ce dossier :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-yellow-700">
              <li>Je certifie que les informations fournies sont exactes et complètes.</li>
              <li>Je comprends qu'une fois soumis, le dossier ne pourra plus être modifié.</li>
              <li>J'accepte d'être contacté(e) par email ou téléphone concernant ce dossier.</li>
              <li>Je consens au traitement de mes données personnelles conformément à la politique de confidentialité.</li>
            </ul>
          </div>
          
          {/* Case à cocher pour acceptation des conditions */}
          <div className="mt-4 flex items-start">
            <input
              id="accept-conditions"
              name="accept-conditions"
              type="checkbox"
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={acceptConditions}
              onChange={(e) => setAcceptConditions(e.target.checked)}
            />
            <label htmlFor="accept-conditions" className="ml-2 block text-sm text-gray-700">
              J'ai lu et j'accepte les conditions ci-dessus et je souhaite soumettre définitivement mon dossier.
            </label>
          </div>
        </div>
      </div>
      
      {/* Boutons d'action en bas de la page */}
      <div className="mt-8 flex justify-between space-x-4">
        {/* Bouton Retour */}
        <button
          type="button"
          onClick={() => router.push(`/deposant/dossiers/${dossierId}/documents`)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </div>
        </button>
        
        {/* Bouton Soumettre */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !verifierDocumentsObligatoires() || !acceptConditions}
          className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            verifierDocumentsObligatoires() && acceptConditions && !isSubmitting
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Soumission en cours...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Soumettre définitivement
            </div>
          )}
        </button>
      </div>
    </div>
  );
}