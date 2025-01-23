const BASE_URL = 'http://localhost:8000/api'; // Remplacez par votre base URL

// Fonction pour obtenir le token depuis le localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

function getRole() {
  return localStorage.getItem('role')
}

// Fonction générique pour effectuer une requête GET
async function get(endpoint) {
  const token = getAuthToken();
  const role = getRole();
  const url = `${BASE_URL}/${role === 'admin' ? 'admin' : 'user'}/${endpoint}`;
  try {
    const response = await fetch(url, {
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
  const role = getRole();
  const url = `${BASE_URL}/${role === 'admin' ? 'admin' : 'user'}/${endpoint}`;
  try {
    const response = await fetch(url, {
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
  const role = getRole();
  const url = `${BASE_URL}/${role === 'admin' ? 'admin' : 'user'}/${endpoint}`;
  try {
    const response = await fetch(url, {
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
async function del(endpoint, body = null) {
  const token = getAuthToken();
  const role = getRole();
  const url = `${BASE_URL}/${role === 'admin' ? 'admin' : 'user'}/${endpoint}`;
  try {
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    // Ajouter le body seulement s'il existe
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('idService');
      window.location.href = '/';
    }

    return response;
  } catch (error) {
    console.error('Erreur de suppression des données:', error);
    throw error;
  }
}

export { get, post, put, del };
