// app/admin/users/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import UserTable from '@/components/UserTable';
import AddUserModal from '@/components/AddUserModal';
import EditUserModal from '@/components/EditUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des utilisateurs');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout de l\'utilisateur');
      }
      
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowAddModal(false);
      toast.success(`L'utilisateur ${newUser.prenom} ${newUser.nom} a été ajouté avec succès.`);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
      }
      
      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Utilisateur supprimé avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (userId, active) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`/api/users/${userId}/actif`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
      }
      
      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === userId ? { ...user, actif: active } : user
      ));
      
      toast.success(`Statut de l'utilisateur ${active ? 'activé' : 'désactivé'} avec succès`);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'utilisateur');
      }
      
      const updatedUser = await response.json();
      
      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      setShowEditModal(false);
      toast.success(`L'utilisateur ${updatedUser.prenom} ${updatedUser.nom} a été mis à jour avec succès.`);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestion des utilisateurs</h1>
        <div className="flex items-center space-x-2">
          {/* <Link 
            href="/admin/dashboard" 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Retour au tableau de bord
          </Link> */}
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Ajouter un utilisateur
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={fetchUsers}
            >
              Réessayer
            </button>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onDelete={handleDeleteUser} 
            onUpdateStatus={handleUpdateStatus}
            onEdit={handleEditUser}
            onRefresh={fetchUsers}
          />
        )}
      </main>
      
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddUser} 
        />
      )}
      
      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => setShowEditModal(false)} 
          onSubmit={handleUpdateUser} 
        />
      )}
    </div>
  );
}