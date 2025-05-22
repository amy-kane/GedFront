// app/deposant/creer-deposant/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CreerDossier() {
  const router = useRouter();
  
  // États pour gérer le formulaire et les données
  const [formData, setFormData] = useState({
    nomDeposant: '',
    prenomDeposant: '',
    adresseDeposant: '',
    telephoneDeposant: '',
    emailDeposant: '',
    sexeDeposant: '',      // ✅ Ajouté
    ageDeposant: '',       // ✅ Ajouté
    typeDemandeId: ''
  });
  
  const [typesDemandeList, setTypesDemandeList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Fonction de diagnostic du token JWT
  const analyzeJwtToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token manquant dans localStorage");
      return;
    }
    
    try {
      let cleanToken = token;
      if (token.startsWith('Bearer ')) {
        cleanToken = token.substring(7);
      }
      
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        console.error("Format de token invalide");
        return;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      console.log("Analyse du token JWT:");
      console.log("- Subject:", payload.sub);
      console.log("- Rôles/Autorités:", payload.authorities || payload.roles || payload.scope || "Non trouvé");
      console.log("- Date d'expiration:", new Date(payload.exp * 1000).toLocaleString());
      console.log("- Token expiré?", payload.exp * 1000 < Date.now() ? "OUI" : "NON");
      console.log("- Émetteur:", payload.iss);
      console.log("- Payload complet:", payload);
      
      return payload;
    } catch (error) {
      console.error("Erreur lors de l'analyse du token:", error);
      return null;
    }
  };

  // Récupérer les informations de l'utilisateur au chargement
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      console.log("Informations utilisateur:", userData);
      console.log("Rôle de l'utilisateur:", userData.role);
      
      const tokenInfo = analyzeJwtToken();
      console.log("Information du token JWT:", tokenInfo);
      
      // ✅ Pré-remplir TOUS les champs avec les infos de l'utilisateur
      setFormData(prev => ({
        ...prev,
        nomDeposant: userData.nom || '',
        prenomDeposant: userData.prenom || '',
        emailDeposant: userData.email || '',
        sexeDeposant: userData.sexe || '',           // ✅ Récupéré du profil
        ageDeposant: userData.age ? userData.age.toString() : ''  // ✅ Récupéré du profil
      }));
    } else {
      router.push('/login');
    }
  }, [router]);
  
  // Charger les types de demande disponibles
  useEffect(() => {
    const fetchTypesDemandeList = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/types-demande', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setTypesDemandeList(response.data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des types de demande:', err);
        setError('Impossible de charger les types de demande. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTypesDemandeList();
  }, []);
  
  // Gérer les changements de champs dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    // Validation basique des champs obligatoires
    if (!formData.adresseDeposant || !formData.telephoneDeposant || !formData.typeDemandeId) {
      setError('Veuillez remplir tous les champs obligatoires');
      setSubmitting(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log("Token utilisé:", token.substring(0, 20) + "...");
      
      const dataToSend = {
        typeDemandeId: formData.typeDemandeId,
        adresseDeposant: formData.adresseDeposant,
        telephoneDeposant: formData.telephoneDeposant
      };
      
      console.log("Données à envoyer:", dataToSend);
      
      const response = await axios.post('/api/dossiers', dataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Réponse reçue:", response.status, response.data);
      
      router.push(`/deposant/dossiers/${response.data.id}/documents`);
    } catch (err) {
      console.error('Erreur lors de la création du dossier:', err);
      
      if (err.response) {
        console.error('Statut de l\'erreur:', err.response.status);
        console.error('Données de l\'erreur:', err.response.data);
        setError(`Erreur ${err.response.status}: ${err.response.data.message || 'Erreur serveur'}`);
      } else if (err.request) {
        console.error('Requête sans réponse:', err.request);
        setError('Aucune réponse reçue du serveur');
      } else {
        console.error('Erreur:', err.message);
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">1</div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">2</div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">3</div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">Créer un nouveau dossier</h1>
        <p className="text-gray-600 mt-2">Étape 1: Informations générales</p>
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Informations personnelles */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations personnelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom et Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.nomDeposant}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Information importée de votre profil</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={formData.prenomDeposant}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Information importée de votre profil</p>
            </div>
            
            {/* ✅ Sexe et Âge ajoutés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <input
                type="text"
                value={formData.sexeDeposant}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Information importée de votre profil</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
              <input
                type="text"
                value={formData.ageDeposant}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Information importée de votre profil</p>
            </div>
            
            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.emailDeposant}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Information importée de votre profil</p>
            </div>
            
            {/* Adresse */}
            <div className="md:col-span-2">
              <label htmlFor="adresseDeposant" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="adresseDeposant"
                name="adresseDeposant"
                value={formData.adresseDeposant}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 rue de l'Exemple, 75000 Paris"
                required
              />
            </div>
            
            {/* Téléphone */}
            <div>
              <label htmlFor="telephoneDeposant" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telephoneDeposant"
                name="telephoneDeposant"
                value={formData.telephoneDeposant}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0612345678"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Format: 9 chiffres sans espaces</p>
            </div>
          </div>
        </div>
        
        {/* Section Type de demande */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Type de demande
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Chargement des types de demande...</span>
            </div>
          ) : (
            <div>
              <label htmlFor="typeDemandeId" className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionnez le type de votre demande <span className="text-red-500">*</span>
              </label>
              <select
                id="typeDemandeId"
                name="typeDemandeId"
                value={formData.typeDemandeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Sélectionnez un type --</option>
                {typesDemandeList.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.libelle} - {type.description || 'Aucune description'}
                  </option>
                ))}
              </select>
              
              {formData.typeDemandeId && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Information :</strong> Après la création du dossier, vous devrez ajouter les documents requis pour ce type de demande dans l'étape suivante.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/deposant/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={submitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Continuer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}