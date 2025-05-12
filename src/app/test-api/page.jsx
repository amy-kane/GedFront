// // Créez un fichier de test simple dans votre frontend
// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function TestApi() {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         // Testez un endpoint disponible dans votre API
//         const response = await axios.get('http://localhost:8081/api/users');
//         setData(response.data);
//       } catch (err) {
//         console.error('Erreur de connexion:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
    
//     fetchData();
//   }, []);
  
//   if (loading) return <div>Chargement...</div>;
//   if (error) return <div>Erreur de connexion: {error}</div>;
  
//   return (
//     <div>
//       <h1>Test de l'API</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }