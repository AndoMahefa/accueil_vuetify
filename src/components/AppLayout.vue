<template>
  <v-app class="content">
    <SideBar
      :drawer="drawer"
      :toggle-mini="toggleMini"
      :items="sidebarItems"
      :user-name="userName"
      @toggle-sidebar="toggleSidebar"
    />
    <NavBar @toggle-sidebar="toggleSidebar" />

    <v-main>
      <v-container
        fluid
        class="pa-4"
      >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import SideBar from './SideBar.vue';
import NavBar from './NavBar.vue';

export default {
  components: {
    SideBar,
    NavBar
  },
  data() {
    return {
      drawer: false,
      toggleMini: false,
      serviceName: null,
      userName: 'Rakshith Bellare',
      idService : null,
      role: null,
      itemsMenuUser: [],

      itemsAdmin: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        // Organigramme
        { title: 'Organigramme', icon: 'mdi-sitemap', to: '/home/organigramme' },
        // Services
        { title: "Services",
          icon: "mdi-domain",
          items: [
            { title: "Ajouter un service", to: "/home/ajouter-service" },
            { title: "Liste des services", to: "/home/liste-services" }
          ]
        },
        // Employés
        {
          title: "Employés",
          icon: "mdi-account-group",
          items: [
            { title: "Ajouter un employé", to: "/home/ajouter-employe" },
            { title: "Liste des employés", to: "/home/liste-employes" },
            { title: "Pointage", to: "/home/pointage" },
            { title: "Liste des pointages", to: "/home/liste-pointages" }
          ]
        },
        {
          title: "Visiteurs",
          icon: "mdi-account-group",
          items: [
            { title: "Ajouter un visiteur", to: "/home/enregistrer-visiteur" },
            { title: "Liste des visiteurs", to: "/home/liste-visiteurs" }
          ]
        },
        // PRMP
        {
          title: "Appel d'offre",
          icon: "mdi-file-document",
          items: [
            { title: "Ajout d'un appel d'offre", to: "/home/save-reference" },
            { title: "Liste des appels d'offres", to: "/home/liste-appels" },
            { title: "Remise d'offre", to: "/home/remise-offre" },
            { title: "Liste soumissionaire", to: "/home/liste-soumissionaire" }
          ]
        },

        // Tous les autres services
        { title: "Demande Recu", icon: "mdi-inbox", to: "/home/demande-recu-service" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente"},
        { title: "Disponibilités", icon: "mdi-calendar-clock", to: "/home/jour-creneaux-service" },
        { title: "Calendrier des rdv", icon: "mdi-calendar", to: "/home/rendez-vous" },
      ]
    };
  },
  computed: {
    // Renvoie les items du SideBar selon le service actuel
    sidebarItems() {
      if(this.role === 'admin') {
        return this.itemsAdmin;
      } else {
        this.fetchServiceName()

        return this.transformRolesToMenu(this.itemsMenuUser);
      }
    }
  },
  mounted() {
    this.idService = localStorage.getItem("idService");
    this.role = localStorage.getItem("role");
    if(this.role == 'user') {
      const roles =  localStorage.getItem("roles_utilisateur")
      this.itemsMenuUser = JSON.parse(roles);
      console.log(this.itemsMenuUser)
    }
  },
  methods: {
    transformRolesToMenu(roles) {
      return roles.map(role => ({
        title: role.title,
        icon: role.icon,
        to: role.to || null, // Assure une valeur null si pas de route
        items: role.enfants?.length
          ? this.transformRolesToMenu(role.enfants)
          : []
      }));
    },
    toggleSidebar() {
      this.drawer = !this.drawer;
    },
    async fetchServiceName() {
      const idService = localStorage.getItem('idService'); // Récupère l'idService
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
          this.serviceName = '';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom du service:', error);
        this.serviceName = 'Erreur de Chargement';
      }
    }
  }
};
</script>
