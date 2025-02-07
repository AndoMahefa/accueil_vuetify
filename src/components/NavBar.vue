<template>
  <v-app-bar
    app
    flat
    color="#F4F4F4"
    dark
    class="navbar-shadow"
  >
    <!-- Menu hamburger -->
    <v-app-bar-nav-icon @click="toggleSidebar" />

    <!-- Nom du service connecté -->
    <template v-if="serviceName=='Administrateur'">
      <v-toolbar-title class="service-title">
        {{ serviceName }}
      </v-toolbar-title>
    </template>
    <template v-else>
      <!-- Nom du service connecté -->
      <v-toolbar-title class="service-title">
        {{ directionName }} / {{ serviceName }}
      </v-toolbar-title>
    </template>


    <v-spacer />

    <!-- Icône de notifications -->
    <v-btn icon>
      <v-icon>mdi-bell</v-icon>
    </v-btn>

    <!-- Icône de paramètres -->
    <v-btn icon>
      <v-icon>mdi-help-circle</v-icon>
    </v-btn>

    <!-- Dropdown menu for logout -->
    <v-menu
      location="bottom"
      offset-y
    >
      <template
        #activator="{ props }"
      >
        <v-btn
          icon
          v-bind="props"
        >
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list class="menu-dropdown">
        <v-list-item @click="handleLogout">
          <v-list-item-icon>
            <v-icon color="#000">
              mdi-logout
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content class="d-flex align-center">
            <v-list-item-title>
              Déconnexion
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>

export default {
  emits: ['toggle-sidebar'],
  data() {
    return {
      directionName: 'Chargement...',
      serviceName: 'Chargement...' // Valeur par défaut pendant le chargement
    };
  },
  mounted() {
    const direction = localStorage.getItem('direction');
    if(direction) {
      this.directionName = direction.nom;
    }
    this.fetchServiceName();
  },
  methods: {
    async fetchServiceName() {
      const idService = localStorage.getItem('idService'); // Récupère l'idService
      const role = localStorage.getItem("role");
      if(role === 'admin') {
        this.serviceName = 'Administrateur'
        return
      }
      if (!idService) {
        this.serviceName = '';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const idService = localStorage.getItem('idService');
        const response = await fetch(`http://localhost:8000/api/service/${idService}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.serviceName = data.nom || 'Service Inconnu'; // Assurez-vous que l'API retourne un champ `name`
        } else {
          this.serviceName = 'Service Inaccessible';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom du service:', error);
        this.serviceName = 'Erreur de Chargement';
      }
    },
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('idService');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
  .navbar-shadow {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .service-title {
    font-weight: bold;       /* Texte gras */
    margin-left: 8px;        /* Espacement par rapport au menu hamburger */
    color: #2D3E6A;          /* Couleur personnalisée */
    font-size: 18px;         /* Taille du texte */
  }

  .menu-dropdown {
    background-color: #2D3E6A; /* Bleu marine */
    min-width: 120px;
    padding: 0;
  }

  .d-flex {
    display: flex;
    align-items: center;  /* Aligne verticalement l'icône et le texte */
  }

  .v-list-item-icon {
    margin-right: 8px;  /* Espacement entre l'icône et le texte */
  }
</style>
