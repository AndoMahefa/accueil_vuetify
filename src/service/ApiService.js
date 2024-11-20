// services/apiService.js

const BASE_URL = 'http://localhost:8000/api'; // Remplacez par votre base URL

// Fonction pour obtenir le token depuis le localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

// Fonction générique pour effectuer une requête GET
async function get(endpoint) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Si non autorisé, déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('idService');
      window.location.href = '/';  // Rediriger vers la page de login
    }

    return response;
  } catch (error) {
    console.error('Erreur de récupération des données:', error);
    throw error;
  }
}

// Fonction générique pour effectuer une requête POST
async function post(endpoint, body) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
        // Si non autorisé, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('idService');
        window.location.href = '/';  // Rediriger vers la page de login
    }  

    return response;
  } catch (error) {
    console.error('Erreur d\'envoi des données:', error);
    throw error;
  }
}

// Fonction générique pour effectuer une requête PUT
async function put(endpoint, body) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
        // Si non autorisé, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('idService');
        window.location.href = '/';  // Rediriger vers la page de login
    }  
  
    return response;
  } catch (error) {
    console.error('Erreur de mise à jour des données:', error);
    throw error;
  }
}

// Fonction générique pour effectuer une requête DELETE
async function del(endpoint) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
        // Si non autorisé, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('idService');
        window.location.href = '/';  // Rediriger vers la page de login
    }  
    
    return response;
  } catch (error) {
    console.error('Erreur de suppression des données:', error);
    throw error;
  }
}

export { get, post, put, del };
