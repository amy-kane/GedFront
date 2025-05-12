// app/admin/types-demande/[typeDemandeId]/documents/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function DocumentsRequisPage({ params }) {
  // Utiliser React.use() pour "unwrap" les params comme indiqué dans l'erreur
  const unwrappedParams = use(params);
  const typeDemandeId = unwrappedParams.typeDemandeId;
  
  console.log("Params complet:", unwrappedParams);
  console.log("typeDemandeId:", typeDemandeId);
  
  const router = useRouter();
  const [typeDemande, setTypeDemande] = useState(null);
  const [documentsRequis, setDocumentsRequis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fonction pour charger les données du type de demande et ses documents requis
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Vérifier si le paramètre existe avant de faire les appels API
        if (!typeDemandeId) {
          throw new Error("ID du type de demande non disponible");
        }
        
        // Récupérer le token du localStorage
        const token = localStorage.getItem('token');
        console.log("Token utilisé:", token?.substring(0, 15) + "...");
        
        // Charger les informations du type de demande
        console.log(`Chargement du type de demande: ${typeDemandeId}`);
        const typeResponse = await fetch(`/api/types-demande/${typeDemandeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Statut réponse type:", typeResponse.status);
        
        if (!typeResponse.ok) {
          const errorText = await typeResponse.text();
          console.error("Erreur détaillée:", errorText);
          
          // Si erreur d'authentification, rediriger vers la page de connexion
          if (typeResponse.status === 401 || typeResponse.status === 403) {
            router.push('/login');
            return;
          }
          
          throw new Error('Erreur lors du chargement du type de demande');
        }
        
        const typeData = await typeResponse.json();
        console.log("Type de demande chargé:", typeData);
        setTypeDemande(typeData);
        
        // Charger les documents requis associés
        const docsResponse = await fetch(`/api/types-demande/${typeDemandeId}/documents-requis`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Statut réponse documents:", docsResponse.status);
        
        if (!docsResponse.ok) {
          const errorText = await docsResponse.text();
          console.error("Erreur détaillée documents:", errorText);
          throw new Error('Erreur lors du chargement des documents requis');
        }
        
        const docsData = await docsResponse.json();
        console.log("Documents requis chargés:", docsData);
        setDocumentsRequis(docsData);
      } catch (error) {
        console.error('Erreur complète:', error);
        setError(error.message || 'Une erreur est survenue');
        alert(`Erreur: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeDemandeId) {
      fetchData();
    } else {
      console.error("ID du type de demande non disponible");
      setError("ID du type de demande non disponible");
      setIsLoading(false);
    }
  }, [typeDemandeId, router]); // Mettre à jour la dépendance pour utiliser typeDemandeId

  const handleAddDocumentClick = () => {
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditDocumentClick = (document) => {
    setCurrentDocument(document);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setCurrentDocument(null);
  };

  const handleAddDocumentSubmit = async (formData) => {
    try {
      // Associer le type de demande au document
      // Utiliser typeDemandeId au lieu de id
      const documentData = {
        ...formData,
        typeDemande: { id: typeDemandeId }
      };
      
      // Appel API pour ajouter un document requis
      // Utiliser typeDemandeId au lieu de id
      const response = await fetch(`/api/types-demande/${typeDemandeId}/documents-requis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du document requis');
      }

      const newDocument = await response.json();
      setDocumentsRequis([...documentsRequis, newDocument]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`); // Ajouter un message d'erreur à l'utilisateur
    }
  };

  const handleEditDocumentSubmit = async (formData) => {
    try {
      // Appel API pour modifier un document requis
      const response = await fetch(`/api/documents-requis/${currentDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du document requis');
      }

      const updatedDocument = await response.json();
      setDocumentsRequis(documentsRequis.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      ));
      setShowEditForm(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`); // Ajouter un message d'erreur à l'utilisateur
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document requis?')) {
      return;
    }
    
    try {
      // Appel API pour supprimer un document requis
      const response = await fetch(`/api/documents-requis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du document requis');
      }

      setDocumentsRequis(documentsRequis.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`); // Ajouter un message d'erreur à l'utilisateur
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
   // <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={goBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Retour aux types de demande
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Chargement...</div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Documents requis pour : {typeDemande?.libelle}
                </h1>
                <p className="text-gray-600 mt-1">{typeDemande?.description}</p>
              </div>
              <button 
                onClick={handleAddDocumentClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ajouter un document requis
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obligatoire
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documentsRequis.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {document.nom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {document.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          document.obligatoire 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {document.obligatoire ? 'Obligatoire' : 'Optionnel'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDocumentClick(document)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {documentsRequis.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun document requis trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showAddForm && (
          <DocumentRequisForm 
            onSubmit={handleAddDocumentSubmit}
            onCancel={handleCloseForm}
          />
        )}

        {showEditForm && currentDocument && (
          <DocumentRequisForm 
            document={currentDocument}
            onSubmit={handleEditDocumentSubmit}
            onCancel={handleCloseForm}
          />
        )}
      </div>
    //</AdminLayout>
  );
}

// Composant de formulaire pour ajouter/modifier un document requis
function DocumentRequisForm({ document, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nom: document?.nom || '',
    description: document?.description || '',
    obligatoire: document?.obligatoire || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {document ? 'Modifier le document requis' : 'Ajouter un document requis'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
              Nom du document
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="obligatoire"
                checked={formData.obligatoire}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Document obligatoire</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {document ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icônes
const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);