// components/admin/types-demande/TypesDemandeManagement.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const TypesDemandeManagement = () => {
    const [successMessage, setSuccessMessage] = useState({
        show: false,
        message: '',
        type: 'success'
      });
      
      const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        typeId: null
      });
  const [typesDemande, setTypesDemande] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentTypeDemande, setCurrentTypeDemande] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fonction pour charger les types de demande
    const fetchTypesDemande = async () => {
        try {
          setIsLoading(true);
          
          // Récupérer le token du localStorage
          const token = localStorage.getItem('token');
          console.log("Token utilisé pour types-demande:", token);
          
          // APPROCHE 1: Utiliser async/await
          const response = await fetch('/api/types-demande', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Statut de la réponse:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Détails de l'erreur:", errorData);
            throw new Error(`Erreur lors du chargement des types de demande: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Données reçues:", data);
          
          setTypesDemande(data);
        } catch (error) {
          console.error('Erreur complète:', error);
          // Afficher un message d'erreur à l'utilisateur
          alert(`Erreur lors du chargement des types de demande: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
  
    fetchTypesDemande();
  }, []);

   // Ajouter cette fonction manquante
    const handleAddTypeClick = () => {
        setShowAddForm(true);
        setShowEditForm(false);
    };

  const handleEditTypeClick = (typeDemande) => {
    setCurrentTypeDemande(typeDemande);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleViewDocuments = (typeDemande) => {
    router.push(`/admin/types-demande/${typeDemande.id}/documents`);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setCurrentTypeDemande(null);
  };

  const handleAddTypeSubmit = async (formData) => {
    try {
      // Appel API pour ajouter un type de demande
      const response = await fetch('/api/types-demande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du type de demande');
      }

      const newTypeDemande = await response.json();
      setTypesDemande([...typesDemande, newTypeDemande]);
      setShowAddForm(false);
      setSuccessMessage({
        show: true,
        message: 'Nouveau type de demande ajouté avec succès!',
        type: 'success'
      });
      setTimeout(() => setSuccessMessage({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      // Gérer l'erreur
    }
  };

  const handleEditTypeSubmit = async (formData) => {
    try {
      console.log("Tentative de modification du type de demande:", currentTypeDemande.id);
      console.log("Données envoyées:", formData);
      
      const response = await fetch(`/api/types-demande/${currentTypeDemande.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log("Statut de réponse:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur détaillée:", errorText);
        throw new Error(`Erreur lors de la modification: ${response.status}`);
      }
  
      const updatedTypeDemande = await response.json();
      console.log("Type de demande mis à jour:", updatedTypeDemande);
      
      // Mettre à jour l'état avec le type modifié
      setTypesDemande(typesDemande.map(type => 
        type.id === updatedTypeDemande.id ? updatedTypeDemande : type
      ));
      
      // Afficher la notification de succès
      //setUpdateSuccess(true);
      
      // Masquer la notification après 3 secondes
      //setTimeout(() => setUpdateSuccess(false), 3000);
      setSuccessMessage({
        show: true,
        message: 'Type de demande mis à jour avec succès!',
        type: 'success'
      });
      setTimeout(() => setSuccessMessage({ show: false, message: '', type: 'success' }), 3000);
      
      // Fermer le formulaire d'édition
      setShowEditForm(false);
      setCurrentTypeDemande(null);
    } catch (error) {
      console.error("Erreur complète:", error);
      alert(`Erreur lors de la modification du type de demande: ${error.message}`);
    }
  };

  // Remplacer votre handleDeleteType actuel par cette fonction
const handleDeleteClick = (id) => {
    setDeleteConfirmation({
      show: true,
      typeId: id
    });
  };
  
  // Nouvelles fonctions à ajouter
  const confirmDelete = async () => {
    if (deleteConfirmation.typeId) {
      try {
        console.log("Tentative de suppression du type de demande:", deleteConfirmation.typeId);
        
        const response = await fetch(`/api/types-demande/${deleteConfirmation.typeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Statut de réponse:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur détaillée:", errorText);
          throw new Error(`Erreur lors de la suppression: ${response.status}`);
        }
        
        // Mettre à jour l'état pour retirer l'élément supprimé
        setTypesDemande(typesDemande.filter(type => type.id !== deleteConfirmation.typeId));
        
        // Afficher un message de succès
        setSuccessMessage({
          show: true,
          message: 'Type de demande supprimé avec succès!',
          type: 'success'
        });
        
        setTimeout(() => setSuccessMessage({ show: false, message: '', type: 'success' }), 3000);
      } catch (error) {
        console.error("Erreur complète:", error);
        alert(`Erreur lors de la suppression: ${error.message}`);
      }
    }
    setDeleteConfirmation({ show: false, typeId: null });
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, typeId: null });
  };
 

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Types de Demande</h1>
        <button 
          onClick={handleAddTypeClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ajouter un type de demande
        </button>
      </div>
      {successMessage.show && (
  <div className={`border-l-4 p-4 mb-4 ${
    successMessage.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
    successMessage.type === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
    'bg-blue-100 border-blue-500 text-blue-700'
  }`} role="alert">
    <p>{successMessage.message}</p>
  </div>
)}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Chargement...</div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Création
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typesDemande.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {type.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.libelle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {type.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(type.dateCreation).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocuments(type)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Voir les documents requis"
                      >
                        <DocumentsIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditTypeClick(type)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(type.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                        >
                        <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {typesDemande.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun type de demande trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Ajouter ceci juste avant la dernière balise </div> fermante */}
{deleteConfirmation.show && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Confirmation de suppression</h2>
      <p>Êtes-vous sûr de vouloir supprimer ce type de demande?</p>
      <p className="text-sm text-gray-500 mb-4">Cette action est irréversible.</p>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={cancelDelete}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      )}

      {showAddForm && (
        <TypeDemandeForm 
          onSubmit={handleAddTypeSubmit}
          onCancel={handleCloseForm}
        />
      )}

      {showEditForm && currentTypeDemande && (
        <TypeDemandeForm 
          typeDemande={currentTypeDemande}
          onSubmit={handleEditTypeSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un type de demande
function TypeDemandeForm({ typeDemande, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: typeDemande?.type || '',
    libelle: typeDemande?.libelle || '',
    description: typeDemande?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
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
          {typeDemande ? 'Modifier le type de demande' : 'Ajouter un type de demande'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="LICENCE1">LICENCE1</option>
              <option value="MASTER1_SIR">MASTER1_SIR</option>
              <option value="MASTER1_RETEL">MASTER1_RETEL</option>
              <option value="MASTER2_BI">MASTER2_BI</option>
              <option value="BIO_INF">BIO_INF</option>
              <option value="AUTRE">AUTRE</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="libelle">
              Libellé
            </label>
            <input
              id="libelle"
              name="libelle"
              type="text"
              value={formData.libelle}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
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
              {typeDemande ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icônes
const DocumentsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

export default TypesDemandeManagement;