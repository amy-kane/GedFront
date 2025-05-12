// lib/debugAuth.js
export function debugJwt() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Aucun token trouvé');
      return null;
    }
    
    try {
      // Diviser le token en trois parties
      const [header, payload, signature] = token.split('.');
      
      // Décoder le payload (seconde partie)
      const decodedPayload = JSON.parse(atob(payload));
      console.log('Token décodé:', decodedPayload);
      
      // Vérifier l'expiration
      const expTime = decodedPayload.exp * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      if (now > expTime) {
        console.log('⚠️ ERREUR: Le token est expiré depuis', new Date(expTime).toLocaleString());
      } else {
        console.log('✅ Le token est valide jusqu\'au', new Date(expTime).toLocaleString());
      }
      
      // Vérifier le rôle
      if (decodedPayload.role === 'RECEPTIONNISTE') {
        console.log('✅ Le token a le rôle RECEPTIONNISTE');
      } else {
        console.log('⚠️ ERREUR: Le token a le rôle', decodedPayload.role, 'au lieu de RECEPTIONNISTE');
      }
      
      return decodedPayload;
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return null;
    }
  }