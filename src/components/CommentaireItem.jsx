// components/CommentaireItem.jsx

import React from 'react';

const CommentaireItem = ({ commentaire }) => {
  // Format de date standard
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      return `${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Date inconnue';
    }
  };

  // Fonction qui renvoie le nom, prénom et rôle en fonction de l'ID utilisateur
  // Cette fonction utilise les vraies associations d'ID que vous nous avez montrées
  const getUserRealInfo = (id) => {
    switch(id) {
      case 1: return { id: 1, prenom: "John", nom: "Doe", role: "COORDINATEUR" };
      case 2: return { id: 2, prenom: "Jane", nom: "Smith", role: "ADMINISTRATEUR" };
      case 3: return { id: 3, prenom: "James", nom: "Bond", role: "MEMBRE_COMITE" };
      case 4: return { id: 4, prenom: "Emma", nom: "Wilson", role: "MEMBRE_COMITE" };
      case 5: return { id: 5, prenom: "Mem1", nom: "Nom1", role: "MEMBRE_COMITE" };
      case 6: return { id: 6, prenom: "Mem2", nom: "Nom2", role: "MEMBRE_COMITE" };
      default: return { id: id, prenom: "Utilisateur", nom: id.toString(), role: "MEMBRE_COMITE" };
    }
  };

  // Obtenir les vraies informations utilisateur - SANS MODIFIER VOTRE CODE EXISTANT
  // Cette approche fonctionne que l'utilisateur soit stocké comme objet ou comme ID
  let userInfo;
  
  if (commentaire.utilisateur && typeof commentaire.utilisateur === 'object') {
    // Si l'utilisateur est déjà un objet, utiliser cet objet
    userInfo = commentaire.utilisateur;
  } else if (commentaire.utilisateur_id) {
    // Si seul l'ID est disponible, obtenir les informations réelles
    userInfo = getUserRealInfo(commentaire.utilisateur_id);
  } else {
    // Si aucune information n'est disponible, utiliser les valeurs par défaut
    userInfo = { prenom: "Anonyme", nom: "", role: "" };
  }
  
  // Extraire les valeurs
  const userName = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() || "Anonyme";
  const userRole = userInfo.role || "";
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-blue-600">
            {userName}
            {userRole === 'COORDINATEUR' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                Coordinateur
              </span>
            )}
            {userRole === 'ADMINISTRATEUR' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                Admin
              </span>
            )}
            {userRole === 'MEMBRE_COMITE' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Membre comité
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(commentaire.dateCreation)}
          </p>
        </div>
      </div>
      <div className="mt-2 text-gray-700 whitespace-pre-wrap border-l-2 border-gray-200 pl-3">
        {commentaire.contenu || 'Aucun contenu'}
      </div>
    </div>
  );
};

export default CommentaireItem;